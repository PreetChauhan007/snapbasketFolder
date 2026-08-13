import Grocery from '@/models/grocery.model'

type OrderItem={grocery:string,quantity:number}

export async function reserveStock(items:OrderItem[]){
  const reserved:OrderItem[]=[]
  for(const item of items){
    const quantity=Number(item.quantity)
    if(!item.grocery || !Number.isInteger(quantity) || quantity<1){
      await restoreStock(reserved)
      return {success:false,message:'Invalid product quantity.'}
    }
    const product=await Grocery.findOneAndUpdate({_id:item.grocery,stock:{$gte:quantity}},{$inc:{stock:-quantity}},{new:true})
    if(!product){
      await restoreStock(reserved)
      return {success:false,message:'One or more products are out of stock or have insufficient quantity.'}
    }
    reserved.push({grocery:item.grocery,quantity})
  }
  return {success:true,reserved}
}

export async function restoreStock(items:OrderItem[]){
  await Promise.all(items.map((item)=>Grocery.findByIdAndUpdate(item.grocery,{$inc:{stock:item.quantity}})))
}

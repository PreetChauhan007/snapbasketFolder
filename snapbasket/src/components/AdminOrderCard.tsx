'use client'
import type { IOrder } from '@/models/order.model'
import React, { useEffect, useState } from 'react'
import {motion} from "motion/react"
import { ChevronDown, ChevronUp, CreditCard, MapPin, Package, Phone, Truck, User, UserCheck } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'
function AdminOrderCard({order}:{order:IOrder}) {

   const[expanded,setExpanded]=useState(false) 
const [status,setStatus]=useState<string>("pending")
const deliveryBoy=order.assignedDeliveryBoy as unknown as {name?:string,mobile?:string} | undefined
const deliveryPhone=deliveryBoy?.mobile?.replace(/\D/g,"")

const statusOptions=["pending","out for delivery"]
const updateStatus=async(orderId:string,status:string)=>{
    try {
        const result=await axios.post(`/api/admin/update-order-status/${orderId}`,{status})
        console.log(result.data)
        setStatus(status)
    } catch (error) {
        console.log(error)
    }
}
useEffect(()=>{
setStatus(order.status)
},[order])

  return (
    <motion.div
    key={order._id?.toString()}
    initial={{opacity:1,y:20}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.4}}
    className='bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition-all '
    >
      <div className='relative flex flex-col gap-4'>
<div className='w-full space-y-1'>
<p className='text-lg font-bold flex items-center gap-2 text-purple-700'>
<Package size={20}/>
Order #{order._id?.toString().slice(-6)}
</p>
{status !== "delivered" && <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
    order.isPaid
    ?"bg-purple-100 text-purple-700 border-purple-300"
    :"bg-red-100 text-red-700 border-red-300"
}`}>
    {order.isPaid?"Paid":"Unpaid"}

</span>
}
<p className='text-gray-500 text-sm'>
    {new Date(order.createdAt!).toLocaleString()}
</p>

<div className='mt-3 space-y-1 text-gray-700 text-sm'>
<p className='flex items-center gap-2 font-semibold'>
    <User size={16} className='text-purple-600'/>
    <span>{order?.address.fullName}</span>
</p>
<p className='flex items-center gap-2 font-semibold'>
    <Phone size={16} className='text-purple-600'/>
    <span>{order?.address.mobile}</span>
</p>
<p className='flex items-center gap-2 font-semibold'>
    <MapPin size={16} className='text-purple-600'/>
    <span>{order?.address.fullAddress}</span>
</p>

</div>
<p className='mt-3 flex items-center gap-2 text-sm text-gray-700'>
    <CreditCard size={16} className='text-purple-600'/>
    <span>{order.paymentMethod==="cod"?"Cash On Delivery":"Online Payment"}</span>
</p>

{deliveryBoy && 
<div className='mt-4 flex w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 sm:p-4'>
    <div className='min-w-0 flex items-center gap-3 text-sm text-gray-700'>
<UserCheck size={18} className='text-blue-600'/>
<div className='min-w-0 font-semibold text-gray-800'>
    <p className='font-semibold text-blue-900'>Delivery partner: {deliveryBoy.name ?? 'Assigned'}</p>
    <p className='text-gray-600 text-xs'>📞 +91 {deliveryBoy.mobile ?? 'Mobile unavailable'}</p>
</div>
    </div>

    {deliveryPhone && (
      <a
        href={`tel:+91${deliveryPhone}`}
        aria-label={`Call delivery partner ${deliveryBoy.name ?? ''}`}
        className='ml-auto inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 sm:px-5 sm:py-2.5 sm:text-sm'
      >
        Call
      </a>
    )}

</div>

}


</div>

<div className='flex flex-col items-start gap-2 md:absolute md:top-0 md:right-0 md:items-end'>
    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
        status==="delivered"
        ?"bg-green-100 text-green-700"
        :status==="pending"
        ?"bg-yellow-100 text-yellow-700"
        :"bg-blue-100 text-blue-700"
    }`}>
{status}
    </span>
{status !== "delivered" && <select className='border border-gray-300 rounded-lg px-3 py-1 text-sm shadow-sm hover:border-purple-400 transition focus:ring-2 focus:ring-purple-500 outline-none'
value={status}
onChange={(e)=>{
  const orderId=order._id?.toString()
  if(orderId){
    updateStatus(orderId,e.target.value)
  }
}}>
    {statusOptions.map(st=>(
        <option key={st} value={st}>{st.toUpperCase()}</option>
    ))}

</select>
}
</div>
      </div>
      <div className='border-t border-gray-200 mt-3 pt-3'>
          <button
          onClick={()=>setExpanded(prev=>!prev)}
          className='w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-purple-700 transition'
          >
              
              <span className='flex items-center gap-2'>
                  <Package  size={16} className='text-purple-600'/>
                  {expanded?"Hide Order Items":`view ${order.items.length} Items`}
              </span>
      {expanded?<ChevronUp size={16} className='text-purple-600'/>:<ChevronDown size={16} className='text-purple-600'/>}
      
          </button>
      
      <motion.div
      initial={{height:0,opacity:0}}
      animate={{
          height:expanded?"auto":0,
          opacity:expanded?1:0,
      }}
      transition={{duration:0.3}}
      className='overflow-hidden'
      >
      <div className='mt-3 space-y-3'>
          {order.items.map((item,index)=>(
              
              <div 
              key={index}
              className='flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition'>
      <div className='flex items-center gap-3'>
      <Image src={item.image} alt={item.name} width={48} height={48}className='rounded-lg object-cover border border-gray-200'/>
      <div>
          <p className='text-sm font-medium text-gray-800'>{item.name}</p>
          <p className='text-xs text-gray-500'>{item.quantity} x {item.unit}</p>
      </div>
      </div>
      <p className='text-sm font-semibold text-gray-800'>₹{Number(item.price)*item.quantity}</p>
      
      
              </div>
          ))}
      
      </div>
      </motion.div>
      
      </div>
      <div className='border-t mt-3 pt-3 flex justify-between items-center text-sm font-semibold text-gray-800'>
      <div className='flex items-center gap-2 text-gray-700 text-sm'>
          <Truck size={16} className='text-purple-600'/>
          <span>Delivery: <span className='text-purple-700 font-semibold'>{status}</span></span>
      </div>
      <div>
          Total: <span className='text-purple-700 font-bold'>₹{order.totalAmount}</span>
      </div>
      </div>
    </motion.div>
  )
}

export default AdminOrderCard

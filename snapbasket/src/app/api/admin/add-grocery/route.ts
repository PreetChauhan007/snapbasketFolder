import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";
import emitEventHandler from "@/lib/emitEventHandler";

export async function POST(req:NextRequest) {
    try {
       await connectDb() 
       const session=await auth()
       if(session?.user?.role!=="admin"){
        return NextResponse.json(
            {message:"your are not an admin"},
            {status:400}
        )
    }
        const formData=await req.formData()

        const name=formData.get("name") as string
        const category=formData.get("category") as string
         const unit=formData.get("unit") as string
          const price=formData.get("price") as string
          const stock=Number(formData.get("stock"))
          const file=formData.get("image") as Blob | null 

          let imageUrl
          if(file){
            imageUrl=await uploadOnCloudinary(file)
          }
          if(!Number.isInteger(stock) || stock<0){
            return NextResponse.json({message:"stock must be a whole number of 0 or more"},{status:400})
          }
          const grocery=await Grocery.create({
            name,price,category,unit,image:imageUrl,stock
          })
          void emitEventHandler("stock-update",{groceryId:grocery._id.toString(),stock:grocery.stock})
          return NextResponse.json(
            grocery,{status:200}
          )
        }
       
    catch (error) {
        return NextResponse.json(
            {message:`add grocery error ${error}`},
            {status:500}
        )
    }
}

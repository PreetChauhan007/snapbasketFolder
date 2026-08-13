import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { reserveStock } from "@/lib/stock";
import emitEventHandler from "@/lib/emitEventHandler";

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req:NextRequest){
const sig=req.headers.get("stripe-signature")
const rawBody=await req.text()
let event;
try {
    event=stripe.webhooks.constructEvent(
        rawBody,sig!,process.env.STRIPE_WEBHOOK_SECRET!
    )
} catch (error) {
    console.log("signature verification failed",error)
}

if(event?.type==="checkout.session.completed"){
const session=event.data.object
await connectDb()
const order=await Order.findById(session.metadata?.orderId)
if(order && !order.isPaid){
    const stockResult=await reserveStock(order.items.map((item:{grocery:{toString:()=>string},quantity:number})=>({grocery:item.grocery.toString(),quantity:item.quantity})))
    if(!stockResult.success){
        return NextResponse.json({message:stockResult.message},{status:409})
    }
    order.isPaid=true
    await order.save()
    void emitEventHandler("stock-update",{items:stockResult.reserved})
}
}
    
return NextResponse.json({recieved:true},{status:200})



} 

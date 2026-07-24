import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/DeliveryAssignment.model";
import Order from "@/models/order.model";
import emitEventHandler from "@/lib/emitEventHandler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDb()
        const {orderId,otp}=await req.json()
        if(!orderId || !otp){
            return NextResponse.json(
                {message:"orderId or OTP not found"},
                {status:400}
            )
        }
        const order=await Order.findById(orderId)
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
if(order.deliveryOtp!==otp){
    return NextResponse.json(
                {message:"Incorrect OTP"},
                {status:400}
            )
}
order.status="delivered"
order.deliveryOtpVerification=true
order.deliveredAt=new Date()
await order.save()

await DeliveryAssignment.updateOne(
    {order:orderId},
    {$set:{assignedTo:null,status:"completed"}}
    )

// All open customer views receive this immediately, so no page refresh is needed.
await emitEventHandler("order-status-update", {
    orderId: order._id.toString(),
    status: order.status,
    deliveredAt: order.deliveredAt.toISOString()
})

return NextResponse.json(
                {message:"Delivery Successfully completed", orderId: order._id, status: order.status, deliveredAt: order.deliveredAt},
                {status:200}
            )
    } catch (error) {
        return NextResponse.json(
                {message:`verify otp error ${error}`},
                {status:500}
            )
    }
}

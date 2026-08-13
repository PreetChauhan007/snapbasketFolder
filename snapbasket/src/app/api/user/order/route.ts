import connectDb from "@/lib/db";
import { auth } from "@/auth";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.models";
import { reserveStock, restoreStock } from "@/lib/stock";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const session=await auth()
        if (!session?.user?.id) {
            return NextResponse.json({message:"unauthorized"},{status:401})
        }
        const {items,paymentMethod,totalAmount,address}=await req.json()
        const userId=session.user.id
        if(!Array.isArray(items) || items.length===0 || !paymentMethod || !totalAmount || !address){
            return NextResponse.json(
                {message:"please send all credentials"},
                {status:400}
            )
        }
        const user=await User.findById(userId)
        if(!user){
            return NextResponse.json(
                {message:"user not found"},
                {status:400}
            )
        }

const stockResult=await reserveStock(items)
if(!stockResult.success){
    return NextResponse.json({message:stockResult.message},{status:409})
}

let newOrder
try {
newOrder=await Order.create({
    user:userId,
    items,
    paymentMethod,
    totalAmount,
    address
})
} catch (error) {
    await restoreStock(stockResult.reserved || [])
    throw error
}

// Notifications must not hold up a successfully created order or its redirect.
void emitEventHandler("new-order",newOrder)

return NextResponse.json(
    newOrder,{status:201}
)
    } catch (error) {
        return NextResponse.json(
            {message:`place order error ${error}`},
            {status:500}
        )
    }
    
}

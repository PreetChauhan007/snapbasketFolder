import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/DeliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,{params}:{params:Promise<{orderId:string}>}) {
    try {
        await connectDb()
        const {orderId}=await params
        const {status}=await req.json()
        const order=await Order.findById(orderId).populate("user")
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
        let deliveryBoysPayload:any=[]
        let deliveryMessage:string | undefined
        if(status==="out for delivery" && !order.assignment){
            const {latitude,longitude}=order.address
        let candidateDeliveryBoys=await User.find({
            role:"deliveryBoy",
            location:{
                $near:{
                    $geometry:{type:"Point",coordinates:[Number(longitude),Number(latitude)]},
                    $maxDistance:5000
                }
            }
        }
        )

        // A delivery partner may not have granted location permission yet.
        // In that case, still broadcast the assignment to online delivery partners.
        if(candidateDeliveryBoys.length===0){
            candidateDeliveryBoys=await User.find({
                role:"deliveryBoy",
                isOnline:true
            })
        }

const nearByIds=candidateDeliveryBoys.map((b)=>b._id)
const busyIds=await DeliveryAssignment.find({
    assignedTo:{$in:nearByIds},
    status:{$nin:["broadcasted","completed"]}
}).distinct("assignedTo")
const busyIdSet=new Set(busyIds.map(b=>String(b)))
const availableDeliveryBoys=candidateDeliveryBoys.filter(
    b=>!busyIdSet.has(String(b._id))
)
const candidates=availableDeliveryBoys.map(b=>b._id)

if(candidates.length==0){
    deliveryMessage="No delivery boy is currently available; the order status was still updated."
} else {
    const deliveryAssignment=await DeliveryAssignment.create({
        order:order._id,
        broadcastedTo:candidates,
        status:"broadcasted"
    })

    await deliveryAssignment.populate("order");
for(const boyId of candidates){
    const boy=await User.findById(boyId)
    if(boy.socketId){
        await emitEventHandler("new-assignment",{deliveryAssignment},boy.socketId)
    }
}
    // A reconnect can leave a stale socketId in the database. Broadcast only a
    // signal as a fallback; each delivery dashboard fetches its own filtered data.
    await emitEventHandler("new-assignment",{})

    order.assignment=deliveryAssignment._id
    deliveryBoysPayload=availableDeliveryBoys.map(b=>({
        id:b._id,
        name:b.name,
        mobile:b.mobile,
        latitude:b.location.coordinates[1],
        longitude:b.location.coordinates[0]

    }))
    await deliveryAssignment.populate("order")
}
        }
order.status=status
await order.save()
await order.populate("user")
 await emitEventHandler("order-status-update",{orderId:order._id,status:order.status})
return NextResponse.json({
    assignment:order.assignment?._id,
    availableBoys:deliveryBoysPayload,
    message:deliveryMessage
},{status:200})
    } catch (error) {
        return NextResponse.json({
            message:`update staus error ${error}`
        },{status:500})
    }
}

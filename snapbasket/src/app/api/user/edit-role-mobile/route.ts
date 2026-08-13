import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDb()
     const {role,mobile}=await req.json()
     const session=await auth()
     if(!session?.user?.email){
        return NextResponse.json({message:"unauthorized"},{status:401})
     }
     if(!["user","deliveryBoy","admin"].includes(role)){
        return NextResponse.json({message:"invalid role"},{status:400})
     }
     if(role==="admin"){
        const existingAdmin=await User.exists({
            role:"admin",
            email:{$ne:session.user.email}
        })
        if(existingAdmin){
            return NextResponse.json(
                {message:"an admin already exists"},
                {status:409}
            )
        }
     }
     const user=await User.findOneAndUpdate({email:session?.user?.email},{role,mobile
     },{new:true})
     if(!user){
        return NextResponse.json(
            {message:"user not found"},
            {status:400}
        )
     }
     return NextResponse.json(
           user,
            {status:200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`edit role and mobile error ${error}`},
            {status:500}
        )
    }
}

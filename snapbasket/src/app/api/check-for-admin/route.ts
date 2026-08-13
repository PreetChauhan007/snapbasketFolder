import connectDb from "@/lib/db";
import User from "@/models/user.models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb()
        const adminExists=await User.exists({role:"admin"})
        return NextResponse.json({adminExist:Boolean(adminExists)})
    } catch (error) {
        return NextResponse.json(
            {message:`check for admin error ${error}`},
            {status:500}
        )
    }
}

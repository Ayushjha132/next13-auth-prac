import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";

connect (); // connect db

export async function POST(request:NextRequest) {
    try {
        const reqBody = await request.json();
        const {token} = reqBody;
        console.log(token);
        
        const user = await User.findOne({verifyToken: token, verifyTokenExpiry: {$gt: Date.now()}}); 
        
        if(!user){
            return NextResponse.json({error: "Invaild token"}, {status: 400})
        }
        console.log(user);

        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({
            message: "Email verified successful",
            success: true
        })

        
    } catch (error: any) {
        console.log("Error");
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
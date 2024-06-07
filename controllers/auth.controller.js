import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
export const register= async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        const hashedPassword=await bcrypt.hash(password,10);
    
        const newUser= await prisma.user.create({
            data:{
                username,
                email,
                password:hashedPassword,
            },
        });
        console.log(newUser);
        res.status(201).json({message:"User created sucessfully!"});
    }catch(er){
        console.log(er);
        res.status(500).json({
            message:"Failed to create user!"
        })
    }
    
}
export const login= async(req,res)=>{
    const {username,password}=req.body;
    try{
    // user exist?
        const user=await prisma.user.findUnique({
            where:{username}
        })
        if(!user) return res.status(401).json({
            message:"Invalid Credentials!"
        })
    // check password
        const isPasswordValid= await bcrypt.compare(password,user.password);
        if(!isPasswordValid) return res.status(401).json({
            message:"Invalid Credentials!",
        })
        // generate cookie token and send user
        const age=1000*60*60*24*7; 
    const token=jwt.sign({
        id:user.id,
        isAdmin:false,
    },process.env.JWT_SECRET_KEY,{expiresIn:age});
    const {password:userPassword,...userInfo} =user;

        res.cookie("token",token,{
            httpOnly:true,
            // secure:true
            maxAge:age,
        }).status(200).json(userInfo);
    }catch(er){
        console.log(er);
        res.status(500).json({
            message:"Failed To Login!"
        })
    }
}
export const logout=(req,res)=>{
    res.clearCookie("token").status(200).json({
        message:"Logout Successful!"
    })
}
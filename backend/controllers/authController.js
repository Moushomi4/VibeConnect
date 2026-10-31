const User = require("../models/Users");
const otpGenerate=require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService=require("../services/twiloService");
const generateToken = require("../utils/generateToken");
const sendOtpToEmail = require("../services/emailService");
const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Conversation= require('../models/Conversation')
// const sendOtpToPhoneNumber = require("../services/twiloService");

// Send otp
const sendOtp=async(req, res)=>{

    const {phoneNumber, phoneSuffix,email}=req.body;
    const otp=otpGenerate();
    const expiry= new Date(Date.now()+5*60*1000);
    let user;
    try{
        if(email){
            user= await User.findOne({email});
        if(!user){
            user=new User({email})
        }
        user.emailOtp=otp;
        user.emailOtpExpiry=expiry;
        await user.save();
        await sendOtpToEmail(email,otp);
        return response(res,200,"Otp sent to your email",{email});
        }
        if(!phoneNumber || !phoneSuffix){
            return response(res,400,"Phone number and phone suffix are required");
        }
        const fullPhoneNumber= `${phoneSuffix}${phoneNumber}`;
        user= await User.findOne({phoneNumber});
        if(!user){
            user= await new User({phoneNumber,phoneSuffix})
        }
        await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);
        await user.save();
        return response(res,200,"Otp sent to your phone",user);
    }catch(error){
        console.log(error);
        return response(res,500,'Intenal Error');
    }
}

// Verify Otp
const verifyOtp=async(req,res)=>{
    const {phoneNumber, phoneSuffix, email, otp}=req.body;
    try{
        let user;
        if(email){
            user= await User.findOne({email});
            if(!user){
                return response(res,404,"user not found");
            }
            const now=new Date();
            if(!user.emailOtp || String(user.emailOtp)!==String(otp) || now> new Date(user.emailOtpExpiry)){
                return response(res,400,"Invalid or Expired Otp");
            };
            user.isVerified=true;
            user.emailOtp=null;
            user.emailOtpExpiry=null;
            await user.save();
        }
        else{
            if(!phoneNumber || !phoneSuffix){
            return response(res,400,"Phone number and phone suffix are required");
        }
        const fullPhoneNumber= `${phoneSuffix}${phoneNumber}`;
        user=await User.findOne({phoneNumber});
        if(!user){
                return response(res,404,"user not found");
        }
        const result= await twilioService.verifyOtp(fullPhoneNumber,otp);
        if(result.status !== 'approved'){
            return response(res,400, 'Invalid Otp');
        }
        user.isVerified=true;
        await user.save();
        }

        const token=generateToken(user?._id);
        res.cookie("auth_token",token,{
            httpOnly:true,
            maxAge:1000*60*60*24*365
        });
        return response(res,200,"Otp verified successfully",{token,user});

    }catch(error){
        console.error(error);
        return response(res,500,'Internal server Error');
    }
};

const updateProfile=async(req,res)=>{
    const {username, agreed, about}=req.body;
    const userId= req.user.userId;

    try{
        const user= await User.findById(userId);
        if (!user) {
            // return response(res, 404, 'User not found');
            console.log("user not found");
        }
        const file=req.file;
        if(file){
            const uploadResult= await uploadFileToCloudinary(file);
            console.log(uploadResult);
            user.profilePicture=uploadResult?.secure_url;
        }else if(req.body.profilePicture){
            user.profilePicture= req.body.profilePicture;  
        }
        if(username){
            user.username=username;
        }
        if(agreed) user.agreed=agreed;
        if(about) user.about=about;
        await user.save();
        // console.log(user);
        return response(res,200,'User profile upload successfully',user);
    }catch(e){
        console.error(e);
        return response(res,500,"Internal server Error");
    }
}

const logout=(req,res)=>{
    try{
        res.cookie("auth_token","",{expires:new Date});
        return response(res,200,"User logout successfully")
    }catch(error){
        console.error(error);
        return response(res,500,"Internal Server Error");
    }
}

const checkAuthenticated=async(req,res)=>{
    try{
        const userId=req.user.userId;
        if(!userId){
            return response(res,404,'unauthorized! please login before access our app')
        }
        const user=await User.findById(userId);
        if(!user){
            return response(res,404,'User not found');
            
        }
        return response(res,200,'user retrieved and allow to use whatsapp',user);
    }catch(error){
        console.error(error);
        return response(res,500,'Internal Server Error');
    }
}

const getAllUsers= async(req,res)=>{
    const loggedInUser=req.user.userId;
    try{
        const users= await User.find({_id:{$ne: loggedInUser}}).select("username profilePicture lastSeen isOnline about phoneNumber phoneSuffix").lean();

        const usersWithConversation= await Promise.all(
            users.map(async(user)=>{
                const conversation= await Conversation.findOne({
                    participants:{$all: [loggedInUser,user?._id]}
                }).populate({
                    path:"lastMessage",
                    select: "content createdAt sender receiver"
                }).lean();
                return{
                    ...user,
                    conversation:conversation || null
                }
            })
        );
        console.log(usersWithConversation)
        return response(res,200,'user retrieved successfully', usersWithConversation);
    }catch(error){
        console.error(error);
        return response(res, 500, "Internal Server Error");
    }
}

module.exports={
    sendOtp,verifyOtp,updateProfile,logout,checkAuthenticated, getAllUsers
}
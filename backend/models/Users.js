const mongoose= require('mongoose');

const userSchema= new mongoose.Schema({
    phoneNumber:{type:String, unique:true, sparse:true},
    phoneSuffix:{type:String, unique:false},
    username:{type:String},
    email:{
        type:String,
        lowercase:true,
        validate:{
            validator:function(value){
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
            },
            message:'Please enter a valid email address'
        },
    },
    emailOtp:{type:String},
    emailOtpExpiry:{type:Date},
    profilePicture:{type:String},
    about:{type:String},
    lastSeen:{type:Date},
    isOnline:{type:Boolean, default:false},
    isVerified:{type:Boolean, default:false},
    agreed:{type:Boolean, default:false},
},{timestamps:true});

// Creating Table
const User=mongoose.model('User',userSchema);
module.exports=User;
const twilio= require('twilio');

const accountSid=process.env.TWILIO_ACCOUNT_SID;
const authToken=process.env.TWILIO_AUTH_TOKEN;
const serviceSid=process.env.TWILIO_SERVICE_SID;
console.log(serviceSid);
const client= twilio(accountSid, authToken);

// send otp to phone number
const sendOtpToPhoneNumber=async(phoneNumber)=>{
    try{
        console.log('sending Otp to phone number');
        if(!phoneNumber){
            throw new Error('Phone number is required.');
        }
        const response= await client.verify.v2.services(serviceSid).verifications.create({
            to:phoneNumber,
            channel:'sms'
        });
        console.log('This is my Otp response',response);
        return response;
    }catch(e){
        console.error(e);
        throw new Error("Failed to send otp");
    }
}

const verifyOtp=async(phoneNumber, otp)=>{
    try{
        console.log('This is my Otp',otp);
        console.log('this is my number',phoneNumber);
        
        const response= await client.verify.v2.services(serviceSid).verificationChecks.create({
            to:phoneNumber,
            code:otp,
        });
        console.log('This is my Otp response',response);
        return response;
    }catch(e){
        console.error(e);
        throw new Error("Otp verification failed");
    }
}

module.exports={
    sendOtpToPhoneNumber,
    verifyOtp
}
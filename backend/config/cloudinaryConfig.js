const multer=require('multer');
const cloudinary= require('cloudinary').v2;
const dotenv= require('dotenv');
const fs= require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY,
});
// console.log(cloudinary.config());

// console.log(process.env.CLOUDINARY_NAME);
// console.log(process.env.CLOUDINARY_API_KEY);
// console.log(process.env.CLOUDINARY_SECRET_KEY);

const uploadFileToCloudinary=(file)=>{
    console.log("Received file:", file);
   const options={
    resource_type: file.mimetype.startsWith('video')?'video':'image',
   }   
   return new Promise((resolve,reject)=>{
    const uploader= file.mimetype.startsWith('video')?cloudinary.uploader.upload_large:cloudinary.uploader.upload;
    uploader(file.path, options,(error, result)=>{
        fs.unlink(file.path,()=>{})
        if(error){
            console.log(error);
    console.log(error.message);
    console.log(error.http_code);
            return reject(error);
        }
        resolve(result);
    })
   })
};

const multerMiddleware= multer({dest:'uploads/'}).single('media');

module.exports={
    uploadFileToCloudinary,
    multerMiddleware
}
const mongoose = require('mongoose');

const connectDb= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connect to MongoDb');
    }catch(error){
        console.log('error connecting to MongoDb',error.message);
        process.exit(1);
    }
}

module.exports= connectDb;
const mongoose=require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

console.log("from mongodb connection",process.env.mongoDb_atlas_key)

function connectDb(){
    const connect=mongoose.connect(process.env.mongoDb_atlas_key);
    connect 
    .then(()=>{
      console.log("Mongodb server is connected");
    })
    .catch((error)=>{
      console.log("Mongodb is not connected",error);
    })
  }

  module.exports={
    connectDb
  }
const mongoose=require('mongoose');
const dotenv=require('dotenv')

function connectDb(){
    const connect=mongoose.connect(process.env.mongoDb_atlas_key);
    connect 
    .then(()=>{
      console.log("Mongodb server is connected");
    })
    .catch(()=>{
      console.log("Mongodb is not connected");
    })
  }

  module.exports={
    connectDb
  }
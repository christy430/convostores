const mongoose = require("mongoose");

const category = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_listed:{
        type:Boolean,
        default: true,
    },
    categoryAddDate: {
        type: Date,
        default: Date.now, // Store the current date and time when the user is created
    },
    discountStatus:{
        type:Boolean,
        default:false
      },
      discount:String,
      discountStart:Date,
      discountEnd:Date,
});

module.exports=mongoose.model("category",category)
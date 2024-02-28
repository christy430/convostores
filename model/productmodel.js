const mongoose = require('mongoose');

const product = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:[{
        type:String,
        required:true
    }],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    sizes:[
        {
            size:String,
            stock:Number
        }
    ],
    is_listed:{
        type:Boolean,
        default:true
    }
});

module.exports=mongoose.model('product',product)
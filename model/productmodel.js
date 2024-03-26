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
    },
    discountPrice: {
    type: Number,
    },
    discountStatus:{
      type:Boolean,
      default:false
    },
    discount:Number,
    discountStart:Date,
    discountEnd:Date,   
});

module.exports=mongoose.model('product',product)
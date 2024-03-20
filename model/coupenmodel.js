const mongoose= require('mongoose');

const CoupenSchema= new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
    },
    discount:{
        type:Number,
        required:true,
    },
    limit:{
        type:Number,
        required:true,
    },
    expiry:{
        type:Date,
        required:true,
    },
    minAmount:{
        type:Number,
        required:true,
    },
    maxAmount:{
        type:Number,
        erquired:true,
    },

    usersUsed:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        },
    ],
    is_listed:{
        type:Boolean,
        default:true,
    },

    createdDate:{
        type:Date,
        default:Date.now,
    },
});

module.exports= mongoose.model('Coupon',CoupenSchema)
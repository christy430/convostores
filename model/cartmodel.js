const mongoose = require('mongoose')

const cartitem= new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    size:{
        type:Number
    }
})

const cart= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[cartitem],
    total:{
        type:Number,
        default:0
    },
    date:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})

module.exports = mongoose.model('cart',cart)
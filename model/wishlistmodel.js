const mongoose = require('mongoose')

const wishlistitem= new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required:true
    },
    size:{
        type:Number
    }
})

const wishlist= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[wishlistitem],
    date:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})

module.exports = mongoose.model('wishlist',wishlist)
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  coupon: {
      type:String,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  shipping:{
    type:String,
    default:'Free Shipping'
  },
  totalAmount :{
    type:Number,
    required:true, // Corrected typo
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      price: Number,
      size:Number,
      status: {
        type: String,
        default: 'pending',
      },
      reason:{
        type:String
      },
      paymentMethod: {
        type:String,
        required:true,
      },
      paymentStatus:{
        type:String,
        default:'Pending'
      },
    },
  ],
});

module.exports = mongoose.model('Order', orderSchema);

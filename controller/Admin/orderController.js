const Product= require("../../model/productmodel");
const Category = require('../../model/categorymodel');
const User= require("../../model/usermodel");
const Address = require("../../model/addressmodel");
const Cart=require("../../model/cartmodel");
const Order=require("../../model/ordermodel")

const loadorders= async(req,res)=>{
    try{
        const admin= req.session.adminData;
        const page=parseInt(req.query.page)||1;
        const limit=6;
        const totalCount = await Order.countDocuments();

    const totalPages = Math.ceil(totalCount / limit);
    
  
      const orders = await Order.find()
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "product",
        }).skip((page - 1) * limit)
        .limit(limit)

        res.render('./admin/order',{order:orders,totalPages,currentPage:page});
    }catch(error){
        console.log(error);
    }
}

const listOrderDetails=async(req,res)=>{

    try {
 
      const orderId = req.query.id;

      const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "product",
      })
 console.log(order,"order");
 let orderData=order
  res.render("admin/orderdetails", { order:orderData });
    } catch (error) {
      console.log(error.message);
    }
  

}

const orderStatusChange = async (req, res) => {
    try {
  
      const orderId = req.query.id;
      const {status,productId}=req.body
      const order = await Order.findOne({ _id: orderId })
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "product",
        });
 
  console.log(order,"orderorder");



  const product = order.items.find(
    (item) => item.product._id.toString() === productId
  );

  if (product) product.status = status;
  if (product.status=='Delivered') product.paymentStatus = 'success';
   

  
  const updateData = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        items: order.items,
        
      },
    },
    { new: true }
  );
    
  

      return res.status(200).json({success: true, message: "Order status change successfully" });
   
  
    } catch (error) {
      return res
      .status(500)
      .json({ error: "An error occurred while change status the order" });
  
    }
  }; 

module.exports={
    loadorders,
    listOrderDetails,
    orderStatusChange
}
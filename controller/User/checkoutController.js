const product= require("../../model/productmodel");
const category = require('../../model/categorymodel');
const User= require("../../model/usermodel");
const Cart=require('../../model/cartmodel');
const address = require("../../model/addressmodel");
const Order=require("../../model/ordermodel");
const Coupon= require("../../model/coupenmodel");
const Wallet= require("../../model/walletmodel");
const razorPay= require('razorpay');
require('dotenv').config()
const{ calculateProductTotal,calculatesubtotal, calculateDisountedTotal}=require("../../config/cartsum");

var instance= new razorPay({
    key_id:"rzp_test_JzsmYTfT9IMez0",
    key_secret:"hz6IZ2kNINTlW3pwEjqin9c5",
});


const loadcheckout= async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const usercart = await Cart.findOne({ user: userId })
            .populate({
                path: "items.product",
                model: "product",
            })
            .exec();
    
        if (usercart) {
            const cart = usercart ? usercart.items : [];
    
            const subtotal = calculatesubtotal(cart);
    
            const productTotal = calculateProductTotal(cart);
    
            const subtotalwithshipping = subtotal;
    
            let outofstockerror = false;
            
            const addressData=await address.find({user:userId});
    
            if (cart.length > 0) {
                for (const cartitem of cart) {
                    const product = cartitem.product;
    
                    if (product.quantity < cartitem.quantity) {
                        outofstockerror = true;
                        break;
                    }
                }
            }
    
            let maxquantityerror = false;
    
            if (cart.length > 0) {
                for (const cartitem of cart) {
                    if (cartitem.quantity > 2) {
                        maxquantityerror = true;
                        break;
                    }
                }
            }
            const currentDate=new Date();

            const coupon = await Coupon.find({
                expiry: { $gt: currentDate },
                is_listed: true,
              }).sort({ createdDate: -1 });
    
            res.render('./user/checkout', { user:userId,userData,addressData, productTotal,subtotalWithShipping: subtotalwithshipping, outofstockerror, maxquantityerror, cartData:usercart,cart:cart,coupon });
        }
    } catch (error) {
        console.log(error);
    }
}  

const postcheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { address, paymentMethod,couponCode } = req.body;
        console.log(paymentMethod,"mhvjkdhfjh");
        const userData = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: "items.product",
                model: "product",
            })
            .populate("user");
        console.log(cart,"hjjhgjhghjghjgjbmnjk");
        if (!userData || !cart) {
            console.log("hello from !userData || !cart")
            return res.status(500).json({ success: false, error: "User or cart not found" });
        }

        if (!address) {
            console.log("hello !address")
            return res.status(400).json({ error: "Billing address not selected" });
        }

        const cartItems = cart.items || [];
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            console.log("in for loop")

            product?.sizes.map((size) => {
                if (size.size == cartItem.size) {
                    size.stock -= cartItem.quantity;
                }
            });

            await product.save();
        }

        let totalAmount = cartItems.reduce((acc, item) => {
            if (item.product.discountPrice && item.product.discountStatus &&
              new Date(item.product.discountStart) <= new Date() &&
              new Date(item.product.discountEnd) >= new Date()) {
              return acc + (item.product.discountPrice * item.quantity || 0);
            } else {
              return acc + (item.product.price * item.quantity || 0);
            }
          }, 0);

        if(couponCode){
            totalAmount = await couponAplly(couponCode, totalAmount, userId);
        }

        if (paymentMethod == "onlinePayment") {
            console.log("in razorpay")
            const order = new Order({
              user: userId,
              address: address,
              coupon: couponCode,
              orderDate: new Date(),
              deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
              totalAmount: req.body.amount,
              items: cartItems.map((cartItem) => ({
                product: cartItem.product._id,
                quantity: cartItem.quantity,
                size: cartItem.size,
             
                price:cartItem.product.discountPrice &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discountPrice:cartItem.product.price,
                status: "Confirmed",
                paymentMethod: "Online Payment",
                paymentStatus: "success",
              })),
            });
            console.log(order,"from razorpay controller");
            await order.save();
    

        }else if(paymentMethod == "CashOnDelivery") {
            console.log("in cash on delivery if ")
            const order = new Order({
                user: userId,
                address: address,
                orderDate: new Date(),
                deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
                totalAmount: totalAmount,
                coupon:couponCode,
                items: cartItems.map((cartItem) => ({
                    product: cartItem.product._id,
                    quantity: cartItem.quantity,
                    size: cartItem.size,
                    price: cartItem.product.discountPrice && cartItem.product.discountStatus &&
                        new Date(cartItem.product.discountStart) <= new Date() &&
                        new Date(cartItem.product.discountEnd) >= new Date() ?
                        cartItem.product.discountPrice : cartItem.product.price,
                    status: "Confirmed",
                    paymentMethod: paymentMethod,
                    paymentStatus: 'pending'
                })),
            });
            console.log(order,"order")
            await order.save();
        } else if(paymentMethod=="Wallet"){
            const walletData= await Wallet.findOne({user:userId});

            if(totalAmount<=walletData.walletBalance){
                walletData.walletBalance-=totalAmount;
                walletData.transaction.push({
                    type:"debit",
                    amount:totalAmount,
                });
                await walletData.save();
                const order = new Order({
                    user: userId,
                    address: address,
                    orderDate: new Date(),
          
                    deliveryDate: new Date(
                      new Date().getTime() + 5 * 24 * 60 * 60 * 1000
                    ),
                    totalAmount: totalAmount,
                    coupon: couponCode,
                    items: cartItems.map((cartItem) => ({
                      product: cartItem.product._id,
                      quantity: cartItem.quantity,
                      size: cartItem.size,
                      price:cartItem.product.discountPrice &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discountPrice:cartItem.product.price,
                  
                      status: "Confirmed",
                      paymentMethod: paymentMethod,
                      paymentStatus: "success",
                    })),
                  });
                
          
                  await order.save();
            }else{
                return res
                .status(500)
                .json({success:false,error:"Insufficent Balance"})
            }
        }

        cart.items = []; // Clearing items
        cart.totalAmount = 0; // Resetting totalAmount

        await cart.save(); // Save the updated cart

        res.status(200).json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const laoadOrderdetails= async(req,res)=>{
    try{
        const userId= req.session.user_id;
        const userData= await User.findById(userId);
        const page= parseInt(req.query.page) || 1;
        let query={};
        const limit=6;
        const totalCount= await Order.countDocuments({user:userData._id});
        const totalPages= Math.ceil(totalCount/limit);
        const order= await Order.find({user:userData._id})
        .populate("user")
        .populate({
            path:"items.product",
            model:"product",
        }).sort({orderDate:-1}).skip((page-1)*limit)
        .limit(limit);
        let orderData= order
        if(userData){
            res.render('user/order',{user:userData,order:orderData,totalPages,currentPage:page});
        }else{
            res.redirect('/login');
        }
    }catch(error){
        console.log(error);
    }
}

const orderdetails= async(req,res)=>{
    try{
        // console.log("jghgkh");
        const userId= req.session.user_id;
        const orderId= req.params.id;
        // console.log(orderId,"jghgkh");

        const userData=await User.findById(userId);
        const order= await Order.findById(orderId)
        .populate("user")
        .populate({
            path:"address",
            model:"Address",
        })
        .populate({
            path:"items.product",
            model:"product",
        });

        res.render("user/orderdetails",{user:userData,order});
        
    }catch(error){
        console.log(error);
    }
}

const cancelorder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const { reason, productId } = req.body;

        const order = await Order.findOne({ _id: orderId })
            .populate("user")
            .populate({
                path: "address",
                model: "Address"
            })
            .populate({
                path: "items.product",
                model: "product"
            });

        const user_id = order.user._id;
        let totalAmount = order.totalAmount;

        const product = order.items.find(
            (item) => item.product._id.toString() === productId
        );

        if (product && product.product) {
            if (product.status === "Confirmed") {
                product.product.sizes.forEach((size) => {
                    if (size.size === product.size.toString()) {
                        size.stock += product.quantity;
                    }
                });
                await product.product.save();
            }
        } else {
            product.paymentStatus = "Declined";
        }

        product.status = "Cancelled";
        product.reason = reason;

        totalAmount = totalAmount - ((product.price * product.quantity)  / 100);

        const updateData = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    items: order.items,
                    totalAmount
                },
            },
            { new: true }
        );

        return res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while cancelling the order" });
    }
};


const returnOrder= async(req,res)=>{
        
        const orderId= req.query.id;
        const {reason,productId}=req.body;

        const order= await Order.findOne({_id:orderId})
        .populate("user")
        .populate({
            path:"address",
            model:"Address",
        })
        .populate({
            path:"items.product",
            model:"product",
        });
        console.log(order,"order from return order")
        const couponData = await Coupon.findOne({code:order.coupon});
        const user_id= order.user._id;
        console.log(user_id,"user iD from return order")
        let totalAmount= order.totalAmount;

        const product = order.items.find((item)=>item.product._id.toString()=== productId);
        // console.log(product," productId from return order")

        if(product && product.product){
            if(product.status ==="delivered"){
                product.product.sizes.forEach((size)=>{
                    if(size.size===product.size.toString()){
                        size.stock+=product.quantity;
                    }
                });
                await product.product.save();
            }
            const walletData = await Wallet.findOne({user:user_id});

            if(walletData){
                walletData.walletBalance+=product.price*product.quantity;
   
                walletData.transaction.push({
                  type: "credit",
                  amount:product.price * product.quantity
                });

                await walletData.save();
                // console.log(walletData,"walletData from return Order")
            }else{
                const wallet = new Wallet({
                    user: user_id,
                    transaction:[{type:"credit",amount: product.price * product.quantity}],
                    walletBalance:  product.price * product.quantity
                });
            
                await wallet.save();
                }
            
            
                product.status = "Returned";
                product.paymentStatus = "Refunded";
                product.reason = reason;
                totalAmount =totalAmount -(product.price * product.quantity)- (product.price * product.quantity)/100;
            
              }
            
              await order.save();
            
              res.status(200).json({ success: true, message: "return sucessfully" });
};

const  apllyCoupon= async(req,res)=>{
    try{
        const {couponCode}=req.body;
        const userId=req.session.user_id;
        const coupon= await Coupon.findOne({code:couponCode});

        let errorMessage;

        if(!coupon){
            errorMessage="Coupon not Found";
            return res.json({errorMessage});
        }

        const currentDate= new Date();

        if(coupon.expiry && currentDate>coupon.expiry){
            errorMessage="Coupon Expired";
            return res.json({errorMessage});
        }

        if(coupon.usersUsed.includes(userId)){
            errorMessage="You have already used this Coupon";
            return res.json({errorMessage});
        }

        const cart = await Cart.findOne({user:userId})
        .populate({
            path:"items.product",
            model:"product"
        })
        .exec();

        const cartItems= cart.items || [];
        const orderTotal=  calculatesubtotal(cartItems);

        if(coupon.minAmount>orderTotal){
            errorMessage="The amount is less than minimum amount";
            return res.json({errorMessage});
        }

        let discountedTotal=0;


        if(coupon.maxAmount<orderTotal){
            errorMessage="The Discont cannot be applied. It is beyond maximum amount";
            return res.json({errorMessage});
        }
        discountedTotal= calculateDisountedTotal(orderTotal,coupon.discount);

            res.status(200).json({success:true,discountedTotal,message:"return sucessfully"});
        

    }catch(error){
        res.status(500).json({errorMessage:"Internal Server error"})
    }
}

async function couponAplly(couponCode,discountedTotal,userId){
    console.log(couponCode,"kjhjjhjhjkjhhgjkjkh");
    const coupon = await Coupon.findOne({code:couponCode});
    if(!coupon){
        return discountedTotal;
    }

    const currentDate= new Date();
    if(currentDate>coupon.expiry){
        return discountedTotal;
    }

    if(coupon.usersUsed.length>=coupon.limit){
        return discountedTotal;
    }

    if(coupon.usersUsed.includes(userId)){
        return discountedTotal;
    }

    discountedTotal= calculateDisountedTotal(
        discountedTotal,
        coupon.discount
    );

    coupon.limit--;
    coupon.usersUsed.push(userId);
    await coupon.save();
    console.log(discountedTotal,"jjjj");
    return discountedTotal;
}

const razorPayOrder= async(req,res)=>{
    try{
        // console.log("from razorpayorder function")
        const userId= req.session.user_id;
        // console.log(req.body,"gkjgkjfgkjfgkjfk",userId);
        const{address,paymentMethod,couponCode}=req.body;
        const user= await User.findById(userId);

        const cart= await Cart.findOne({user:userId})
        .populate({
            path:"items.product",
            model:"product",
        })
        .populate("user");

        if(!user||!cart){
            return  res
            .status(500)
            .json({success:false,error:"User or Cart  not Found"});
        }

        if(!address){
            return res.status(400).json({error:"Billing address not selected"});
        }

        const cartItems=cart.items||[];
        let totalAmount=0;
        totalAmount=cartItems.reduce((acc,item)=>acc+(item.product.discountPrice?item.product.discountPrice* item.quantity:item.product.price * item.quantity || 0),0);

        totalAmount = cartItems.reduce((acc, item) => {
            if (item.product.discountPrice && item.product.discountStatus &&
              new Date(item.product.discountStart) <= new Date() &&
              new Date(item.product.discountEnd) >= new Date()) {
              return acc + (item.product.discountPrice * item.quantity || 0);
            } else {
              return acc + (item.product.price * item.quantity || 0);
            }
          }, 0); 
        //   console.log(totalAmount,"from razorpay order",couponCode)
        // const cartItems = cart.items || [];
        // let totalAmount = 0;
        //  totalAmount = cartItems.reduce(
        //   (acc, item) => acc + (item.product.price * item.quantity || 0),
        //   0
        // );
    
          if(couponCode){
            totalAmount= await couponAplly(couponCode,totalAmount,userId);
            console.log(totalAmount,"from razorpay order")

          }


          const options={
            amount:Math.round(totalAmount*100),
            currency:"INR",
            receipt:`order_${Date.now()}`,
            payment_capture:1,
          }
        //   console.log(options,"hjhgjfhf");
          instance.orders.create(options, async (err, razorpayOrder) => {
            if (err) {
              console.error("Error creating Razorpay order:", err);
              return res
                .status(400)
                .json({ success: false, error: "Payment Failed", user });
            } else {
              res.status(201).json({
                success: true,
                message: "Order placed successfully.",
                order: razorpayOrder,
              });
            }
          });
        } catch (error) {
          return res.status(400).json({ success: false, error: "Payment Failed" });
        }
};

module.exports={
    loadcheckout,
    postcheckout,
    laoadOrderdetails,
    orderdetails,
    cancelorder,
    returnOrder,
    apllyCoupon,
    razorPayOrder
}
const product= require("../model/productmodel");
const category = require('../model/categorymodel');
const User= require("../model/usermodel");
const Cart=require('../model/cartmodel');
const address = require("../model/addressmodel");
const Order=require("../model/ordermodel");
const{ calculateProductTotal,calculatesubtotal}=require("../config/cartsum");

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
    
            res.render('./user/checkout', { user:userId,userData,addressData, productTotal, subtotalwithshipping, outofstockerror, maxquantityerror, cartData:usercart,cart:cart });
        }
    } catch (error) {
        console.log(error);
    }
}  

const postcheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { address, payMethod } = req.body;
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
            const price = item.product.discountPrice && item.product.discountStatus &&
                new Date(item.product.discountStart) <= new Date() &&
                new Date(item.product.discountEnd) >= new Date() ?
                item.product.discountPrice : item.product.price;

            return acc + (price * item.quantity || 0);
        }, 0);

        if (payMethod == "CashOnDelivery") {
            console.log("in cash on delivery if ")
            const order = new Order({
                user: userId,
                address: address,
                orderDate: new Date(),
                deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
                totalAmount: totalAmount,
                items: cartItems.map((cartItem) => ({
                    product: cartItem.product._id,
                    quantity: cartItem.quantity,
                    size: cartItem.size,
                    price: cartItem.product.discountPrice && cartItem.product.discountStatus &&
                        new Date(cartItem.product.discountStart) <= new Date() &&
                        new Date(cartItem.product.discountEnd) >= new Date() ?
                        cartItem.product.discountPrice : cartItem.product.price,
                    status: "Confirmed",
                    paymentMethod: payMethod,
                    paymentStatus: 'pending'
                })),
            });
            console.log(order,"order")
            await order.save();
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
        console.log("jghgkh");
        const userId= req.session.user_id;
        const orderId= req.params.id;
        console.log(orderId,"jghgkh");

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


module.exports={
    loadcheckout,
    postcheckout,
    laoadOrderdetails,
    orderdetails,
    cancelorder
}
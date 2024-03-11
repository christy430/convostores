const product= require("../model/productmodel");
const category = require('../model/categorymodel');
const user= require("../model/usermodel");
const Cart=require('../model/cartmodel');
const address = require("../model/addressmodel");
const{ calculateProductTotal,calculatesubtotal}=require("../config/cartsum");

const loadcheckout= async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await user.findById(userId);
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
    
            res.render('./user/checkout', { userData, productTotal, subtotalwithshipping, outofstockerror, maxquantityerror, cart });
        }
    } catch (error) {
        console.log(error);
    }
}  
module.exports={
    loadcheckout
}
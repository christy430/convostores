const Product= require("../../model/productmodel");
const User= require("../../model/usermodel");
const Wishlist= require("../../model/wishlistmodel");
const Cart= require('../../model/cartmodel');

const loadWishlist = async(req,res)=>{
    try{
        const userId= req.session.user_id;
        const userData= await User.findById(userId);
        const userWishlist= await Wishlist.findOne({user:userId}).populate("items.product")
        const wishlistitems=userWishlist?userWishlist.items:[];
        const wishlist= await Wishlist.find({user:userId});
        const cartcount= await Cart.find({user:userId});
        const product= await Product.find({user:userId});

        res.render("./user/wishlist",{user:userData,Wishlist:wishlistitems,wishlist,cartcount,product});
    }catch(error){
        console.log(error);
    }
}

const addToWishlist= async(req,res)=>{
    try{
        const userId= req.session.user_id;
        const productId= req.body.productId;

        let userWishlist= await Wishlist.findOne({user:userId});

        if(!userWishlist){
            userWishlist= new Wishlist({
                user:userId,
                items:[
                    {product:productId}
                ]
            })
            await userWishlist.save();
        }else{
            const existingWishlistitem= userWishlist.items.find((item)=>item.product.toString()===productId);
            if(existingWishlistitem){
                return res.status(400).json({success:false,error:"The product is already in Wishlist"})
            }else{
                userWishlist.items.push({product:productId})
                await userWishlist.save()
            }
        }
        res.status(200).json({success:true,message:"Product is added to Wishlist"})
    }catch(error){
        console.log(error);
    }
}

const removeWishlist= async(req,res)=>{
    try{
        const userId = req.session.user_id
        const productId = req.query.productId

        const existingWishlist = await Wishlist.findOne({user:userId})

        if(existingWishlist){
            const updatedItems = existingWishlist.items.filter(
                (item)=> item.product.toString()!==productId
            )
            existingWishlist.items = updatedItems
            await existingWishlist.save()
            res.json({ success: true, toaster: true });

        }else{
            res.json({ success: false, error: "wishlist not found" });
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, error:"internal server error"})
    }
}

module.exports={
    loadWishlist,
    addToWishlist,
    removeWishlist
}
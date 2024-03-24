const product= require("../../model/productmodel");
const User= require("../../model/usermodel");
const wishlist= require("../../model/wishlistmodel");

const loadWishlist = async(req,res)=>{
    try{
        const userId= req.session.user_id;
        const userData= await User.findById(userId);
        res.render("./user/wishlist",{user:userData});
    }catch(error){
        console.log(error);
    }
}

module.exports={
    loadWishlist
}
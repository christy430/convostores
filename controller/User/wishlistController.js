const product= require("../../model/productmodel");
const User= require("../../model/usermodel");
const wishlist= require("../../model/wishlistmodel");

const loadWishlist = async(req,res)=>{
    try{
        res.render("./user/wishlist",{user:null});
    }catch(error){
        console.log(error);
    }
}

module.exports={
    loadWishlist
}
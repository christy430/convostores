const User= require('../../model/usermodel');
const Category= require('../../model/categorymodel');
const Product=require('../../model/productmodel');

const loadAllCategory= async(req,res)=>{
    try{
        const products= await Product.find();
        const categories= await Category.find();
        res.render("./user/allcategory",{user:null,products,categories});
    }catch(error){
        console.log(error);
    }
}
const loadMensCategory= async(req,res)=>{
    try{
        res.render("./user/mensCategory",{user:null});
    }catch(error){
        console.log(error);
    }
}

const loadWomensCategory= async(req,res)=>{
    try{
        res.render("./user/womensCategory",{user:null});
    }catch(error){
        console.log(error);
    }
}

const loadkidsCategory= async(req,res)=>{
    try{
        res.render("./user/kidsCategory",{user:null});
    }catch(error){
        console.log(error);
    }
}


module.exports={
    loadAllCategory,
    loadMensCategory,
    loadWomensCategory,
    loadkidsCategory
}
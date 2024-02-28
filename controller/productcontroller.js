const product= require("../model/productmodel");
const category= require('../model/categorymodel');
const user= require("../model/usermodel");
const path=require("path");
const sharp = require("sharp");

const loadproducthome= async(req,res)=>{
    try{
        // const product= await product.find();
        const categories= await category.find();
        res.render('./admin/product',{categories});
    }catch(error){
        console.log(error);
    }
}

const loadproduct=async(req,res)=>{
    try{
        const userdata= await user.findById({_id:req.session.admin_id});
        let categories=await category.find({});
        console.log(categories);
        res.render('./admin/addproduct',{categories,admin:userdata});
    }catch(error){
        console.log(error);
    }
}

const addproduct= async(req,res)=>{
    try{
        const imagedata=[];
        const imagefiles=req.files;

        for(const file of imagefiles){
            const randominteger =Math.floor(Math.random()*20000001);
            const imagedirectory=path.join(
                "public",
                "assets",
                "imgs",
                "productIMG"
            );
            const imgfilename="cropped"+randominteger+".jpg";
            const imagepath=path.join(imagedirectory,imgfilename);

            const croppedimage=await sharp(file.path)
            .resize(440,337,{
                fit:"cover",
            })
            .toFile(imagepath);

            if(croppedimage){
                imagedata.push(imgfilename);
            }
        }
        const{
            name,
            category,
            price,
            description,
            
        }=req.body;
        const sizedata=req.body.sizes;
        const existingproduct= await product.findOne({
            name:{$regex: new RegExp(`${name}$`,"i")},
        });
        let categories = await category.find({});
        if (existingproduct) {
            res.render("admin/addproduct", {
              error: "Product with the same name already exists",
              product: existingproduct,
              gender,
              brands,
              categories,
            });
          }
          const addProducts = new product({
            name,
            category,
            price,
            description,
            sizes: sizedata,
            image: imagedata,
          });
      
          await addProducts.save();
          res.redirect("/admin/product");
        } catch (error) {
      console.log(error.message);
          res.status(500).send("Error while adding product");
        }
};



module.exports={
    loadproducthome,
    loadproduct,
    addproduct
}
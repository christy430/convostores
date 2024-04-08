const product= require("../../model/productmodel");
const category = require('../../model/categorymodel');
const user= require("../../model/usermodel");
const path=require("path");
const sharp = require("sharp");

const loadproducthome= async(req,res)=>{
    try{
        const products= await product.find();
        const categories= await category.find();
        res.render('./admin/product',{categories,products});
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
            Category,
            price,
            description,
            
        }=req.body;
        console.log(req.body.Category)
        const sizedata=req.body.sizes;
        const existingproduct= await product.findOne({
            name:{$regex: new RegExp(`${name}$`,"i")},
        });

        let categories = await category.find();

        if (existingproduct) {
            res.render("admin/addproduct", {
              error: "Product with the same name already exists",
              product: existingproduct,
              brands,
              categories,
            });
          }
          console.log("ngmggh");
          const addProducts = new product({
            name,
            category:Category,
            price,
            description,
            sizes: sizedata,
            image: imagedata,
          });
      
          await addProducts.save();
          console.log("ngmgghkhjh90909");
          res.redirect("/admin/product");
        } catch (error) {
      console.log(error.message);
          res.status(500).send("Error while adding product");
        }
};

const deleteProduct=async(req,res)=>{
    try{
        const id= req.params.id;
        const productvalue= await product.findById(id);

        if(productvalue.is_listed){
            const productdata= await product.findByIdAndUpdate(
                {_id:id},
                {
                    $set:{
                        is_listed:false,
                    },
                }
            );
        }else{
            const productdata= await product.findByIdAndUpdate(
                {_id:id},
                {
                    $set:{
                        is_listed:true,
                    },
                }
            );
        }
        res.redirect('/admin/product');
    }catch(error){
        console.log(error);
    }
};

const editproducthome= async(req,res)=>{
    try{
        console.log("hello from editproducthome")
        const id= req.query.id;
        let Product = await product.findOne({_id:id});
        let categories = await category.find({});
        // console.log(Product,"juyhuu");
        if(Product){
            // console.log("hello from product if block",product)
            res.render('admin/editproduct',{categories,product:Product});

        }else{
            // console.log("hello from product else block")
            res.redirect('/admin/product');
        }
    }catch(error){
        console.log(error);
    }
}

const editproduct= async (req,res)=>{
    try{
        // console.log("hello from editproduct")
        const Product = await product.findOne({_id:req.body.product_id});
        // console.log(Product)
        let images=[];
        let deletedata=[];

        const{
            name,
            Category,
            price,
            description
        }=req.body;
        const existingproduct = await product.findOne({name:{$regex:new RegExp(`^${name}$`,"i")},
        });

        let categories = await category.find({});
        const sizedata=req.body.sizes;
        if(req.body.deletecheckbox){
            // deletedata.push(req.body.deletecheckbox);
            // deletedata= deletedata.flat().map((x)=>Number(x));
            // images= Product.image.filter((img,idx)=>!deletedata.includes(idx));
            const imagesToDelete = req.body.deletecheckbox;
            
            if (imagesToDelete.length < Product.image.length) {
                
                deletedata.push(imagesToDelete);
                deletedata = deletedata.flat().map(x => Number(x));
                images = Product.image.filter((img, idx) => !deletedata.includes(idx));
            } else {
                console.error("At least one image must remain.");
                
            }
        }else{
            images =Product.image.map((img)=>{
                return img;
            });
        }

        // if (req.body.deletecheckbox) {
        //     const imagesToDelete = req.body.deletecheckbox;
        //     console.log(imagesToDelete.length,"imagelength",Product.image.length,"checkbox length");
        //     if(imagesToDelete.length===Product.image.length){
        //         console.error("At least one image must remain.");
        //     }
        //     else if (imagesToDelete.length < Product.image.length) {
        //         deletedata.push(imagesToDelete);
        //         deletedata = deletedata.flat().map(x => Number(x));
        //         images = Product.image.filter((img, idx) => !deletedata.includes(idx));
        //     } else {
        //         console.error("At least one image must remain.");
        //         // Handle the case where all images are selected for deletion
        //     }
        // } else {
        //     images = Product.image.map(img => img);
        // }
        
        if(req.files.length!=0){
            for(const file of req.files){
                // console.log(file,"file recieved");

                const randomInteger = Math.floor(Math.random() * 20000001);
                const imageDirectory = path.join(
                  "public",
                  "assets",
                  "imgs",
                  "productIMG"
                );
                const imgFileName = "cropped" + randomInteger + ".jpg";
                const imagePath = path.join(imageDirectory, imgFileName);
        
                // console.log(imagePath, "Image path");
        
                const croppedImage = await sharp(file.path)
                  .resize(440, 337, {
                    fit: "fill",
                  })
                  .toFile(imagePath);
                  
                  if(croppedImage){
                    images.push(imgFileName);
                  }
            }
        }
        await product.findByIdAndUpdate(
            {_id:req.body.product_id},
            {
                $set:{
                    name,
                    category: Category,
                    price,
                    description,
                    sizes:sizedata,
                    image:images,
                },
            }
        );
        res.redirect('/admin/product');
    }catch(error){
        console.log(error)
    }
};


module.exports={
    loadproducthome,
    loadproduct,
    addproduct,
    deleteProduct,
    editproducthome,
    editproduct
}
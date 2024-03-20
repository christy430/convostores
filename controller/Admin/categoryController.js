const category= require("../../model/categorymodel");
const product= require("../../model/productmodel");
const fs= require('fs');

const loadcategory= async(req,res)=>{
    try{
        const categorydata= await category.find();
         res.render('./admin/category',{categorydata})
    }catch(error){
        console.log(error);
    }
}

const loadcategoryform= async(req,res)=>{
    try{
        res.render('admin/addcategory');
    }
    catch(error){
        console.log(error);
    }
}

const addcategory= async(req,res)=>{
    try{
        let{name,description}=req.body;
        let image=''
        if(req.file){
            image=req.file.filename
        }
        const existingcategory= await category.findOne({
            name:{$regex: new RegExp(`${name}$`,'i')},
        });

        if(existingcategory){
            res.render('admin/addcategory',{
                error:"category with the same name already exists",
            });
        }else{
            const Category= new category({
                name:name,
                image:image,
                description:description,
                is_listed:true
            });
            const categorydata= await Category.save();
            res.redirect('/admin/category');
        }
    }catch(error){
        console.log(error);
    }
};

const unlistcategory= async(req,res)=>{
    try{
        const id= req.query.id;
        const categoryvalue= await category.findById(id);

        if(categoryvalue.is_listed){
            const categorydata=await category.updateOne(
                {_id:id},
                {
                    $set:{
                        is_listed:false
                    },
                }
            );
        }else{
            const categorydata = await category.updateOne(
                {_id:id},
                {
                    $set:{
                        is_listed:true
                    },
                }
            );
        }
        res.redirect('/admin/category');
    }catch(error){
        console.log(error);
    }
    
    
}

const editcategoryhome= async(req,res)=>{
    try{
        const id= req.query.id;
        const categorydata= await category.findById(id);
        res.render('admin/editcategory',{category:categorydata});
    }
    catch(error){
        console.log(error);
    }
}

const editcategory= async(req,res)=>{
    try{
        let id=req.body.category_id;
        console.log(id,"from editcategiry try block");
        const existingcategory= await category.findOne({name:{$regex: new RegExp(`^${req.body.name}$`,'i')},_id:{$ne:id}});
        console.log(existingcategory,"kkkk");
        if(existingcategory){
            console.log("in if block");
            return res.render('admin/editcategory',{
                error: "Category name already exists",
                category:existingcategory
            });
        }
        if(!req.file){
            const categorydata= await category.findByIdAndUpdate(
                {_id:id},
                {
                    $set:{
                        name:req.body.name,
                        description:req.body.description
                    },
                }
            );

        
        }else{
            const categorydata= await category.findByIdAndUpdate(
                {_id:id},
                {
                    $set:{
                        name:req.body.name,
                        image:req.file.filename,
                        description:req.body.description
                    },
                }
            );
        
        }
        res.redirect('/admin/category')
    }catch(error){
        console.log(error);
    }
}




module.exports={
    loadcategory,
    addcategory,
    loadcategoryform,
    unlistcategory,
    editcategoryhome,
    editcategory
}
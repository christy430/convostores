const user=require('../model/usermodel')
const bcrypt=require("bcrypt");

const adminhome=async(req,res)=>{
    try{
        res.render('./admin/adminhome');
    }
    catch(err){
        console.log(err);
    }
}

const adminlogin=async(req,res)=>{
    try{
        res.render('./admin/adminlogin');
    }
    catch(err){
        console.log(err);
    }
}

const verifylogin=async(req,res)=>{
    try{
        console.log('in');
        const email=req.body.email;
        const password=req.body.password;

        const userData=await user.findOne({email:email});
        if(!email||!password){
            res.render('./admin/adminlogin',{alert:"please enter both email ans password"})
        }else if(userData){
            const macthpassword= await bcrypt.compare(password,userData.password);
            if(macthpassword && userData.is_admin==1){
                console.log('admin');
                req.session.admin_id=userData._id;
                res.redirect('/admin/home');
            }else{
                res.render('./admin/adminlogin',{alert:"Email and password is incorrect"});
            }
        }else {
            res.render("./admin/adminlogin", { message: "Email and password is incorrect" });
          }
    }catch(error){
        console.log(error);
    }
};

const adminlogout=async(req,res)=>{
        try{
            req.session.admin_id=null;
            console.log("hello admin");
            res.redirect('/admin')
        }catch(err){
        console.log(error);
    }
};

module.exports={
    adminhome,
    adminlogin,
    verifylogin,
    adminlogout}
const user=require('../../model/usermodel')
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

const usermanage= async(req,res)=>{
    try {
        const adminData = await user.findById(req.session.admin_id);
    
        const usersData = await user.find({is_admin:0});
    console.log(usersData)
        res.render('admin/usermanage', { user: usersData, admin: adminData });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error: " + error.message);
      }
}

const BlockAndUnblockuser = async (req, res) => {
    try {
      const id = req.query.id;
      const uservalue = await user.findById(id);
      uservalue.is_blocked=!uservalue.is_blocked
      await uservalue.save();

      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Failed to unlist user" });
    }
  };
module.exports={
    adminhome,
    adminlogin,
    verifylogin,
    adminlogout,
    usermanage,
    BlockAndUnblockuser
}
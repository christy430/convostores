const User = require('../model/usermodel');
const bcrypt=require('bcrypt');
const message=require('../config/otp')


//hash password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const home=async(req,res)=>{
    try{
      console.log(req.session.user_id);
      if(req.session.user_id ){
        let userid=req.session.user_id; 
        
        res.render('./user/home',{user:userid});
      }else{
        res.render('./user/home',{user:null});

      }
    }
    catch(err){
        console.log(err);
    }
}

const loadlogin=async(req,res)=>{
    try{
        res.render('./user/login');
    }
    catch(err){
        console.log(err);
    }
}
const signup=async(req,res)=>{
    try{
        res.render('./user/signup');
    }
    catch(err){
        console.log(err);
    }
}

const loadotp=async(req,res)=>{
  try{
    const otpGeneratedtime=req.session.otpGeneratedTime;
    res.render('./user/otp',{otpGeneratedtime});
  }
  catch(err){
    console.log(err);
}
}

//otp verification
const verifyOtp = async (req,res)=>{
  try{
    const otp= req.body.otp
    const userData = req.session.userData;
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const currentTime = Date.now();

    if (currentTime - otpGeneratedTime > 80 * 1000) {
      res.render("./user/otp", {
        alert: "OTP expired",
        otpGeneratedTime,
      });
      return;
    }
    if (!req.session.user_id) {
    if(req.session.otp ==otp){
      const secure_password = await securePassword(userData.password);
      const user = new User({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: secure_password,
        is_admin: 0,
        is_blocked:0,
       })
      const userDataSave = await user.save();
      if(userDataSave){
        req.session.registrationsuccess=true;
        res.redirect('/login')
      } else{
        res.render("./user/signup", { alert: "Registration Failed" });
      }
    } else{
      res.render("./user/otp", { alert: "The OTP is incorrect" });
    }
  }   
} catch(error){
    console.log(error.message)
  }
}

//login user method
const loadloginuser=async(req,res)=>{
  try{
    if(req.session.registrationsuccess){
      res.render("./user/login",{alert:"Registration successful"});
      req.session.registrationsuccess=false;
    }
    else{
      res.render("./user/login");
    }
  }catch(error){
    console.log(error);
  }
}

//userlogin
const verifylogin = async (req, res) => {
  try {
    const email=req.body.email;
    const password=req.body.password;
    const userData = await User.findOne({ email: { $regex: new RegExp(email, "i") } });
    console.log(userData,"kkk")

    if(!email||!password){
      res.render("./user/login",{alert:"please enter both email and password"});
    }else if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch && userData.is_admin==0) {
        req.session.user_id = userData._id;
        res.status(303).redirect("/");
      } else {
        res.render("./user/login", { alert: "Incorrect password", title: "User Login" });
      }
    } else {
      res.render("./user/login", { alert: "User not found", title: "User Login" });
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};




const postsignup=async(req,res)=>{
    try{
      const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(req.body.name)) {
            return res.render('./user/signup', {
                alert: 'Name should only contain letters.',
                title: 'Sign up'
            });
        }

        if(/\s/.test(req.body.email)){
            return res.render('./user/signup',{
                alert:'Email cannot contain spaces.',
                title:'sign up'
            });
        }
        const passwordRegex=/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(req.body.password)) {
            return res.render('./user/signup', {
             alert: 'Password must be at least 8 characters long and contain letters, numbers, and special characters.',
              title: 'Sign up'
            });
          }
          const existingUser = await User.findOne({ email: req.body.email });

          if (existingUser) {
            return res.render('./user/signup', {
              alert: 'This email already exists. Try with another one',
              title: 'Sign up'
            });
          } else {
            req.session.userData={
              name: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
              password: req.body.password,
              is_admin: 0,
            }
            await message.sendverifyemail(req.body.email,req);
            res.redirect('/otp')
          }
        } catch (error) {
          console.error(error);
          return res.status(500).send('Internal Server Error');
        }
}; 

const userlogout=async(req,res)=>{
  try{
    delete req.session.user_id;
    console.log("hello user");
    res.redirect('/');
  }catch(error){
    console.log(error);

  }
}




module.exports={
  home,
  loadlogin,
  signup,
  postsignup,
  loadotp,
  verifyOtp,
  verifylogin,
  loadloginuser,
  userlogout
};
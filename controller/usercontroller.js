const User = require('../model/usermodel');
const product= require('../model/productmodel');
const category= require('../model/categorymodel');
const bcrypt=require('bcrypt');
const message=require('../config/otp')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("941543183511-fr0s2li519qfsgmos5rr12nd5ue511et.apps.googleusercontent.com")


//hash password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//render home page

const home = async (req, res) => {
  try {
    const products= await product.find();
    const categories= await category.find();
    if (!req.session.user_id) {
      res.render("./user/home", { user: null, products, categories });
    } else {
      const userData = await User.findById({ _id: req.session.user_id });
      res.render("./user/home", { user: userData, products, categories});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadSingleShop = async (req, res) => {
  try {
    console.log('in product');
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const productId = req.params.id;
    const productdata = await product.findById(productId);
    const categories = await category.find();
console.log(productdata,categories,'end');
    if (!userData) {
      return res.status(404).send("User not found");
    }


    if (!productdata) {
      return res.status(404).send("Product not found");
    }


    if (!categories || categories.length === 0) {
      return res.status(404).send("Categories not found");
    }

    res.render("./user/productdetails", { user:userData, product:productdata, categories });
  } catch (error) {
    console.log(error.message);
  }
};

//render login page
const loadlogin=async(req,res)=>{
    try{
        res.render('./user/login');
    }
    catch(err){
        console.log(err);
    }
}

//render signuppage
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

//resend otp
const resendotp=async(req,res)=>{
  try{
    const userData = req.session.userData;
    console.log("resend otp")
    if(!userData){
      // res.status(400).json({alert:"invalid or expired session"});
      console.log("invalid otp")
    }else{
      console.log("in else part ")
      
      delete req.session.otp;
      const data= await message.sendverifyemail(userData.email,req)
    }

    res.render('./user/otp',{alert:"OTP resent successfully"})
  }catch(error){
    console.log(error);
    res.render('./user/otp',{alert:"failed to send otp"})
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
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(req.body.phone)) {
          return res.render('./user/signup', {
            alert: 'Invalid phone number. Please enter a 10-digit phone number.',
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

// // Google Sign-In route
// const googleSignIn = async (req, res) => {
//   try {
//     const { token } = req.body;

//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: 'YOUR_GOOGLE_CLIENT_ID',
//     });

//     const payload = ticket.getPayload();
//     const googleEmail = payload.email;

//     // Check if the Google email exists in your database
//     const existingUser = await User.findOne({ email: googleEmail });

//     if (existingUser) {
//       // Log in the existing user
//       req.session.user_id = existingUser._id;
//       return res.status(303).redirect('/');
//     } else {
//       // Redirect to a registration page or handle as needed
//       return res.status(303).redirect('/signup-google');
//     }
//   } catch (error) {
//     console.error('Google Sign-In Error:', error);
//     return res.status(500).send('Internal Server Error');
//   }
// };

const accounthome= async(req,res)=>{
  try{
    res.render('./user/acoount');
  }catch(error){
    console.log(error);
  }
}




const userlogout=async(req,res)=>{
  try{
    delete req.session.user_id;
    console.log("hello user");
    res.redirect('/');
  }catch(error){
    console.log(error);

  }
}

const loadforgotpassword= async (req,res)=>{
  try{
    res.render('./user/forgotpassword')
  }catch(error){
    console.log(error);
  }
}




module.exports={
  home,
  loadSingleShop,
  loadlogin,
  signup,
  postsignup,
  loadotp,
  verifyOtp,
  verifylogin,
  loadloginuser,
  userlogout,
  resendotp,
  accounthome,
  loadforgotpassword
  
};
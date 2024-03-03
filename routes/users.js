var express = require('express');
var router = express.Router();
var usercontroller= require('../controller/usercontroller')
const authentication=require('../middlewares/userauthentication')
// const passport=require('passport');
// require('../passport');

// router.set("views", "./views/user");  

//passport initialization
// router.use(passport.initialize());
// router.use(passport.session());



//userHome
// router.get('/',usercontroller.home);

//login
router.get('/',authentication.isLogout, usercontroller.home);
router.get('/login',authentication.isLogout, usercontroller.loadlogin);
router.post('/login',usercontroller.verifylogin);
router.get('/home',authentication.isLogin,usercontroller.home);
router.get('/singleProduct/:id',authentication.isLogin,usercontroller.loadSingleShop );

router.get('/userlogout',authentication.isLogin,usercontroller.userlogout)

//signup
router.get('/signup',usercontroller.signup);
router.post('/signup',usercontroller.postsignup);



//account
router.get('/account',usercontroller.accounthome);

//google sign-up
// router.post('/signup/google',usercontroller.googleSignIn);


//otp
router.get('/otp',usercontroller.loadotp);
router.get('/verify',usercontroller.loadotp);
router.post('/verify',usercontroller.verifyOtp);
router.get('/resendotp',usercontroller.resendotp)

//forgot password
router.get('/forgotpassword',usercontroller.loadforgotpassword);



module.exports = router;
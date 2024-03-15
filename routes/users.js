var express = require('express');
var router = express.Router();
var usercontroller= require('../controller/usercontroller')
const authentication=require('../middlewares/userauthentication')
const addresscontroller=require('../controller/addresscontroller');
const checkoutcontroller=require('../controller/checkoutcontroller');
const cartcontroller= require('../controller/cartcontroller')
const multer=require('../middlewares/multer');

// const passport=require('passport');
// require('../passport');

// router.set("views", "./views/user");  

//passport initialization
// router.use(passport.initialize());
// router.use(passport.session());




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
router.post('/account',multer.uploadUser.single('image'),usercontroller.useredit);
router.post('/updateprofilepic',multer.uploadUser.single('croppedImage'),usercontroller.updateprofilepicture);


//google sign-up
// router.post('/signup/google',usercontroller.googleSignIn);


//user


//otp
router.get('/otp',usercontroller.loadotp);
router.get('/verify',usercontroller.loadotp);
router.post('/verify',usercontroller.verifyOtp);
router.get('/resendotp',usercontroller.resendotp)

//forgot password
router.get('/forgotpassword',usercontroller.loadforgotpassword);
router.post('/forgotpassword',usercontroller.forgotpassword);
router.get('/resetpassword',usercontroller.loadresetpassword);
router.post('/resetpassword',usercontroller.resetPassword);

//adress
router.get('/useraddress',addresscontroller.loadaddress)
router.get('/addaddress',addresscontroller.loadaddaddress);
router.post('/addaddress',addresscontroller.addaddress);
router.get('/editaddress',addresscontroller.loadeditaddress);
router.post('/editaddress',addresscontroller.editaddress);
router.get('/deleteaddress',addresscontroller.deleteaddress);

//order
router.get('/checkout',authentication.isLogin,checkoutcontroller.loadcheckout);
router.post('/checkout',authentication.isLogin,checkoutcontroller.postcheckout)
router.get('/ordersuccess',authentication.isLogin,checkoutcontroller.laoadOrderdetails)
router.get('/orderdetails/:id',authentication.isLogin,checkoutcontroller.orderdetails);
router.post('/cancelorder',authentication.isLogin,checkoutcontroller.cancelorder);

//cart
router.get('/cart',authentication.isLogin,cartcontroller.loadcart);
router.post('/cart',authentication.isLogin,cartcontroller.addtocart);
router.put('/updatecart',authentication.isLogin,cartcontroller.updatecart)
router.delete('/removefromcart',authentication.isLogin,cartcontroller.removefromcart);


module.exports = router;
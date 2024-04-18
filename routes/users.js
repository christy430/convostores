var express = require('express');
var router = express.Router();
const userController = require('../controller/User/userController');
const authentication=require('../middlewares/userauthentication');
const addressController = require('../controller/User/addressController');
const checkoutcontroller = require('../controller/User/checkoutController');
const cartcontroller = require('../controller/User/cartController');
const coupencontroller = require('../controller/Admin/coupenController');
const categoryController= require('../controller/User/categoryController');
const wishlistController= require('../controller/User/wishlistController');
const multer=require('../middlewares/multer');

// const passport=require('passport');
// require('../passport');

// router.set("views", "./views/user");  

//passport initialization
// router.use(passport.initialize());
// router.use(passport.session());




//login
router.get('/',authentication.isLogout, userController.home);
router.get('/login',authentication.isLogout, userController.loadlogin);
router.post('/login',userController.verifylogin);
router.get('/home',authentication.isLogin,userController.home);
router.get('/singleProduct/:id',userController.loadSingleShop );

router.get('/userlogout',authentication.isLogin,userController.userlogout)

//signup
router.get('/signup',userController.signup);
router.post('/signup',userController.postsignup);



//account
router.get('/account',authentication.isLogin,userController.accounthome);
router.post('/account',multer.uploadUser.single('image'),userController.useredit);
router.post('/updateprofilepic',multer.uploadUser.single('croppedImage'),userController.updateprofilepicture);


//google sign-up
router.post('/signup/google',userController.googleSignIn);


//user


//otp
router.get('/otp',userController.loadotp);
router.get('/verify',userController.loadotp);
router.post('/verify',userController.verifyOtp);
router.get('/resendotp',userController.resendotp)

//forgot password
router.get('/forgotpassword',userController.loadforgotpassword);
router.post('/forgotpassword',userController.forgotpassword);
router.get('/resetpassword',userController.loadresetpassword);
router.post('/resetpassword',userController.resetPassword);

//adress
router.get('/useraddress',addressController.loadaddress)
router.get('/addaddress',addressController.loadaddaddress);
router.post('/addaddress',addressController.addaddress);
router.get('/editaddress',addressController.loadeditaddress);
router.post('/editaddress',addressController.editaddress);
router.get('/deleteaddress',addressController.deleteaddress);

//order
router.get('/checkout',authentication.isLogin,checkoutcontroller.loadcheckout);
router.post('/checkout',authentication.isLogin,checkoutcontroller.postcheckout);
router.post('/razorpay',authentication.isLogin,checkoutcontroller.razorPayOrder);
router.get('/ordersuccess',authentication.isLogin,checkoutcontroller.laoadOrderdetails)
router.get('/orderdetails/:id',authentication.isLogin,checkoutcontroller.orderdetails);
router.post('/cancelorder',authentication.isLogin,checkoutcontroller.cancelorder);
router.post('/return',authentication.isLogin,checkoutcontroller.returnOrder);

//cart
router.get('/cart',authentication.isLogin,cartcontroller.loadcart);
router.post('/cart',authentication.isLogin,cartcontroller.addtocart);
router.put('/updatecart',authentication.isLogin,cartcontroller.updatecart)
router.delete('/removefromcart',authentication.isLogin,cartcontroller.removefromcart);


//category-wise-products
router.get('/allcategory',categoryController.loadAllCategory);

router.get('/shopCategoryFilter/:id?',categoryController.loadAllCategory);

router.get('/sorting/:id?',categoryController.loadAllCategory);

router.get('/menscategory',categoryController.loadMensCategory);
router.get('/womenscategory',categoryController.loadWomensCategory);
router.get('/kidscategory',categoryController.loadkidsCategory);

//wallet routes
router.get('/wallets',authentication.isLogin,userController.loadWallets);

//coupon routes
router.get('/coupons',authentication.isLogin,coupencontroller.listUserCoupons);
router.post('/applyCoupn',authentication.isLogin,checkoutcontroller.apllyCoupon);


//wishlist routes
router.get('/wishlist',authentication.isLogin,wishlistController.loadWishlist);
router.post('/addToWishlist',authentication.isLogin,wishlistController.addToWishlist);
router.delete('/removewishlist',authentication.isLogin,wishlistController.removeWishlist);


module.exports = router;
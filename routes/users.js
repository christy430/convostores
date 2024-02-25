var express = require('express');
var router = express.Router();
var usercontroller= require('../controller/usercontroller')
const authentication=require('../middlewares/userauthentication')


// router.set("views", "./views/user");  



router.get('/',usercontroller.home);

//login
router.get('/',authentication.isLogout, usercontroller.home);
router.get('/login',authentication.isLogout, usercontroller.loadlogin);
router.post('/login',usercontroller.verifylogin);
router.get('/home',authentication.isLogin,usercontroller.home);
router.get('/userlogout',authentication.isLogin,usercontroller.userlogout)

//signup
router.get('/signup',usercontroller.signup);
router.post('/signup',usercontroller.postsignup);

//otp
router.get('/otp',usercontroller.loadotp);
router.get('/verify',usercontroller.loadotp);
router.post('/verify',usercontroller.verifyOtp);



module.exports = router;
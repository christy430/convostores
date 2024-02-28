const express = require('express');
const admin_route=express.Router();
const session=require("express-session");
const adminauthentication=require("../middlewares/adminauthentication");
const admincontroller=require('../controller/admincontroller');
const categorycontroller= require('../controller/categorycontroller')
const productcontroller=require('../controller/productcontroller');
const ordercontroller=require('../controller/ordercontroller');
const multer=require('../middlewares/multer');


// admin_route.set('views','./views/admin');



/* GET home page. */
admin_route.get('/',adminauthentication.islogout,admincontroller.adminlogin);
admin_route.post('/',admincontroller.verifylogin)
admin_route.get('/home',adminauthentication.isLogin,admincontroller.adminhome);
admin_route.get('/usermanage',adminauthentication.isLogin,admincontroller.usermanage);
admin_route.get('/unlistUser',adminauthentication.isLogin,admincontroller.listuser);

admin_route.get('/logout',adminauthentication.isLogin,admincontroller.adminlogout)


//category routes
admin_route.get('/category',adminauthentication.isLogin,categorycontroller.loadcategory)
admin_route.get('/addcategory',adminauthentication.isLogin,categorycontroller.loadcategoryform);
admin_route.post('/addcategory',multer.uploadCategory.single("image"),categorycontroller.addcategory);
admin_route.get('/unlistCategory',adminauthentication.isLogin,categorycontroller.unlistcategory);

//product routes
admin_route.get('/product',adminauthentication.isLogin,productcontroller.loadproducthome);
admin_route.get('/addproduct',adminauthentication.isLogin,productcontroller.loadproduct)
admin_route.post('/addproduct',multer.uploadProduct.array("image"),productcontroller.addproduct)


//order routes
admin_route.get('/order',adminauthentication.isLogin,ordercontroller.loadorder)

module.exports = admin_route;

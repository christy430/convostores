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
admin_route.use(adminauthentication.isLogin)
admin_route.get('/home',admincontroller.adminhome);
admin_route.get('/usermanage',admincontroller.usermanage);
admin_route.get('/unlistUser',admincontroller.listuser);

admin_route.get('/logout',admincontroller.adminlogout)


//category routes
admin_route.get('/category',categorycontroller.loadcategory)
admin_route.get('/addcategory',categorycontroller.loadcategoryform);
admin_route.post('/addcategory',multer.uploadCategory.single("image"),categorycontroller.addcategory);
admin_route.get('/unlistCategory',categorycontroller.unlistcategory);
admin_route.get('/editcategory',categorycontroller.editcategoryhome);
admin_route.post('/editcategory',multer.uploadCategory.single("image"),categorycontroller.editcategory);

//product routes
admin_route.get('/product',productcontroller.loadproducthome);
admin_route.get('/addproduct',productcontroller.loadproduct)
admin_route.post('/addproduct',multer.uploadProduct.array("image"),productcontroller.addproduct)
admin_route.get('/deleteProduct/:id',productcontroller.deleteProduct)
admin_route.get('/editproduct',productcontroller.editproducthome);
admin_route.post('/editproduct',multer.uploadProduct.array("image"),productcontroller.editproduct);
//order routes
admin_route.get('/order',ordercontroller.loadorders)

module.exports = admin_route;

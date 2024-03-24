const express = require('express');
const admin_route=express.Router();
const session=require("express-session");
const adminauthentication=require("../middlewares/adminauthentication");
const adminController = require('../controller/Admin/admincontroller');
const categorycontroller= require('../controller/Admin/categoryController')
const productcontroller=require('../controller/Admin/productController');
const ordercontroller = require('../controller/Admin/ordercontroller');
const coupenController= require('../controller/Admin/coupenController');
const multer=require('../middlewares/multer');


// admin_route.set('views','./views/admin');



/* GET home page. */
admin_route.get('/',adminauthentication.islogout,adminController.adminlogin);
admin_route.post('/',adminController.verifylogin)
admin_route.use(adminauthentication.isLogin)
admin_route.get('/home',adminController.adminhome);
admin_route.get('/usermanage',adminController.usermanage);
admin_route.get('/unlistUser',adminController.BlockAndUnblockuser);

admin_route.get('/logout',adminController.adminlogout)


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
admin_route.get('/order',ordercontroller.loadorders);
admin_route.get('/orderdetails',ordercontroller.listOrderDetails);
admin_route.put('/orderstatuschange',ordercontroller.orderStatusChange);

//coupon routes
admin_route.get('/addCoupon',coupenController.loadAddCoupon)
admin_route.post('/addCoupon',coupenController.addCoupon);
admin_route.get('/viewCoupon',coupenController.loadViewCoupon);
admin_route.get('/editCoupon',coupenController.loadEditCoupon);
admin_route.put('/editCoupon',coupenController.editCoupon);
admin_route.get('/coupondetails',coupenController.couponDetails);
admin_route.get('/unlistCoupon',coupenController.unlistCoupon);

//sales Report
admin_route.get('/salesreport',ordercontroller.loadSalesReport);

module.exports = admin_route;

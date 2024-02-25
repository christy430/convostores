const express = require('express');
const admin_route=express.Router();
const session=require("express-session");
const adminauthentication=require("../middlewares/adminauthentication");
const admincontroller=require('../controller/admincontroller');


// admin_route.set('views','./views/admin');



/* GET home page. */
admin_route.get('/',adminauthentication.islogout,admincontroller.adminlogin);
admin_route.post('/',admincontroller.verifylogin)
admin_route.get('/home',adminauthentication.isLogin,admincontroller.adminhome);

admin_route.get('/logout',adminauthentication.isLogin,admincontroller.adminlogout)

module.exports = admin_route;

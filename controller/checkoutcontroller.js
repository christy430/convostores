const product= require("../model/productmodel");
const category = require('../model/categorymodel');
const user= require("../model/usermodel");
const address = require("../model/addressmodel");

const loadcheckout= async(req,res)=>{
    try{
        res.render('./user/order');
    }catch(err){
        console.log(error);
    }
}

module.exports={
    loadcheckout
}
const product= require("../model/productmodel");
const category = require('../model/categorymodel');
const user= require("../model/usermodel");
const address = require("../model/addressmodel");

const loadorders= async(req,res)=>{
    try{
        res.render('./admin/order');
    }catch(error){
        console.log(error);
    }
}

module.exports={
    loadorders
}
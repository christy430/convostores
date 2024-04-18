const User = require("../model/usermodel");

const isLogin = async(req,res,next)=>{
    
    try{
        const userData = await User.findOne({ _id:req.session.user_id });
       
    if(!userData){
        res.render("./user/login", { alert: "please login to Continue" });
        
        
    }
    

        if(req.session.user_id &&  userData.is_admin==0 && userData.is_blocked==0){
            next();
        }else{
            if(userData.is_blocked==1){
                req.session.user_id=null ;
                res.render("./user/login", { alert: "You are blocked from this site!" });
            }
            else{
                res.render("./user/login", { alert: "You are blocked from this site!" });
            }
        } 
    }catch(error){
        res.render("./user/login", { alert: "Please Login to Continue" });
        console.log(error);
        
    }
}

const isLogout = async(req,res,next)=>{
    const userData = await User.findOne({ _id:req.session.user_id });
    try{

        if(req.session.user_id && userData.is_admin==0 ){
            res.redirect('/home');
        }
        else{
            next();
        }

    }catch(error){
        console.log(error);
    }

}


module.exports ={
    isLogin,
    isLogout
}
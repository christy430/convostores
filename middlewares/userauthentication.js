const User = require("../model/usermodel");

const isLogin = async(req,res,next)=>{
    // console.log(req.url);
    
    try{
        const userData = await User.findOne({ _id:req.session.user_id });
    if(!userData){
        console.log("in if condition middleware")
        
    }
    

        if(req.session.user_id &&  userData.is_admin==0 && userData.is_blocked==0){
            console.log(req.session.user_id);
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
        res.render("./user/login", { alert: "You are blocked from this site!" });
        console.log(error.message,"from middleware");
        
    }
}

const isLogout = async(req,res,next)=>{
    const userData = await User.findOne({ _id:req.session.user_id });
    try{

        if(req.session.user_id && userData.is_admin==0 ){
            console.log('user',req.session.user_id)
            res.redirect('/home');
        }
        else{
            next();
        }

    }catch(error){
        console.log(error.message);
    }

}


module.exports ={
    isLogin,
    isLogout
}
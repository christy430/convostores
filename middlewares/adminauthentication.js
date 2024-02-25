const user=require('../model/usermodel')

const isLogin= async(req,res,next)=>{
    const userData= await user.findOne({_id:req.session.admin_id});
    
    try{
        if(req.session.admin_id && userData.is_admin==1){
            console.log('if');
            next();
        }else{
            console.log('else');

            res.redirect('/admin')

        }
    }catch(error){
        console.log(error);
    }
};

const islogout=async(req,res,next)=>{
    const userData= await user.findOne({_id:req.session.admin_id});
    try{
        if(req.session.admin_id && userData.is_admin==1){
            res.redirect('/admin/home');
        }else{
            next()
        }
    }catch(error){
        console.log(error);
    }
}

module.exports={
    isLogin,
    islogout
}
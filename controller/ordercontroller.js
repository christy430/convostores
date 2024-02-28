

const loadorder= async(req,res)=>{
    try{
        res.render('./admin/order');
    }catch(err){
        console.log(error);
    }
}

module.exports={
    loadorder
}
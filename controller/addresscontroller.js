const User = require('../model/usermodel');
const address = require('../model/addressmodel');

const loadaddress=async(req,res)=>{
    try{
        const userId = req.session.user_id;
        const userData = await User.findById(userId);

        if(userData){
            const addressData= await address.find({user:userId});
            res.render('user/address',{userData,addressData});
        }else{
            res.redirect('/login');
        }
        
    }
    catch(error){
        console.log(error);
    }
}


const loadaddaddress= async(req,res)=>{
    try{
        const userid= req.session.user_id;
        const userData= await User.findById(userid);
        // console.log(userid,userData,"userid and userdata from adress controller");
        if(userData){
            res.render('user/addadress',{userData});
        }else{
            res.redirect('/login');
        }
    }catch(error){
        console.log(error);
    }
}

const addaddress= async(req,res)=>{
    try{
        const userid= req.session.user_id;
        const{housename,street,city,state,pincode}=req.body;
        console.log(userid,"from add address");
        const newAddress= new address({
            user:userid,
            housename,
            street,
            city,
            state,
            pincode,
            is_listed:true
        });
        const addressData= await newAddress.save();
        console.log(addressData);
        res.redirect('/useraddress');
    }catch(error){
        console.log(error);
    }
}

const loadeditaddress= async(req,res)=>{
    try{
        const userId= req.session.user_id;
        console.log(userId,"userid from editaddress");
        const user= await User.findById(userId);
        const id= req.query.id;
        const Address= await address.findById(id);
        res.render('user/editaddress',{user,Address});
    }catch(error){
        console.log(error);
    }
}


const editaddress= async(req,res)=>{
    try{
        const id=req.body.address_id;

        const{housename,street,city,state,pincode}=req.body;
        const updateData = await address.findByIdAndUpdate(
            {_id:id},
            {
                $set:{
                    housename,
                    street,
                    city,
                    state,
                    pincode,
                    is_listed:true
                },
            }
        );
        res.redirect('/useraddress')
    }catch(error){
        console.log(error);
    }
}

const deleteaddress= async(req,res)=>{
    try{
        const id= req.query.id;
        console.log(id,"from deleteaddress  ");
        const addressData= await address.findByIdAndUpdate(
            {_id:id},
            {
                $set:{
                    is_listed:false,
                }
            }
        );
        res.redirect('/useraddress');
    }catch(error){
        console.log(error);
    }
}

module.exports={
    loadaddress,
    loadaddaddress,
    addaddress,
    loadeditaddress,
    editaddress,
    deleteaddress
};
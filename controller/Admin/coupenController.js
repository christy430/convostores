const Coupon= require('../../model/coupenmodel');
const User= require('../../model/usermodel');

const loadAddCoupon= async(req,res)=>{
    try{
        const admin=req.session.admin_id;
        res.render('admin/addcoupon',{admin});

    }catch(error){
        console.log(error);
    }
}

const addCoupon=async(req,res)=>{
    try{
        const admin= req.session.admin_id;
        let{
            coupon_code,
            discount,
            limit,
            minAmount,
            maxAmount,
            expiryDate
        }=req.body;

        coupon_code=coupon_code.replace(/\s/g,"");

        const existingCoupon= await Coupon.findOne({
            code:{$regex:new RegExp("^"+ coupon_code,"i")},
        });

        if(existingCoupon){
            return res.status(500).json({success:false,error:"Coupon code already Exists"});
        }

        const newCoupon = new Coupon({
            code: coupon_code,
            discount: discount,
            limit: limit,
       
            expiry: expiryDate,
            maxAmount: maxAmount,
            minAmount: minAmount,
          });
      
          await newCoupon.save();
          res.status(200).json({success:true,alert:"Coupon added successfully"});
    }catch(error){
        console.log(error);
    }
}

const loadViewCoupon= async(req,res)=>{
    try{
        const admin= req.session.admin_id;
        const page= parseInt(req.query.page)||1;
        let query={};
        const limit=7;
        const totalCount= await Coupon.countDocuments(query);

        const totalPages= Math.ceil(totalCount/limit);
        const coupon= await Coupon.find()
        .skip((page-1)*limit)
        .limit(limit)
        .sort({createdDate:-1});

        res.render("admin/viewcoupon",{coupon,admin,totalPages,currentPage:page})

    }catch(error){
        console.log(error);
    }
}

const loadEditCoupon= async(req,res)=>{
    try{
        
        const admin=req.session.admin_id;
        const couponId=req.query.couponId;
        console.log(couponId);
        const coupon= await Coupon.findById(couponId);
        console.log(coupon.expiry);
        const expiry= new Date(coupon.expiry).toISOString().split("T")[0];

        res.render("admin/editcoupon",{admin,coupon,expiry});
    }catch(error){
        console.log(error);
    }
}

const editCoupon= async(req,res)=>{
    try{
        console.log("in edit coupon controller")
        const couponId=req.query.couponId;

        const { coupon_code, discount, limit, minAmount, maxAmount, expiryDate } = req.body;

        if(!coupon_code || !discount || !expiryDate){
            return res.status(400).json({success:false,error:"Required fields Missing"});
        }

        const existingCoupon= await Coupon.findOne({
            code:{ $regex:new RegExp("^"+ coupon_code,"i")},
            _id:{$ne:couponId}
        });

        if(existingCoupon){
            return res.status(400).json({success:false,error:"Coupon code already exists"});
        }

        const updatedCoupon= await Coupon.findByIdAndUpdate(
            {_id:couponId},
            {
                $set:{
                    code:coupon_code,
                    discount:discount,
                    limit:limit,
                    expiry:expiryDate,
                    maxAmount:maxAmount,
                    minAmount:minAmount
                },
            },
            {new:true}
        );
        // console.log(updatedCoupon,"updatedcoupon");

        if(!updatedCoupon){
            return res.status(400).json({success:false,error:"Coupon Not Found"});
        }
        res.status(200).json({success:true,message:"Coupon Updated Successfully",data:updatedCoupon});

    }catch(error){
        console.log(error);
    }
}

const  unlistCoupon  = async(req,res)=>{
    try{
        const id= req.query.couponId;
        const couponData= await Coupon.findById({_id:id});

        if(couponData.is_listed==false){
            couponData.is_listed=true;
        }else{
            couponData.is_listed=false;
        }

        await couponData.save();

        res.redirect('/admin/viewCoupon');
    }catch(error){
        console.log(error);
    }
}

const couponDetails= async(req,res)=>{
    try{
        const admin = req.session.adminData;
        const couponId = req.query.couponId;
        const coupon = await Coupon.findById(couponId)
        .populate("usersUsed")
        .sort({_id:-1})
        .exec();

        const users= coupon.usersUsed;
        res.render("admin/couponDetails",{users,coupon,admin:admin});

    }catch(error){
        console.log(error);
    }
}

module.exports={
    loadAddCoupon,
    addCoupon,
    loadViewCoupon,
    loadEditCoupon,
    editCoupon,
    unlistCoupon,
    couponDetails
}
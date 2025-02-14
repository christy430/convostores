const user=require('../../model/usermodel')
const bcrypt=require("bcrypt");
const Order= require("../../model/ordermodel");
const Product= require("../../model/productmodel");
const Category= require("../../model/categorymodel");

const{getMonthlyDataArray,getDailyDataArray,getYearlyDataArray}= require("../../util/chartData")


const adminhome=async(req,res)=>{
    try{
        let query={};
        const adminData= await user.findById(req.session.admin_id);
        const totalRevenue= await Order.aggregate([
            {$match:{"items.status":"Delivered"}},
            {$group:{_id:null,totalAmount:{$sum:"$totalAmount"}}},
        ]);

        const totalUsers= await user.countDocuments({is_blocked:0,is_admin:0});
        // console.log(totalUsers,"totalUsers from admincontroller");
        const totalOrders= await Order.countDocuments();
        const totalProducts= await Product.countDocuments();
        const totalCategories= await Category.countDocuments();
        const orders= await Order.find().populate("user").limit(10).sort({orderDate:-1});

        const monthlyEarnings = await Order.aggregate([
            {
              $match: {
                "items.status": "Delivered" ,
                orderDate: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            },
            { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
          ]);
//hiii shinto dude
          //top 10 selling products
          const topSellingProducts = await Order.aggregate([
            { $unwind: "$items" }, // Unwind the items array
            { $match: { "items.status": "Delivered" } }, // Match only delivered items
            { 
                $group: { 
                    _id: "$items.product", // Group by product
                    totalQuantity: { $sum: "$items.quantity" } // Calculate total quantity sold for each product
                } 
            },
            { $sort: { totalQuantity: -1 } }, // Sort by total quantity in descending order
            { $limit: 10 }, // Limit to the top 10 products
            { 
                $lookup: {
                    from: "products", // Name of the products collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" }, // Unwind the productInfo array
            { $project: { productName: "$productInfo.name", totalQuantity: 1, _id: 0 } } // Project only the product name and total quantity
        ]);

        //best selling category
        const topSellingCategories = await Order.aggregate([
            { $unwind: "$items" }, // Unwind the items array
            { $match: { "items.status": "Delivered" } }, // Match only delivered items
            { 
                $group: { 
                    _id: "$items.product", // Group by product
                    totalQuantity: { $sum: "$items.quantity" } // Calculate total quantity sold for each product
                } 
            },
            { $sort: { totalQuantity: -1 } }, // Sort by total quantity in descending order
            { $limit: 10 }, // Limit to the top 10 products
            { 
                $lookup: {
                    from: "products", // Name of the products collection
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" }, // Unwind the productInfo array
            { 
                $lookup: {
                    from: "categories", // Name of the categories collection
                    localField: "productInfo.category", // Assuming category is stored in the product document
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" }, // Unwind the categoryInfo array
            { 
                $group: {
                    _id: "$categoryInfo.name", // Group by category name
                    totalQuantity: { $sum: "$totalQuantity" } // Sum up total quantity sold for each category
                }
            },
            { $sort: { totalQuantity: -1 } }, // Sort by total quantity in descending order
            // { $limit: 2 } // Limit to the top selling category
        ]); 
        
        // console.log(topSellingCategories,"from top selling categories");
        
        
        // console.log(topSellingProducts);
        
        
        // console.log(topSellingProducts,"topSellingProducts from admin home controller");
        
        //   console.log(monthlyEarnings,"monthlyEarnings from admin home controller")
          const totalRevenueValue=totalRevenue.length>0?totalRevenue[0].totalAmount:0;
        //   console.log(totalRevenueValue,"from admin controller home")
          const monthlyEarningsValue= monthlyEarnings.length>0?monthlyEarnings[0].monthlyAmount:0;

          const newUsers= await user.find({is_blocked:0,is_admin:0})
          .sort({date:-1})
          .limit(5);

          const monthlyDataArray= await getMonthlyDataArray();
          const dailyDataArray= await getDailyDataArray();
          const yearlyDataArray= await getYearlyDataArray();
          const monthlyOrderCounts=monthlyDataArray.map((item)=>item.count);
          const dailyOrderCounts= dailyDataArray.map((item)=>item.count);
          const yearlyOrderCounts= yearlyDataArray.map((item)=>item.count);
        res.render('./admin/adminhome',{admin:adminData,
            totalRevenue:totalRevenueValue,
            totalOrders,
            totalCategories,
            totalProducts,
            totalUsers,
            newUsers,
            orders,
            monthlyEarningsValue,
            topSellingProducts,
            topSellingCategories,
            monthlyOrderCounts,
            dailyOrderCounts,
            yearlyOrderCounts
});
    }
    catch(err){
        console.log(err);
    }
}

const adminlogin=async(req,res)=>{
    try{
        res.render('./admin/adminlogin');
    }
    catch(err){
        console.log(err);
    }
}

const verifylogin=async(req,res)=>{
    try{
        console.log('in');
        const email=req.body.email;
        const password=req.body.password;
        console.log(email,"email",password,"password");

        const userData=await user.findOne({email:email});
        console.log(userData,"useradmin")
        if(!email||!password){
            console.log("in if ")
            res.render('./admin/adminlogin',{alert:"please enter both email ans password"})
        }else if(userData){
            console.log("else if ")
            const macthpassword= await bcrypt.compare(password,userData.password);
            if(macthpassword && userData.is_admin==1){
                console.log('admin');
                req.session.admin_id=userData._id;
                res.redirect('/admin/home');
            }else{
                res.render('./admin/adminlogin',{alert:"Email and password is incorrect"});
            }
        }else {
            res.render("./admin/adminlogin", { message: "Email and password is incorrect" });
          }
    }catch(error){
        console.log(error);
    }
};

const adminlogout=async(req,res)=>{
        try{
            req.session.admin_id=null;
            console.log("hello admin");
            res.redirect('/admin')
        }catch(err){
        console.log(error);
    }
};

const usermanage= async(req,res)=>{
    try {
        const adminData = await user.findById(req.session.admin_id);
    
        const usersData = await user.find({is_admin:0});
    console.log(usersData)
        res.render('admin/usermanage', { user: usersData, admin: adminData });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error: " + error.message);
      }
}

const BlockAndUnblockuser = async (req, res) => {
    try {
      const id = req.query.id;
      const uservalue = await user.findById(id);
      uservalue.is_blocked=!uservalue.is_blocked
      await uservalue.save();

      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Failed to unlist user" });
    }
  };
module.exports={
    adminhome,
    adminlogin,
    verifylogin,
    adminlogout,
    usermanage,
    BlockAndUnblockuser
}
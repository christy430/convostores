const User= require('../../model/usermodel');
const Category= require('../../model/categorymodel');
const Product=require('../../model/productmodel');

const loadAllCategory= async(req,res)=>{
    try{
        // console.log("from loadall  category")
        const userId=req.session.user_id;
        const userData=await User.findById(userId);
        const categoryId= req.query.categoryId;
        const searchQuery=req.query.query||'';
        const products= await Product.find();
        const categories= await Category.find();

        let totalProducts;

        const sort=req.query.sort;
        console.log(sort,"from controller")
        let sortOption={};
        if(sort==='asc'){
            console.log("if is   working")
            sortOption={price:1}
        }else if(sort==='desc'){
            console.log("else if  working2")
            sortOption={price:-1}
        }else{
            sortOption={};
        }

        const findQuery=categoryId?{category:categoryId}:{};
        if(searchQuery){
            findQuery.name={ $regex: new RegExp(searchQuery, 'i') };
        }

        totalProducts= await Product.countDocuments(findQuery);

        const page= req.query.page||1;
        const itemsPerPage=6;
        const totalPages=Math.ceil(totalProducts/itemsPerPage);

        const options={
            page:page,
            limit:itemsPerPage,
            sort:sortOption,
            query:findQuery
        };
        console.log(options, "from all category controller")

        const paginatedProducts= await Product.paginate(findQuery,options)

        res.render("./user/allcategory", {
            user: userData,
            products: paginatedProducts.docs, // Use paginatedProducts.docs instead of paginatedProducts.page
            categories,
            totalPages: totalPages,
            currentPage: paginatedProducts.page,
            query: findQuery,
            sort,
            categoryId: categoryId,
            searchQuery: searchQuery
        });
        
    }catch(error){
        console.log(error);
    }
}

const filterProducts = async (req, res) => {
    try {
      const { minPrice, maxPrice } = req.body;
  
      if (!minPrice || !maxPrice) {
        return res.status(400).json({ error: 'Minimum and maximum prices are required' });
      }
  
      const products = await Product.find({
        price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) },
        is_listed: true, // Assuming you only want to filter listed products
      });
  
      res.render('user/shop', { products, userData, categories });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


const loadMensCategory= async(req,res)=>{
    try{
        res.render("./user/mensCategory",{user:null});
    }catch(error){
        console.log(error);
    }
}

const loadWomensCategory= async(req,res)=>{
    try{
        res.render("./user/womensCategory",{user:null});
    }catch(error){
        console.log(error);
    }
}

const loadkidsCategory= async(req,res)=>{
    try{
        res.render("./user/kidsCategory",{user:null});
    }catch(error){
        console.log(error);
    }
}


module.exports={
    loadAllCategory,
    filterProducts,
    loadMensCategory,
    loadWomensCategory,
    loadkidsCategory
}
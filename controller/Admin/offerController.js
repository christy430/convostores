const Product= require("../../model/productmodel");
const Category= require('../../model/categorymodel');
const Offer= require('../../model/offermodel');

const loadAddOffer= async(req,res)=>{
    try{
        const admin = req.session.adminData;
        const product = await Product.find().sort({ date: -1 });
        const category = await Category.find().sort({ date: -1 });
        res.render("admin/addOffer", { admin, product, category });
    }catch(error){
        console.log(error);
    }
}

const listOffers = async (req, res) => {
    try {
        console.log("in list offers")
        const admin = req.session.adminData;
        const page = parseInt(req.query.page) || 1;
        let query = {};
        const limit = 6;
        const totalCount = await Offer.countDocuments(query);
    
        const totalPages = Math.ceil(totalCount / limit);
        if (req.query.discountOn) {
            if (req.query.discountOn === "product") {
            query.discountOn = "product";
            } else if (req.query.discountOn === "category") {
            query.discountOn = "category";
            }
        }
        const offer = await Offer.find(query)
            .populate("discountedProduct")
            .populate("discountedCategory")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ startDate: -1 });
            console.log(offer);
            res.render("admin/listoffer", {offer,admin: admin,totalPages,currentPage: page});
    } catch (error) {
      console.log(error.message);
    }
};

const addOffer = async (req, res) => {
    try {
        const admin = req.session.admin_id;
        const {
            offer_name,
            discountValue,
            discountOn,
            maxAmt,
            expiryDate,
            startDate,
            discountedProduct,
            discountedCategory
        } = req.body;

        const existingNameOffer = await Offer.findOne({ name: offer_name });
        const existingCategoryOffer = discountedCategory && (await Offer.findOne({ discountedCategory }));
        const existingProductOffer = discountedProduct && (await Offer.findOne({ discountedProduct }));

        if (existingNameOffer) {
            return res.status(400).json({ success: false, error: "Duplicate Discount Name not allowed." });
        }

        if (discountedCategory && existingCategoryOffer) {
            return res.status(400).json({ success: false, error: "An offer for this category already exists." });
        }

        if (discountedProduct && existingProductOffer) {
            return res.status(400).json({ success: false, error: "An offer for this product already exists." });
        }

        const newOffer = new Offer({
            name: offer_name,
            discountOn,
            discountValue,
            maxAmt,
            startDate,
            endDate: expiryDate,
            discountedProduct: discountedProduct ? discountedProduct : null,
            discountedCategory: discountedCategory ? discountedCategory : null,
        });

        await newOffer.save();

        if (discountedProduct) {
            const discountedProductData = await Product.findById(discountedProduct);

            let discount = (discountedProductData.price * discountValue) / 100;

            await Product.updateOne({
                _id: discountedProduct
            }, {
                $set: {
                    discountPrice: calculateDiscountPrice(discountedProductData.price, discountValue),
                    discount,
                    discountStart: startDate,
                    discountEnd: expiryDate,
                    discountStatus: true,
                },
            });
        } else if (discountedCategory) {
            const categoryData = await Category.findById(discountedCategory);
            const data = await Category.updateOne({
                _id: discountedCategory
            }, {
                $set: {
                    discountValue,
                    discountStart: startDate,
                    discountEnd: expiryDate,
                    discountStatus: true,
                },
            });
            const discountedProductData = await Product.find({ category: categoryData._id });
            for (const product of discountedProductData) {
                let discount = (product.price * discountValue) / 100;
                await Product.updateOne({
                    _id: product._id
                }, {
                    $set: {
                        discountPrice: calculateDiscountPrice(product.price, discountValue),
                        discount,
                        discountStart: startDate,
                        discountEnd: expiryDate,
                        discountStatus: true,
                    },
                });
            }
        }

        return res.status(200).json({ success: true, message: "Offer added successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: "An error occurred while adding the offer" });
    }
};

          
// Helper function to calculate discount price
function calculateDiscountPrice(price, discountValue) {
    // Implement your logic to calculate the discounted price here
    // For example:
    let discountedPrice = price;
  
  
      discountedPrice -= (price * discountValue) / 100;
  
  
    return discountedPrice;
  }

// Function to laod offer edit page
const loadEditOffer = async (req, res) => {
    try {
      const product = await Product.find().sort({ date: -1 });
      const category = await Category.find().sort({ date: -1 });
      const offerId = req.query.offerId;
      const admin = req.session.adminData;
      const offer = await Offer.findById(offerId)
        .populate("discountedProduct")
        .populate("discountedCategory");
        console.log(offer,"offer");
      const startDate = new Date(offer.startDate).toISOString().split("T")[0];
      const endDate = new Date(offer.endDate).toISOString().split("T")[0];
      console.log(offer);
      res.render("admin/editoffer", {admin,offer,product,category,startDate,endDate,});
    } catch (error) {
      console.log(error.message);
    }
  };

const editOffer = async (req, res) => {
    try {
      const offerId = req.query.id;
      const {
     
        offer_name,
        discountValue,
  
        discountOn,
        maxAmt,
        expiryDate,
        startDate,
        discountedProduct,
        discountedCategory,
      } = req.body;
  
      console.log(req.body);
      const existingOffer = await Offer.findById(offerId);
  
      if (!existingOffer) {
        return res.status(400).json({ success: false, error: "Offer not found" });
      }
  
      if (offer_name !== existingOffer.offer_name) {
        const existingNameOffer = await Offer.findOne({ offer_name });
        if (existingNameOffer) {
          return res
            .status(400)
            .json({
              success: false,
              error: "Duplicate Discount Name not allowed.",
            });
        }
      }
  
      const categoryChanged =
        String(existingOffer.discountedCategory) !== String(discountedCategory)
          ? discountedCategory
          : null;
  
      const productChanged =
        String(existingOffer.discountedProduct) !== String(discountedProduct)
          ? discountedProduct
          : null;
  
      if (categoryChanged && existingOffer.discountedCategory) {
     
        await Category.updateOne(
          { _id: existingOffer.discountedCategory },
          { $set: { discountStatus: false } }
        );
        const discountedCategoryData = await Category.findById(
          existingOffer.discountedCategory
        );
        await Product.updateMany(
          { category: discountedCategoryData._id },
          { $set: { discountStatus: false } }
        );
      }
  
      if (productChanged && existingOffer.discountedProduct) {
    
        await Product.updateOne(
          { _id: existingOffer.discountedProduct },
          { $set: { discountStatus: false } }
        );
      }
  
  
      const updatedOffer = await Offer.findByIdAndUpdate(
        { _id: offerId },
        {
          $set: {
            name: offer_name,
            discountOn,
     
            discountValue,
            maxAmt,
            startDate,
            endDate: expiryDate,
            discountedProduct: discountedProduct ? discountedProduct : null,
            discountedCategory: discountedCategory ? discountedCategory : null,
          },
        },
        { new: true } // To get the updated document
      );
  
      if (discountedProduct) {
        const discountedProductData = await Product.findById(discountedProduct);
  
        let discount = 0;
    
          discount = (discountedProductData.price * discountValue) / 100;
       
  
        await Product.updateOne(
          { _id: discountedProduct },
          {
            $set: {
              discountPrice: calculateDiscountPrice(
                discountedProductData.price,
        
                discountValue
              ),
              discount,
              discountStart: startDate,
              discountEnd: expiryDate,
              discountStatus: true,
            },
          }
        );
      } else if (discountedCategory) {
        const categoryData = await Category.findById(discountedCategory);
  console.log("fghfh");
        await Category.updateOne(
          { _id: discountedCategory },
          {
            $set: {
          
              discountValue,
              discountStart: startDate,
              discountEnd: expiryDate,
              discountStatus: true,
            },
          }
        );
  
        const discountedProductData = await Product.find({
          category: categoryData._id,
        });
  
        for (const product of discountedProductData) {
          let discount = 0;
        
            discount = (product.price * discountValue) / 100;
       
          await Product.updateOne(
            { _id: product._id },
            {
              $set: {
                discountPrice: calculateDiscountPrice(
                  product.price,
            
                  discountValue
                ),
                discount,
                discountStart: startDate,
                discountEnd: expiryDate,
                discountStatus: true,
              },
            }
          );
        }
      }
  
      res.status(200).json({ success: true, message: "offer updated successfully", });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: "Failed to update offer" });
    }
  };

const listAndUlistOffer = async (req, res) => {
    try {
        const id = req.query.offerId;
    
        const offer = await Offer.findById(id);
    
        offer.isActive = !offer.isActive;
    
        if (offer.discountedProduct) {
          const discountedProduct = await Product.findById(offer.discountedProduct);
          if (offer.isActive == false) {
            discountedProduct.discountPrice = discountedProduct.price;
          } else {
            let discount = 0;
         
              discount = (discountedProduct.price * offer.discountValue) / 100;
         
            discountedProduct.discountPrice = calculateDiscountPrice(
              discountedProduct.price,
            
              offer.discountValue
            );
          }
    
          if (discountedProduct) {
            discountedProduct.discountStatus = offer.isActive;
            await discountedProduct.save();
          }
        } else if (offer.discountedCategory) {
          const discountedCategory = await Category.findById(
            offer.discountedCategory
          );
          const discountedProductData = await Product.find({
            category: discountedCategory._id,
          });
          if (discountedCategory) {
            discountedCategory.discountStatus = offer.isActive;
            await discountedCategory.save();
            const discountedProducts = await Product.updateMany(
              { category: discountedCategory._id },
              { $set: { discountStatus: offer.isActive } }
            );
          }
          for (const product of discountedProductData) {
            if (offer.isActive == false) {
              product.discountPrice = product.price;
            } else {
              let discount = 0;
           
                discount = (product.price * offer.discountValue) / 100;
            
              product.discountPrice = calculateDiscountPrice(
                product.price,
             
                offer.discountValue
              );
            }
            await product.save();
          }
        }
    
        await offer.save();
        res.redirect("/admin/listOffers");
      } catch (error) {
        console.log(error);
      }
    };
  

  module.exports={
    listOffers,
    loadAddOffer,
    addOffer,
    loadEditOffer,
    editOffer,
    listAndUlistOffer
  }
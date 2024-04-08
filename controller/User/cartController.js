const product= require("../../model/productmodel");
const User= require("../../model/usermodel");
const address = require("../../model/addressmodel");
const cart=require("../../model/cartmodel");
const{ calculateProductTotal,calculatesubtotal}=require("../../config/cartsum");


const loadcart= async(req,res)=>{
    try{
        const userId= req.session.user_id;
        const userdata= await User.findById(userId);
        if(userdata){
            const usercart= await cart.findOne({user:userId}).populate("items.product");

            if(usercart){
                const cart= usercart ? usercart.items:[];

                const subtotal=calculatesubtotal(cart);

                const productTotal=calculateProductTotal(cart);

                const subtotalwithshipping=subtotal;

                let outofstockerror=false;

                if(cart.length>0){
                    for(const cartitem of cart){
                        const product=cartitem.product;

                        if(product.quantity<cartitem.quantity){
                            outofstockerror=true;
                            break;
                        }
                    }
                }
                let maxquantityerror=false;
                if(cart.length>0){
                    for(const cartitem of cart){
                      const product=cartitem.product;
                      
                      if(cartitem.quantity>2){
                        maxquantityerror=true;
                        break;
                      }
                    }
                }
                // console.log( subtotalwithshipping,"const subtotalwithshipping")
                res.render('./user/cart',{ user:userdata,productTotal,subtotalwithshipping,outofstockerror,maxquantityerror,cart});  
            }
        }else{
            res.redirect('/login');
        }
    
    }catch(error){
        console.log(error);
        
    }
}

const addtocart = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const product_id = req.body.productData_id;
      const { qty, size } = req.body;
      const existingcart = await cart.findOne({ user: userId }).populate("items.product");
      const productToupdate = await product.findById(product_id);
      if (productToupdate) {
        const selectedsize = productToupdate.sizes.find((s) => s.size === size);
  
        if (selectedsize && selectedsize.stock >= parseInt(qty)) {

          if (existingcart) {

            const existingcartitem = existingcart.items.find(
              (item) =>  item.product._id.toString() === product_id
            );
            
            if (existingcartitem?.size == size) {
              console.log("gfygdsgfgn");
              existingcartitem.quantity += parseInt(qty);
            } else {
              existingcart.items.push({
                product: product_id,
                quantity: parseInt(qty),
                size,
              });
            }
            // console.log("product to update from cartcontroller")

            existingcart.total = existingcart.items.reduce((total, item) => total + (item.quantity || 0), 0);
              await existingcart.save();
         
          return res.status(200).json({ success: true, message: 'Cart updated successfully' });
          } else {
            const newCart = new cart({
              user: userId,
              items: [{ product: product_id, quantity: parseInt(qty), size }],
              total: parseInt(qty, 10),
            });
  
            await newCart.save();
            console.log("gghkdjhgkh");
            return res.status(200).json({ success: true, message: 'New cart created successfully' });
          }
        } else {
          return res.status(400).json({ success: false, message: 'Out of stock or invalid quantity' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Product not found' });
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  
const updatecart= async(req,res)=>{
    try{
       
        const userid=req.session.user_id;
        const productid=req.query.productId;
        const{newQuantity,newSize}=req.body;
        let newsizeData=parseInt(newSize,10)

        const existingcart= await cart.findOne({user:userid}).populate("items.product");
        const productToupdate= await product.findById(productid);
        const selectedsize= productToupdate.sizes.find((s)=>s.size === newSize);

        if(selectedsize && selectedsize.stock>=parseInt(newQuantity)){
            console.log("in if loop in cartcontroller");
            const existingcartitem= existingcart.items.find((item)=>item.product._id.toString()=== productid);
            
            if(existingcart && existingcartitem.size===newsizeData){

                existingcartitem.quantity=parseInt(newQuantity);
                const subtotal = existingcart.items.reduce((total, item) => total + (item.quantity * item.product.price), 0);

                existingcart.total=existingcart.items.reduce((total,item)=>total+(item.quantity || 0),0);
            }
            console.log(existingcart,"existingcart");
            await existingcart.save();
            return res.status(200).json({
              success: true,
              message: 'Cart updates successfully',
              subtotal: existingcart.subtotal, // Assuming you have the subtotal value in your cart object
              total: existingcart.total // Assuming you have the total value in your cart object
          });        }else{
            return res.status(400).json({success:false,error:'out of stock or invalid quantity'});
        }
    }catch(error){
        console.log(error,"error updating cart");
        res.json({success:false,error:"internal server error"})
    }
};

const removefromcart= async(req,res)=>{
  try{
   
    const userid=req.session.user_id;
    const productId=req.query.productId;
    console.log(productId,"prodiuctid")
    const existingcart= await cart.findOne({user:userid});
    if(existingcart){
     
      const updateditems= existingcart.items.filter(
        (item)=>item.product.toString()!== productId
        
      );
      console.log(updateditems,"updateditems")
      existingcart.items=updateditems;
      console.log(existingcart,"existingcart");
      existingcart.total=updateditems.reduce(
        (total,item)=>total+(item.quantity ||0),0);
        await existingcart.save();
        console.log("in remove from cart-> reduce")

        res.json({success:true,toaster:true});
    }else{
      res.json({success:false,error:"Cart not found"});
    }
  }catch(error){
    console.log(error);
  }
}




module.exports={
    loadcart,
    addtocart,
    updatecart,
    removefromcart
}
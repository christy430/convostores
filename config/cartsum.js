const calculatesubtotal=(cart)=>{
    let subtotal=0;
    for(const cartitem of cart){
        const isDiscounted=cartitem.product.discountStatus &&
        new Date(cartitem.product.discountStart)<=new Date() &&
        new Date(cartitem.product.discountEnd)>= new Date();

        const priceToconsider = isDiscounted? cartitem.product.discountPrice: cartitem.product.price;

        subtotal+= priceToconsider*cartitem.quantity;
    }
    return subtotal;
}

const calculateProductTotal=(cart)=>{
    const productTotal=[];
    for(const cartitem of cart){
        const isDicsounted=cartitem.product.discountStatus &&
        new Date(cartitem.product.discountStart)<= new Date() &&
        new Date(cartitem.product.discountEnd)>= new Date();

        const priceToconsider= isDicsounted? cartitem.product.discountPrice:cartitem.product.price;
        // const total= priceToconsider*cartitem.quantity.toFixed(2);
        const total = parseFloat((priceToconsider * cartitem.quantity).toFixed(2));


        console.log("from config cartsum:-", total);
        productTotal.push(total);
    }
    return productTotal;
}

function calculateDisountedTotal(total,discountpercentage){
    if(discountpercentage<0 || discountpercentage>100){
        throw new Error('Discount percentage must be between 0 and 100.');
    }
    const discountAmount=(discountpercentage/100)*total;
    const discountedTotal= total-discountAmount;
console.log(discountedTotal,"fdfdfdfdf");
    return discountedTotal;
}

module.exports={
    calculateDisountedTotal,
    calculatesubtotal,
    calculateProductTotal
}
const User = require ("../models/userModel");
const Product = require("../models/productModel");
const Cart= require("../models/cartModel");
const Address = require('../models/addressModel'); 
const { query } = require("express");

const loadCart = async(req,res)=>{
    try {

        const id = req.session.user_id;
        const loggedIn = req.session.user_id;
        const userData = await User.findOne({_id:id});
        const cartData = await Cart.findOne({user:id}).populate("products.productId");
        if (req.session.user_id) {
            if(cartData){
                if(cartData.products.length > 0){
                    const products = cartData.products;
                    const total = await Cart.aggregate([
                        {
                            $match :{
                                userName:userData.name
                            }
                        },
                        {
                            $unwind :"$products"
        
                        },
                        {
                            $project :{
                                productPrice :"$products.productPrice",
                                count :"$products.count"
                            }
                        },
                        {
                            $group:{
                               _id:null,
                               total :{$sum:{$multiply:["$productPrice","$count"]}}
                            }
                        }
                    ]);
                    const Total = total[0].total;
                    const userId = userData._id;
                    res.render('cart',{loggedIn,userData,products,Total,userId});
                } else {
                    res.render('emptyCart', { loggedIn,message:"Your Cart is Empty!!"});
                }
            } else {
                res.render('emptyCart', { loggedIn,message:"Your Cart is Empty!!"});
            }
            
        } else {
            res.redirect('/login');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async(req,res)=>{
    try {
        const productId = req.query.id;
        const userData = await User.findOne({_id:req.session.user_id});
        const productData = await Product.findOne({_id:productId});
        

        if(req.session.user_id){
            const userId = req.session.user_id;
            const cartData = await Cart.findOne({user:userId});
            if(cartData){
                const productExist = await cartData.products.findIndex((product)=>
                    product.productId == productId
                )
                if(productExist != -1){
                    await Cart.updateOne({user:userId,"products.productId":productId},{$inc:{"products.$.count":1}});
                    // res.json({success:true});
                    res.redirect('/cart');
                } else {
                    await Cart.findOneAndUpdate({user:userId},{$push:{products:{productId:productId,productPrice:productData.price}}});
                    // res.json({success:true});
                    res.redirect('/cart');

                }
            }else {
                const cart = new Cart({
                    user : userData._id,
                    userName : userData.name,
                    products:[{
                        productId : productId,
                        productPrice:productData.price
                    }]
                });

                const cartData = await cart.save();
                if(cartData){
                    // res.json({success:true});
                    res.redirect('/cart');
                } else {
                    res.redirect('/');
                }
            }
        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
    }
}
const removeFromCart = async(req,res)=>{
    try {

       const user = req.session.user_id;
       const  productId = req.query.id;
       await Cart.updateOne({user:user},{$pull:{products:{productId:productId}}});
       res.redirect('/cart');

    } catch (error) {
        console.log(error.message);
    }
}

const changeQuantity=async(req,res)=>{
    try {

        const userId = req.body.user;
        const proId = req.body.product;
        let count = req.body.count;
        count = parseInt(count);
        const cartData = await Cart.findOne({user: userId });
        const [{count:quantity}] = cartData.products;
        const productData = await Product.findOne({ _id: proId });
        if(productData.stock < quantity+count){
            res.json({check:true});
        } else {
            res.json({success:true});
            await Cart.updateOne({user:userId,"products.productId":proId},{$inc:{"products.$.count":count}});
        }

        
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckout = async(req,res)=>{
    try {
        const loggedIn = req.session.user_id;
        const userData = await User.findOne({_id :req.session.user_id});
        const addressData = await Address.findOne({userId:req.session.user_id});
        if(addressData){
            const addresses = addressData.addresses;
            const total = await Cart.aggregate([
                { 
                    $match: { 
                        userName: userData.name 
                    } 
                }, 
                {
                    $unwind: "$products" 
                }, 
                { 
                    $project: { 
                        productPrice: "$products.productPrice", 
                        count: "$products.count" 
                    } 
                }, 
                { 
                    $group: {
                         _id: null, 
                         total: { $sum: { $multiply: ["$productPrice", "$count"] } } 
                        } 
                    }
                ]);
                const Total = total[0].total
                res.render('checkout',{loggedIn,addresses,userData,Total});


        } else {
            console.log("no address");
        }


        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCart,
    addToCart,
    removeFromCart,
    changeQuantity,
    loadCheckout

}
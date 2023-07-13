const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const addToWishlist = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const proId = req.body.query;
        const userData = await User.findOne({_id:userId});
        const productData = await Product.findOne({_id:proId});
        const WishlistData = await Wishlist.findOne({user:userId});
        if(WishlistData){
            const checkWishlist = await WishlistData.products.findIndex((wish)=> wish.productId == proId);
            if(checkWishlist != -1){
               res.json({check:true});
            } else {
                await Wishlist.updateOne(
                    { user :userId },
                    { $push :{ products :{ productId:proId } } }
                    
                );  
                res.json({ success: true });             
            }
        } else {
            const wishlist = new Wishlist({
                user :userId,
                userName : userData.name,
                products :[{
                    productId :productData._id
                }]
            });
            const wish = await wishlist.save();
            if(wish){
                res.json({ success: true });
            }
        }
        
    } catch (error) {

        console.log(error.message);
    }
}

const loadWishlist = async(req,res)=>{
    try {

        const userId = req.session.user_id;
        const userData = await User.findOne({_id:userId});
        const wishlistData = await Wishlist.findOne({user:userId}).populate("products.productId")
        const wish = wishlistData.products;
        if(wish.length >0){
            if(req.session.user_id){
                res.render('wishlist',{loggedIn:userId,userData,wish});
            } else {
                res.redirect('/');
            }
        } else {
            res.render('emptyWishlist',{loggedIn:userId,message:"No product Added to Wishlist!!"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const removeFromWishlist = async(req,res)=>{
    try {

        const proId = req.query.id;
        const userId = req.session.user_id;
        await Wishlist.updateOne({user:userId},{$pull :{products :{productId:proId}}});
        res.redirect('/wishlist');
        
    } catch (error) {
        console.log(error.message);
    }
}

const addProductFromWishlist = async(req,res)=>{
    try {
        const prodId = req.query.id;
        const userId = req.session.user_id;
        const userData = await User.findOne({_id:userId});
        const productData = await Product.findOne({_id:prodId});
        if(userId){
            const cartData = await Cart.findOne({ user: userId });
            if(cartData){
                const existingProduct = await cartData.products.findIndex((product)=>{
                    product.productId == prodId;
                });
                if(existingProduct != -1){
                    await Cart.updateOne({user :userId,"products.productId":prodId},{$inc:{"products.$.count":1}});
                    await Wishlist.updateOne({user:userId},{$pull:{productId:prodId}});
                    res.redirect('/wishlist');
                } else {
                    await Cart.updateOne({user:userId},{$push:{products:{productId:prodId}}});
                    await Wishlist.updateOne({user:userId},{$pull:{products:{productId:prodId}}});
                    res.redirect('/wishlist');
 
                }
            } else {
                const cart = new Cart({
                    user :userId,
                    userName :userData.name,
                    products :[{
                        productId :prodId,
                        productPrice :productData.price
                    }]
                });

                const cartData = await cart.save();
                if(cartData){
                    await Wishlist.updateOne({user:userId},{$pull:{products:{productId:prodId}}});
                    console.log("added new cart and product");
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
module.exports = {
    addToWishlist,
    loadWishlist,
    removeFromWishlist,
    addProductFromWishlist
}
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require('../models/addressModel'); 
const Order = require('../models/orderModel')
const Razorpay = require('razorpay');
require('dotenv').config();

var instance = new Razorpay ({
    key_id: 'rzp_test_B0cfXKkM2OrzLj',
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

const placeOrder = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id});
        const address = req.body.address;
        const paymentMethod = req.body.payment;
        const cartData = await Cart.findOne({user: req.session.user_id});
        const products = cartData.products;
        const total = parseInt(req.body.amount);
        const grandTotal = parseInt(req.body.total);
        const status = paymentMethod === "COD" ? "placed" : "pending";
        const order = new Order({
            deliveryAddress: address,
            userId: req.session.user_id,
            userName :userData.name,
            paymentMethod: paymentMethod,
            products: products,
            amount: total,
            totalAmount: grandTotal,
            date: new Date(),
            status: status,
        });

        const orderData = await order.save();
        const date = orderData.date.toISOString().substring(5,7);
        const orderId = orderData._id;
        if(orderData){
            for(let i=0;i<products.length;i++){
                const productId = products[i].productId;
                const count = products[i].count;
                await Product.findByIdAndUpdate({_id:productId},{$inc:{stock: -count}});

            }
            if(order.status == "placed"){
                // const wallet = totalPrice - Total;
                await Order.updateOne({_id:orderId},{$set:{month:date}});
                await Cart.deleteOne({user: req.session.user_id});
                res.json({codSuccess : true});
            } else {
                
                const orderId = orderData._id;
                await Order.updateOne({ _id: orderId }, { $set:{ month: date }});
                const totalAmount = orderData.totalAmount;
                var options = {
                    amount :totalAmount * 100,
                    currency: "INR",
                    receipt: "" + orderId
                }
                instance.orders.create(options,function(err,order){
                    res.json({order});
                })
            }
        } else {
            res.redirect('/checkout');
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyPayment = async(req,res)=>{
    try {

        // const totalPrice = req.body.amount2;
        // const total = req.body.amount
        const details = req.body;
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_KEY);
        hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if(hmac == details.payment.razorpay_signature){
            await Order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } });
            await Order.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { paymentId: details.payment.razorpay_payment_id } });
            await Cart.deleteOne({ user: req.session.user_id });
            res.json({success: true});

        } else {
            await Order.findByIdAndRemove({_id: details.order.receipt});
            res.json({success: false});
        }

        
    } catch (error) {
        console.log(error.message);
    }
}

// load user orders

const loadMyOrders = async(req,res)=>{
    try {
        const loggedIn = req.session.user_id;
        const userData = await User.findOne({ _id: req.session.user_id });
        const orderData = await Order.find({ userId: req.session.user_id }).sort({ date: -1});
        res.render('myOrders',{loggedIn,orders: orderData});

        
    } catch (error) {
        console.log(error.message);
    }
}

const viewOrderedProduct = async(req,res)=>{
    try {

        const loggedIn = req.session.user_id;
        const orderId = req.query.id;
        const orderData = await Order.findOne({ _id: orderId }).populate("products.productId");
        const products = orderData.products;
        if(products.length > 0){
            res.render('orderedProduct',{orderData,products,loggedIn});
        }

        
    } catch (error) {
        console.log(error.message);
    }

}

// cancel Order

const cancelOrder = async(req,res)=>{
    try {

        const userId = req.session.user_id;
        const orderId = req.body.orderId;
        const userData = await User.findOne({ _id: userId });
        const orderData = await Order.findOne({ _id: orderId });
        let wallet = userData.wallet;
        if(orderData){
            if(orderData.status == "placed"  || orderData.status == "Shipped"){
                const totalWallet =wallet+=orderData.totalAmount;
                await User.findByIdAndUpdate(userId, { $set: { wallet: totalWallet }});
                for(const product of orderData.products){
                    const productId = product.productId;
                    const count = product.count;
                    await Product.findByIdAndUpdate(productId, { $inc: { stock: count }});
                }    
                await Order.findByIdAndUpdate(orderId, { $set: { status: "Cancelled" } });
                res.json({success: true});

            } else {
                await Order.findByIdAndUpdate(orderId, { $set: { status: "Cancelled" } });
                res.json({success: true});
            }

        } else {
            res.json({success: false});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// return Order

const returnOrder = async(req,res)=>{
    try {

        const userId = req.session.user_id;
        const orderId = req.body.orderId;
        const userData = await User.findOne({ _id: userId });
        const orderData = await Order.findOne({ _id: orderId });
        let wallet = userData.wallet;
        if (orderData) {
            if(orderData.status === "Delivered"){
                const totalWallet = wallet+=orderData.amount;
                await User.findByIdAndUpdate(userId, { $set: { wallet: totalWallet } });
                for (const product of orderData.products) {
                    const productId = product.productId;
                    const count = product.count;
                    await Product.findByIdAndUpdate(productId, { $inc: { stock: count } });
                }    
                await Order.findByIdAndUpdate(orderId, { $set: { status: "Returned" } });
                res.json({ success: true })

            }

        } else {
            res.json({ success: false });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// admin side order list

 const adminOrderLists = async(req,res)=>{
    try {

        const orderData = await Order.find({}).sort({ date: -1 });
        res.render('orderList',{ orders: orderData });
        
    } catch (error) {
        console.log(error.message);
    }
}

const shippedOrder = async(req,res)=>{
    const orderId = req.query.id;
    await Order.findByIdAndUpdate(orderId,{ $set: { status : "Shipped" } })
    res.redirect('/admin/orderList');
}

const deliveredOrder = async (req, res) => {
    const orderId = req.query.id;
    await Order.findByIdAndUpdate(orderId, { $set: { status: "Delivered" } })
    res.redirect('/admin/orderList');
}

const showOrderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id;
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId');
        const products = orderData.products;
        res.render('orderDetails',{ order:orderData,products});
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    placeOrder,
    verifyPayment,
    loadMyOrders,
    viewOrderedProduct,
    cancelOrder,
    returnOrder,
    adminOrderLists,
    shippedOrder,
    deliveredOrder,
    showOrderDetails
}
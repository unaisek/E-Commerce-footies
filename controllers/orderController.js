const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Address = require('../models/addressModel'); 
const Order = require('../models/orderModel');
const Wallet = require('../models/walletModel');
const Razorpay = require('razorpay');
require('dotenv').config();

var instance = new Razorpay ({
    key_id: 'rzp_test_B0cfXKkM2OrzLj',
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

const placeOrder = async(req,res,next)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findOne({ _id: userId });
        const address = req.body.address;
        const paymentMethod = req.body.payment;
        const cartData = await Cart.findOne({ user: userId });
        const products = cartData.products;
        const total = parseInt(req.body.amount);
        const grandTotal = parseInt(req.body.total);
        const status = paymentMethod === "COD" || "wallet" ? "placed" : "pending";
        const order = new Order({
            deliveryAddress: address,
            userId: userId,
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
            if(order.paymentMethod == "wallet"){
                const walletData = await Wallet.findOne({userId: userId});
                const wallet = walletData.walletAmount;
                const totalWallet = wallet - order.totalAmount;
                await Wallet.findOneAndUpdate({ userId: userId }, { $set: { walletAmount: totalWallet } });
                await Wallet.findOneAndUpdate({ userId: userId }, { $push: { wallet: { amount: orderData.totalAmount, transactionType: "Debited" } } });
                await Order.updateOne({ _id: orderId }, { $set: { month: date } });
                await Cart.deleteOne({ user: userId });
                res.json({ codSuccess: true });

            } else if (order.paymentMethod == "COD"){
                await Order.updateOne({_id:orderId},{$set:{month:date}});
                await Cart.deleteOne({ user: userId });
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
        next(error);
    }
}

const verifyPayment = async(req,res,next)=>{
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
        next(error);
    }
}

// order success
const loadOrderSuccess = async (req, res) => {
    try {

        const loggedIn = req.session.user_id;
        res.render('orderSuccess',{loggedIn});

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// load user orders

const loadMyOrders = async(req,res,next)=>{
    try {
        const loggedIn = req.session.user_id;
        const userData = await User.findOne({ _id: req.session.user_id });
        const orderData = await Order.find({ userId: req.session.user_id }).sort({ date: -1});
        res.render('myOrders',{loggedIn,orders: orderData});

        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


const viewOrderedProduct = async(req,res,next)=>{
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
        next(error);
    }

}

// cancel Order

const cancelOrder = async(req,res,next)=>{
    try {

        const userId = req.session.user_id;
        const orderId = req.body.orderId;
        const walletData = await Wallet.findOne({ userId: userId });
        const orderData = await Order.findOne({ _id: orderId });
        if(orderData){
            if(orderData.status == "placed"  || orderData.status == "Shipped"){
                if(walletData){
                    let wallet = walletData.walletAmount        
                    const totalWallet = wallet + orderData.totalAmount;
                    await Wallet.findOneAndUpdate({ userId: userId }, { $set: { walletAmount: totalWallet } });
                    await Wallet.findOneAndUpdate({ userId: userId }, { $push: { wallet: { amount: orderData.totalAmount, transactionType: "Credited" } } });
                } else {
                    const wallet = new Wallet({
                        userId: userId,
                        walletAmount: orderData.totalAmount,
                        wallet: [{
                            amount: orderData.totalAmount,
                            transactionType: "Credited",
                        }]
                    });
                     await wallet.save();
                }

                for (const product of orderData.products) {
                    const productId = product.productId;
                    const count = product.count;
                    await Product.findByIdAndUpdate(productId, { $inc: { stock: count } });
                }
                await Order.findByIdAndUpdate(orderId, { $set: { status: "Cancelled" } });
                res.json({ success: true });

            } else {
                await Order.findByIdAndUpdate(orderId, { $set: { status: "Cancelled" } });
                res.json({success: true});
            }

        } else {
            res.json({success: false});
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// return Order

const loadReturnPage = async(req,res,next)=>{
    try {

        const orderId = req.query.id;
        const loggedIn = req.session.user_id;
        res.render('returnReason',{orderId,loggedIn});
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const returnOrder = async(req,res,next)=>{
    try {

        const userId = req.session.user_id;
        const orderId = req.query.id;
        const returnReason = req.body.reasonReturn;
        const userData = await User.findOne({ _id: userId });
        const orderData = await Order.findOne({ _id: orderId });
        if (orderData) {
            if(orderData.status === "Delivered"){
                const updatedData = await Order.findByIdAndUpdate(orderId, { $set: { returnReason: returnReason, returnStatus: "Requested"  }});
                if(updatedData){
                    res.redirect('/myOrders')
                }
            }
        }        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// ADMIN 

// admin side order list

 const adminOrderLists = async(req,res,next)=>{
    try {
        const orderData = await Order.find({}).sort({ date: -1 });
        res.render('orderList',{ orders: orderData });
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const shippedOrder = async(req,res,next)=>{
    try {
        const orderId = req.query.id;
        await Order.findByIdAndUpdate(orderId,{ $set: { status : "Shipped" } })
        res.redirect('/admin/orderList');
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const deliveredOrder = async (req, res) => {
    try {
        
        const orderId = req.query.id;
        await Order.findByIdAndUpdate(orderId, { $set: { status: "Delivered" } })
        res.redirect('/admin/orderList');
    
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// order Return confirmation

const returnConfirmPage = async(req,res,next)=>{
    try {

        const orderId = req.query.id;
        const orderData = await Order.findOne({_id:orderId});
        if(orderData){
            res.render('returnConfirmPage',{order:orderData})
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

const returnApproved = async(req,res,next)=>{
    try {
        
        const orderId = req.query.id;
        const orderData = await Order.findOne({_id: orderId});
        const userId = orderData .userId;
        await Order.findByIdAndUpdate({_id: orderId}, { $set: { returnStatus: "Approved" , status: "Returned" } })    
        const walletData = await Wallet.findOne({userId: userId});
        if(walletData){
            const wallet = walletData.walletAmount;
            const totalWallet = wallet + orderData.totalAmount;
            await Wallet.findOneAndUpdate({userId: userId},{ $set: { walletAmount: totalWallet } });
            await Wallet.findOneAndUpdate({ userId: userId }, { $push: { wallet: { amount: orderData.totalAmount, transactionType: "Credited"} } });
        } else {
            const wallet = new Wallet({
                userId: userId,
                walletAmount: orderData.totalAmount,
                wallet:[{
                    amount: orderData.totalAmount,
                    transactionType: "Credited"
                }]
            });
            await wallet.save();
        }
        for (const product of orderData.products) {
            const productId = product.productId;
            const count = product.count;
            await Product.findByIdAndUpdate(productId, { $inc: { stock: count } });
        }
        res.redirect('/admin/orderList');

    } catch (error) {
        console.log(error.message);
        next(error);
    }
       

}

const returnRejected = async(req,res,next)=>{
    try {

        const orderId = req.query.id;
        await Order.findOneAndUpdate({_id: orderId},{ $set: { returnStatus: "Rejected" }});
        res.redirect('/admin/orderList');
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}
const showOrderDetails = async(req,res,next)=>{
    try {
        const orderId = req.query.id;
        const orderData = await Order.findOne({ _id: orderId }).populate('products.productId');
        const products = orderData.products;
        res.render('orderDetails',{ order:orderData,products});
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

module.exports = {
    placeOrder,
    verifyPayment,
    loadOrderSuccess, 
    loadMyOrders,
    viewOrderedProduct,
    cancelOrder,
    loadReturnPage,
    returnOrder,
    adminOrderLists,
    shippedOrder,
    deliveredOrder,
    returnConfirmPage,
    returnApproved,
    returnRejected,
    showOrderDetails
}
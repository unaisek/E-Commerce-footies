const User = require('../models/userModel');
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const dashboardHelpers = require('../helpers/dashboardHelper')
//---------------------------------------------



// ADMIN LOGIN
const loadLogin = async(req,res,next)=>{
    try {

        if(req.session.admin_id){   
            res.redirect('admin/dashboard');
        } else {
            res.render('login');
        }
        
    } catch (error) {
        console.log(error.message);
        next(error);
    }

}

const verifyAdmin = async(req,res,next)=>{
    try {
        const {email, password} = req.body;
        const adminData = await User.findOne({is_admin:1});
        if(adminData){
            const passwordMatch = await bcrypt.compare(password,adminData.password);
            if (passwordMatch && email === adminData.email){
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard');
            } else {
                res.render('login',{message:"incorrect email or password"});
            }
        } else {
            res.render('login', { message: "incorrect email or password" });
        }
    } catch (error) {
        console.log(error.message);
        next(error);  
     }
}

// admin Logout

const adminLogout = async(req,res,next)=>{
    try {
        
        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// load admin dashboard

const loadDashboard = async(req,res,next)=>{
    try {
        const productCount = await Product.count();
        const categoryCount = await Category.count(); 
        const orderCount = await Order.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today.getDate() - 1);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currMonthStartDate = new Date(currentYear,currentMonth, 1, 0, 0, 0);


        const promises = [
            dashboardHelpers.totalRevenue(),
            dashboardHelpers.paymentMethod(),
            dashboardHelpers.dailyChart(),
            dashboardHelpers.monthlyTotalRevenue(currMonthStartDate, now)
        ]
        const results = await Promise.all(promises);

        const totalRevenue = results[0];
        const paymentMethod = results[1];
        const dailyChart = results[2];
        const monthlyTotalRevenue = results[3];


        let codPayAmount,onlinePayAmount,walletPayAmount;
        if (paymentMethod[0]._id === 'COD'){
            codPayAmount = paymentMethod[0].amount;
        } else if (paymentMethod[0]._id === 'onlinePayment'){
            onlinePayAmount = paymentMethod[0].amount;
        } else if(paymentMethod[0]._id = "wallet"){
            walletPayAmount = paymentMethod[0].amount
        }

        if (paymentMethod[1]._id === 'COD') {
            codPayAmount = paymentMethod[1].amount;
        } else if (paymentMethod[1]._id === 'onlinePayment') {
            onlinePayAmount = paymentMethod[1].amount;
        } else if (paymentMethod[1]._id = "wallet") {
            walletPayAmount = paymentMethod[1].amount
        }

        if (paymentMethod[2]._id === 'COD') {
            codPayAmount = paymentMethod[2].amount;
        } else if (paymentMethod[2]._id === 'onlinePayment') {
            onlinePayAmount = paymentMethod[2].amount;
        } else if (paymentMethod[2]._id = "wallet") {
            walletPayAmount = paymentMethod[2].amount
        }
        
        // const codPayAmount = paymentMethod && paymentMethod.length > 0 ? paymentMethod[0].amount.toString() : 0 ;
        // console.log("code",codPayAmount);
        // const onlinePayAmount = paymentMethod && paymentMethod.length > 0 ? paymentMethod[1].amount.toString() : 0;
        // console.log("onli", onlinePayAmount);
        
        res.render('dashboard',{
            // admin:admin,
            totalRevenue: totalRevenue,
            onlinePayAmount: onlinePayAmount,
            codPayAmount: codPayAmount,
            walletPayAmount: walletPayAmount,
            dailyChart: dailyChart,
            productCount: productCount,
            orderCount: orderCount,
            categoryCount: categoryCount,
            monthlyTotalRevenue: monthlyTotalRevenue


        });


    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// load users list 

const loadUsers = async(req,res,next)=>{
    try {
        
    const userData = await User.find({is_admin:0});
        res.render('usersList',{users:userData});

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// block user

const blockUser = async(req,res,next)=>{
    try {     
        const id = req.query.id;
        const findUser = await User.findOne({_id:id});
        if(findUser.is_blocked === true){
            res.redirect('/admin/users')
        } else {
            await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}});
            res.redirect('/admin/users');
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

// unblock user

const unblockUser = async (req, res, next) => {
    try {

        const id = req.query.id;
        const findUser = await User.findOne({ _id: id });
        if (findUser.is_blocked === false) {
            res.redirect('/admin/users')
        } else {
            await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: false } });
            res.redirect('/admin/users');
        }

    } catch (error) {
        console.log(error.message);
        next(error);
    }
}


module.exports = {
    loadLogin,
    verifyAdmin,
    adminLogout,
    loadDashboard,
    loadUsers,
    blockUser,
    unblockUser

}
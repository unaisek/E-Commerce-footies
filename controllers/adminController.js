const User = require('../models/userModel');
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const bcrypt = require('bcrypt');
//---------------------------------------------



// ADMIN LOGIN
const loadLogin = async(req,res)=>{
    try {

        if(req.session.admin_id){   
            res.redirect('admin/dashboard');
        } else {
            res.render('login');
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

const verifyAdmin = async(req,res)=>{
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
     }
}

// admin Logout

const adminLogout = async(req,res)=>{
    try {
        
        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try {
        const admin = req.session.admin_id;
        res.render('dashboard',{admin:admin});


    } catch (error) {
        console.log(error.message);
    }
}

// load users list 

const loadUsers = async(req,res)=>{
    try {
        
    const userData = await User.find({is_admin:0});
        res.render('usersList',{users:userData});

    } catch (error) {
        console.log(error.message);
    }
}

// block user

const blockUser = async(req,res)=>{
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
    }
}

// unblock user

const unblockUser = async (req, res) => {
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
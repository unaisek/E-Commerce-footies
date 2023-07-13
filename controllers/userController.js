const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// load LandingPage
const loadHome = async(req,res)=>{
    try {
        const loggedIn = req.session.user_id;
        const producData = await Product.find({});
        res.render('index',{loggedIn,products:producData});
        
    } catch (error) {
        console.log(error.message);
    }
}

// load product-details

const productDetails = async (req, res) => {
    try {
        const loggedIn = req.session.user_id;
        const productData = await Product.findOne({_id:req.query.id});
        res.render('productDetails',{loggedIn,product:productData});
    } catch (error) {
        console.log(error.message);
    }
}
// load login page
const loadLogin = async(req,res)=>{
    try {
        const loggedIn = req.session.user_id
        if(req.session.user_id){
         res.redirect('/')   
        } else{
            res.render('login',{loggedIn});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const { email,password } = req.body;
        const userData = await User.findOne({email:email});     
        if(userData){
            if(userData.is_verified===1){
                const passwordMatch = await bcrypt.compare(password,userData.password)
                if(passwordMatch){
                    if(userData.is_blocked === false){
                        req.session.user_id = userData._id;
                        res.redirect('/');
                    } else {
                        res.render('login', { message: "This user has been blocked" });
                    }
                } else {
                    res.render('login',{message:"incorrect password..!!"});
                }
            } else {
                otp = '';
                tempMail = email;
                sendMail(userData.name,userData.email,userData._id);
                res.render('otpPage',{message:"Verify your email first"});
            }
        } else {
            res.render('login',{message:"incorrect email or password..!!"});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy((err)=>{
            if(err){
                console.log(err.message);
            } else {
                res.redirect('/');
            }
        });
    } catch (error) {
        console.log(error.message);
    }
}

// load register page
const loadRegister = async(req,res)=>{
    try {

        res.render('register');
        
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async(password)=>{
    try {
        
        const hashPassword = await bcrypt.hash(password,10);
        return hashPassword;

    } catch (error) {
        console.log(error.message);
    }
}

// OTP sharing

let otp = '';
let tempMail ;
const sendMail = async(name,email,user_id)=>{
    try {
        let digits = '0123456789';
        for(let i=0 ; i<4;i++){
            otp += digits[Math.floor(Math.random() * 10)]
        }
        const transporter = nodemailer.createTransport({
            host :'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.EMAIL,
                pass:process.env.PASS
            }
        });
        const options = {
            from: process.env.EMAIL,
            to:email,
            subject:'for email verification',
            html:`<p>hii ${name} ,please enter ${otp} for verification</p>`
        }
        transporter.sendMail(options,(error,info)=>{
            if(error){
                console.log(error);
            } else {
                console.log(otp);
                console.log("email has been send to:-",info.response);
            }

        });

    } catch (error) {
        console.log(error.message);
        
    }
}

// user signup

const registerUser = async (req, res) => {
    try {
        const  email = req.body.email;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            res.render('register',{message:"email already exists"})
        } else {
            const sPassword = await securePassword(req.body.password);
            const { name, mobile, email } = req.body;
            const user = new User({
                name,
                mobile,
                email,
                password: sPassword,
                is_admin:0
            });
            let userData = await user.save();
            tempMail = userData.email;

            if (userData) {
                if (userData.is_verified === 0){
                    otp = '';
                    sendMail(req.body.name,req.body.email,userData._id);
                    res.render('otpPage');
                } else {
                    res.render('register',{message:"registration sucessfull"})
                }
            } else {
                res.render('register',{message:"your registration failed"})
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

// confirm otp

const verifyMail = async(req,res)=>{

    try {
        let recivedotp = req.body.otp
        // console.log(recivedotp);
        if(recivedotp === otp){
            res.redirect('/login');
            const userData = await User.updateMany({email:tempMail},{$set:{is_verified:1 }});

        } else {
            res.render('otpPage',{message:"wrong otp"});
        }
    } catch (error) {
        console.log(error.message);
    }
}


// FORGET PASSWORD AND RESET CODE STARTED


// otp for reset password

let otpResetPass = '';
const sendResetPassMail = async (name, email, user_id) => {
    try {
        let digits = '0123456789';
        for (let i = 0; i < 4; i++) {
            otpResetPass += digits[Math.floor(Math.random() * 10)]
        }
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            }
        });
        const options = {
            from: process.env.EMAIL,
            to: email,
            subject: 'for reset password',
            html: `<p>hii ${name} ,please enter ${otpResetPass} for verification</p>`
        }
        transporter.sendMail(options, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(otpResetPass);
                console.log("email has been send to:-", info.response);
            }

        });

    } catch (error) {
        console.log(error.message);

    }
}

// load forget password page

const loadForgetPasswordPage = async(req,res)=>{
    try {
        const loggedIn = req.session.user_id
        if (req.session.user_id) {
            res.redirect('/')
        } else {
            res.render('forgetPassword', { loggedIn });
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// verify email in forget password page

const verifyForgetPassword = async(req,res)=>{
    try {

        const email = req.body.email;
        const userData = await User.findOne({email:email})
        if(userData){
            otpResetPass = '';
            sendResetPassMail(userData.name,email,userData._id);
            res.render('resetPassOtp',{user:userData});
        }else {
            res.render('forgetPassword', { message: "email does not exists", user: userData });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// load reset password page verify resetPass otp

const verifyResetPassOtp = async(req,res)=>{
    try {
        
        let recivedOtp = req.body.otp;
        const userData = await User.findOne({_id:req.query.id})
        if ( recivedOtp === otpResetPass ) {
            res.render('changePassword',{ user:userData});

        } else {
            res.render('resetPassOtp',{message:"Incorrect otp please check",user:userData});
        }

    } catch (error) {
        console.log(error.message);
    }
}

// verify New password

const verifyNewPassword = async(req,res)=>{
    try {
        
        const password = req.body.password1;
        const confirmPassword = req.body.password2;
        const userData = await User.findOne({ _id: req.query.id });

        if(password === confirmPassword){
            const securePass= await  securePassword(password);
            const updatedData = await User.findByIdAndUpdate({ _id: req.query.id }, { $set: { password: securePass }});
            if(updatedData){
                res.redirect('/login');
            } else {
                res.render('changePassword', { message: "changinging password is failed..!" , user: userData})
            }

        } else {
            res.render('changePassword', { message: "Passwords do not match", user: userData })
        }

    } catch (error) {
        console.log(error.message);
    }
}

// load shop page

const loadShopPage = async(req,res)=>{
    try {

        const page = Number(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        let price = req.query.value;
        let category = req.query.category || "All";
        let Search = req.query.search || "";
        Search = Search.trim();

        const categoryData = await Category.find({status:true},{categoryName:1,_id:0});
        let cat = [];
        for(i = 0; i < categoryData.length; i++){
            cat[i] = categoryData[i].categoryName
        }

        let sort ;
        category === "All" ? category = [...cat] : category = req.query.category.split(',');
        req.query.value === "High" ? sort = -1 : sort = 1;

        const producData = 
        await Product.aggregate([
            {$match : {productName : {$regex:'^'+Search, $options : 'i'},category : {$in : category},status : true}},
            {$sort : {price : sort}},
            {$skip : skip},
            {$limit : limit}
        ]);

        const productCount = await Product.countDocuments({
            productName: { $regex: Search, $options: 'i' },
            status: true,
            category: { $in: category }
        });
        
        const totalPage = Math.ceil(productCount / limit);
        const loggedIn = req.session.user_id;
        if(req.session.user_id){
            res.render('shop',{ loggedIn, product:producData, category:categoryData, page, Search, price, totalPage, cat:category});
        } else {
            res.render('shop', { loggedIn, product: producData, category: categoryData, page, Search, price, totalPage, cat: category });
        }
        
    } catch (error) {
        console.log(error.message);        
    }
}

module.exports = {
    loadHome,
    loadLogin,
    verifyLogin,
    userLogout,
    loadRegister,
    registerUser,
    verifyMail,
    productDetails,
    loadForgetPasswordPage,
    verifyForgetPassword,
    verifyResetPassOtp,
    verifyNewPassword,
    loadShopPage

    
}
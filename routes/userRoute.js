const express = require('express');
const userRoute = express();
const session = require('express-session');
const sessionSecret = require('../config/sessionSecret')
const userAuth = require('../middlewares/userAuth');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const wishlistController = require('../controllers/wishlistController');
const addressController = require('../controllers/addressController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');

userRoute.use(session({
    secret: sessionSecret.sessionSecret,
    resave: true,
    saveUninitialized: true
}))

userRoute.set('views', './views/user');

// load home
userRoute.get('/',userController.loadHome);

// user signup
userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',userController.registerUser);
userRoute.post('/verify',userController.verifyMail);

// user login
userRoute.get('/login',userAuth.isLogout,userController.loadLogin);
userRoute.post('/login',userController.verifyLogin);
userRoute.get('/logout', userController.userLogout);

// user forget password
userRoute.get('/forgetPassword',userController.loadForgetPasswordPage);
userRoute.post('/forgetPassword', userController.verifyForgetPassword);
userRoute.post('/verifyPassOtp',userController.verifyResetPassOtp);
userRoute.post('/changePassword',userController.verifyNewPassword);

// load contact
userRoute.get('/contact',userController.loadContact)

// Shop page
userRoute.get('/shop',userController.loadShopPage);
userRoute.get('/productDetails',userController.productDetails);

// Cart

userRoute.get('/cart', userAuth.isLogin,cartController.loadCart);
userRoute.post('/addToCart',cartController.addToCart);
userRoute.get('/removeFromCart', userAuth.isLogin,cartController.removeFromCart);
userRoute.post('/changeProductQuantity',userAuth.isLogin,cartController.changeQuantity);

// wishlist

userRoute.post('/addToWishlist', userAuth.isLogin,wishlistController.addToWishlist);
userRoute.get('/wishlist', userAuth.isLogin,wishlistController.loadWishlist);
userRoute.get('/removeFromWishlist', userAuth.isLogin,wishlistController.removeFromWishlist);
userRoute.get('/addFromWishlist', userAuth.isLogin,wishlistController.addProductFromWishlist);

// user Profile

userRoute.get('/myAccount',userController.loadProfile);

// address 

userRoute.get('/addAddress',userAuth.isLogin,addressController.loadAddAddress);
userRoute.post('/addAddress', userAuth.isLogin, addressController.addNewAddress);
userRoute.get('/editAddress', userAuth.isLogin, addressController.loadEditAddress);
userRoute.post('/editAddress', userAuth.isLogin, addressController.doEditAddress);
userRoute.get('/deleteAddress', userAuth.isLogin, addressController.deleteAddress);


// checkout
userRoute.get('/checkout',userAuth.isLogin,cartController.loadCheckout);
// orderplace
userRoute.post('/checkout', userAuth.isLogin, orderController.placeOrder);
userRoute.post('/verifyPayment', userAuth.isLogin, orderController.verifyPayment);
// apply Coupon 
userRoute.post('/applyCoupon', userAuth.isLogin, couponController.applyCoupon);
// order success
userRoute.get('/orderSuccess',userAuth.isLogin,orderController.loadOrderSuccess);

// orders
userRoute.get('/myOrders',userAuth.isLogin,orderController.loadMyOrders);
userRoute.get('/orderedProduct', userAuth.isLogin, orderController.viewOrderedProduct);
userRoute.post('/cancelOrder', userAuth.isLogin, orderController.cancelOrder);

// return Order
userRoute.get('/returnOrder', userAuth.isLogin, orderController.loadReturnPage);
userRoute.post('/returnOrder', userAuth.isLogin, orderController.returnOrder);



module.exports = userRoute;

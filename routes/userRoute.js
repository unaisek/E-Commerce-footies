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

userRoute.use(session({
    secret: sessionSecret.sessionSecret,
    resave: true,
    saveUninitialized: true
}))


userRoute.set('view engine', 'ejs');
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

// Shop page
userRoute.get('/shop',userController.loadShopPage);
userRoute.get('/productDetails',userController.productDetails);

// Cart

userRoute.get('/cart', userAuth.isLogin,cartController.loadCart);
userRoute.get('/addToCart', userAuth.isLogin,cartController.addToCart);
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

userRoute.get('/addAddress',addressController.loadAddAddress);
userRoute.post('/addAddress',addressController.addNewAddress)

// checkout
userRoute.get('/checkout',userAuth.isLogin,cartController.loadCheckout);
// orderplace
userRoute.post('/checkout',orderController.placeOrder);
userRoute.post('/verifyPayment',orderController.verifyPayment);

// orders
userRoute.get('/myOrders',userAuth.isLogin,orderController.loadMyOrders);
userRoute.get('/orderedProduct', userAuth.isLogin, orderController.viewOrderedProduct);
userRoute.post('/cancelOrder',orderController.cancelOrder);
userRoute.post('/returnOrder', orderController.returnOrder);



module.exports = userRoute;

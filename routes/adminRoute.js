const express = require('express');
const adminRoute = express();
const session = require('express-session');
const sessionSecret = require('../config/sessionSecret');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const adminAuth = require('../middlewares/adminAuth');
const multer = require('../config/multer')


adminRoute.use(session({
    secret:sessionSecret.sessionSecret,
    resave: true,
    saveUninitialized: true
}))


adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

adminRoute.get('/',adminAuth.isLogout, adminController.loadLogin);
adminRoute.post('/', adminController.verifyAdmin);
adminRoute.get('/logout', adminController.adminLogout);
adminRoute.get('/dashboard', adminAuth.isLogin, adminController.loadDashboard);


adminRoute.get('/users', adminAuth.isLogin, adminController.loadUsers);
adminRoute.get('/block', adminAuth.isLogin, adminController.blockUser);
adminRoute.get('/unblock', adminAuth.isLogin, adminController.unblockUser);

adminRoute.get('/category', adminAuth.isLogin, categoryController.loadCategory);
adminRoute.post('/category', categoryController.addCategory);
adminRoute.get('/unlistCategory', adminAuth.isLogin, categoryController.doUnlistCategory);
adminRoute.get('/listCategory', adminAuth.isLogin, categoryController.doListCategory);
adminRoute.get('/editCategory', adminAuth.isLogin, categoryController.loadEditCategory);
adminRoute.post('/editCategory', categoryController.updateCategory);


adminRoute.get('/productList', adminAuth.isLogin, productController.loadProductList);
adminRoute.get('/addProduct', adminAuth.isLogin, productController.loadAddProduct);
adminRoute.post('/addProduct', multer.upload.array('images',10),productController.addProduct);
adminRoute.get('/unlistProduct', adminAuth.isLogin, productController.doUnlistProducrt);
adminRoute.get('/listProduct', adminAuth.isLogin, productController.doListProducrt);
adminRoute.get('/editProduct', adminAuth.isLogin, productController.loadEditProduct);
adminRoute.post('/editProduct', multer.upload.array('images', 10), productController.updateProduct);
adminRoute.get('/deleteImage',productController.deleteImage);

// order details

adminRoute.get('/orderList',adminAuth.isLogin,orderController.adminOrderLists);
adminRoute.get('/shipping', adminAuth.isLogin, orderController.shippedOrder);
adminRoute.get('/delivered', adminAuth.isLogin, orderController.deliveredOrder);
adminRoute.get('/orderDetails',adminAuth.isLogin,orderController.showOrderDetails);
// return Order Approval
adminRoute.get('/returnConfirm', adminAuth.isLogin, orderController.returnConfirmPage);
adminRoute.get('/returnApproved',adminAuth.isLogin,orderController.returnApproved);
adminRoute.get('/returnRejected', adminAuth.isLogin, orderController.returnRejected);

// coupon 
adminRoute.get('/coupon', adminAuth.isLogin, couponController.showCouponList);
adminRoute.get('/addCoupon', adminAuth.isLogin, couponController.loadAddCoupon);
adminRoute.post('/addCoupon',couponController.addNewCoupon);
adminRoute.get('/editCoupon', adminAuth.isLogin, couponController.loadEditCoupon);
adminRoute.post('/editCoupon',couponController.updateCoupon)


module.exports = adminRoute;

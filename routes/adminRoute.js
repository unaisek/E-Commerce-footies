const express = require('express');
const adminRoute = express();
const session = require('express-session');
const sessionSecret = require('../config/sessionSecret');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
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
adminRoute.get('/deleteImage',productController.deleteImage)


module.exports = adminRoute;
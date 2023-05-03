var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../helpers/categoryHelpers');
var router = express.Router();
const { USER_COLLECTION } = require('../config/collection');
const collection=require('../config/collection');
var productHelpers = require('../helpers/productHelpers');
const userHelpers = require('../helpers/userHelpers');
const middleware=require('../middleware/middleware');
const adminBannerController=require('../controller/admincontroller/bannermanage');
const adminController=require('../controller/admincontroller/adminhandle');
const adminProdController=require('../controller/admincontroller/productmanage');
const adminUserController=require('../controller/admincontroller/usermanage');
const adminCategoryController=require('../controller/admincontroller/categorymanage');
const adminOrderController=require('../controller/admincontroller/ordermanage');
const adminSalesController=require('../controller/admincontroller/salesmanage');
const objectId = require('mongodb').ObjectId
const imgUpload = require('../multer/multer');
const Swal = require('sweetalert');


/* GET users listing. */

// admin handle
router.get('/',middleware.adminAuth,adminController.getAdminDashboard);
router.get('/login',adminController.getAdminLogin);
router.post('/login',adminController.postAdminLogin);
router.get('/logout',middleware.adminAuth,adminController.getAdminLogout );

// product management
router.get('/products',middleware.adminAuth,adminProdController.getProduct);
router.get('/addProduct', middleware.adminAuth, adminProdController.getAddProduct);
router.post('/addProduct',imgUpload.uploads, adminProdController.postAddProduct);
router.get('/deleteProduct/:id',middleware.adminAuth,adminProdController.getDeleteProduct);
router.get('/editProduct/:id',middleware.adminAuth,adminProdController.getEditProduct);
router.post('/editProduct/:id',imgUpload.editeduploads, adminProdController.postEditProduct);

// user management
router.get('/user',middleware.adminAuth,adminUserController.getUser);
router.get('/activateUser/:id',middleware.adminAuth,adminUserController.getActivateUser);
router.post('/activateUser/:id', adminUserController.postActivateUser);
router.get('/disableUser/:id',middleware.adminAuth,adminUserController.getDisableUser);
router.post('/disableUser/:id',adminUserController.postDisableUser);

// category management
router.get('/category',middleware.adminAuth, adminCategoryController.getCategory);
router.post('/category', adminCategoryController.postCategory);
router.post('/addCategory',adminCategoryController.postAddCategory);
router.get('/editCategory/:id',middleware.adminAuth,adminCategoryController.getEditCategory);
router.post('/editCategory/:id', middleware.adminAuth,adminCategoryController.postEditCategory);
router.get('/deleteCategory/:id',middleware.adminAuth,adminCategoryController.getDeleteCategory);

// order management
router.get('/orders',middleware.adminAuth,adminOrderController.getOrder);
router.get('/view-order-products/:id',middleware.adminAuth,adminOrderController.getOrderDetails);
router.post('/order-status/:id',middleware.adminAuth,adminOrderController.postEditStatus);

// sales management
router.get('/sales',middleware.adminAuth,adminSalesController.getSales);
router.post('/sales',middleware.adminAuth,adminSalesController.getSalesFilter);

// coupon management
router.get('/addCoupon', middleware.adminAuth, adminSalesController.getAddCoupon);
router.post('/addCoupon', middleware.adminAuth, adminSalesController.postAddCoupon);
router.get('/coupons',middleware.adminAuth,adminSalesController.getCoupon);
router.get('/deleteCoupons/:id',middleware.adminAuth,adminSalesController.getDeleteCoupon);
router.get('/editCoupons/:id',middleware.adminAuth,adminSalesController.getEditCoupon);
router.post('/editCoupons/:id',middleware.adminAuth, adminSalesController.postEditCoupon);

// banner management
router.get('/banners',middleware.adminAuth,adminBannerController.getBanner);
router.get('/addBanner', middleware.adminAuth, adminBannerController.getAddBanner);
router.post('/addBanner',imgUpload.bannerAdd, adminBannerController.postAddBanner);
router.get('/deleteBanner/:id',middleware.adminAuth,adminBannerController.getDeleteBanner);
router.get('/editBanner/:id',middleware.adminAuth,adminBannerController.getEditBanner);
router.post('/editBanner/:id',imgUpload.bannerEdit, adminBannerController.postEditBanner);








module.exports = router;

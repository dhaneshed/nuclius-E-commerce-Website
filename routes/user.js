
const { json } = require('express');
var express = require('express');
const { MongoErrorLabel } = require('mongodb');
const { USER_COLLECTION } = require('../config/collection');
var router = express.Router();
const productHelpers= require('../helpers/productHelpers');
const userHelpers=require('../helpers/userHelpers');
const middleware=require('../middleware/middleware');
const controller=require('../controller/usercontroller/userhandle');
const productController=require('../controller/usercontroller/productmanage');
const cartController=require('../controller/usercontroller/cartmanage');
const wishListController=require('../controller/usercontroller/wishlistmanage');
const orderController=require('../controller/usercontroller/ordermanage');
const collection = require('../config/collection');
const Swal = require('sweetalert');




/* GET home page. */


// user handle
router.get('/',controller.getDashboard);
router.get('/login',controller.getLogin);
router.post('/login',controller.postLogin);
router.get('/loginOtp',controller.getOtpLogin);
router.post('/loginOtp',controller.postOtpLogin);
router.get('/signup',controller.getSignup);
router.post('/signup',controller.postSignup);
router.get('/profile',middleware.userAuth,controller.getProfile);
router.post('/profile',controller.postAddress);
router.get('/logout',controller.getLogout);
//router.get('/deleteAddress/:id',middleware.userAuth,controller.getDeleteAddress);
router.get('/editAddress/:id',middleware.userAuth,controller.getEditAddress);
//router.post('/editAddress/:id',middleware.userAuth,controller.postEditAddress);
router.delete('/delete_address/:id', middleware.userAuth, controller.deleteAddress);
router.put('/profile/:id', middleware.userAuth, controller.putEditAddress)


// product management
router.get('/product',productController.getProduct);
router.get('/product/:id',middleware.userAuth,productController.getCatProdFilter);
router.get('/productDetails/:id',middleware.userAuth,productController.getProductDetails);



//  cart management
router.get('/cart',middleware.userAuth,cartController.getCart);
router.get('/addToCart/:id', cartController.getAddToCart);
router.post('/change-product-quantity',cartController.postChangeProductQuantity);
router.post('/remove-cart-product',cartController.postRemoveCartProduct);
  
// order management
router.get('/place-order',middleware.userAuth,orderController.getPlaceOrder);
router.post('/place-order',orderController.postPlaceOrder);
router.get('/order-success',middleware.userAuth,orderController.getOrderSuccess);
router.get('/orders',middleware.userAuth,orderController.getOrders);
router.get('/view-order-products/:id',middleware.userAuth,orderController.getOrderDetails);
router.get('/order-cancel/:id',middleware.userAuth,orderController.getOrderCancel);
router.post('/verify-payment',middleware.userAuth,orderController.postVerifyPayment);
router.get('/order-return/:id',middleware.userAuth,orderController.getOrderReturn);

//coupon management
router.post('/apply-coupon',middleware.userAuth,orderController.applyCoupon);

//wish List management
router.get('/wishList',middleware.userAuth,wishListController.getWishList);
router.get('/addToWishList/:id', wishListController.getAddToWishList);
router.post('/remove-wishlist-product',wishListController.postRemoveWishListProduct);



module.exports = router;

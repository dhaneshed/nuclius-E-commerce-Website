const { json } = require('express');
var express = require('express');
const { MongoErrorLabel } = require('mongodb');
const productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware = require('../../middleware/middleware');
const multer = require('multer');
const { log } = require('handlebars');


module.exports={
  getWishList: async (req, res) => {
    const productId=req.params.id;
    let products = await userHelpers.getWishListProducts(req.session.user._id);
    let quantity = await productHelpers.getInventory(productId);
    let stock=true;
    let isWishListEmpty=true;

    if(quantity===0)
    {
      stock=false;
    }
    if (products.length > 0) {
      isWishListEmpty=false;
    }

    let cartCount=null
    let wishListCount = null

    if (req.session.user) {
      cartCount=await userHelpers.getCartCount(req.session.user._id);
      wishListCount = await userHelpers.getWishListCount(req.session.user._id);

    }

    res.render('user/wishlist', { products, user: req.session.user,cartCount, wishListCount,isWishListEmpty,stock})
  },
  getAddToWishList:(req, res) => {
    const productId = req.params.id;


    const userId = req.session.user._id;
    userHelpers.addToWishList(productId, userId)
      .then(() => {
        res.json({ status: true });
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
        res.json({ status: false, message: 'Failed to add item to cart' });
      });


  },
  postRemoveWishListProduct: (req, res, next) => {
    userHelpers.removeWishListProduct(req.body)
      .then((response) => {
        res.json(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  }
}
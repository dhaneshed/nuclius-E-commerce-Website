const { json } = require('express');
var express = require('express');
const { MongoErrorLabel } = require('mongodb');
const productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware = require('../../middleware/middleware');
const multer = require('multer');
const { log } = require('handlebars');

module.exports = {
  getCart: async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let totalValue = 0
    let isCartEmpty = true;
    if (products.length > 0) {
      totalValue = await userHelpers.getTotalAmount(req.session.user._id)

      isCartEmpty = false;
    }

    let cartCount = null
    let wishListCount=null

    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      wishListCount=await userHelpers.getWishListCount(req.session.user._id);

    }

    res.render('user/cart', { products, user: req.session.user, cartCount, totalValue, isCartEmpty,wishListCount })
  },

 

  getAddToCart: (req, res) => {
    const productId = req.params.id;


    const userId = req.session.user._id;
    userHelpers.addToCart(productId, userId)
      .then((response) => {
        res.json(response);
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
        res.json({ status: false, message: 'Failed to add item to cart' });
      });


  },

  postChangeProductQuantity: (req, res, next) => {
    userHelpers.changeProductQuantity(req.body)
      .then(async (response) => {
        response.total = await userHelpers.getTotalAmount(req.body.user)

        res.json(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  postRemoveCartProduct: (req, res, next) => {
    userHelpers.removeCartProduct(req.body)
      .then((response) => {
        res.json(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  }



}
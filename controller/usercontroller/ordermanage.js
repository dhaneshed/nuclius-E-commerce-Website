const { json } = require('express');
var express = require('express');
const { MongoErrorLabel } = require('mongodb');
const productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware = require('../../middleware/middleware');
const multer = require('multer');
const { COUPON_COLLECTION } = require('../../config/collection');

module.exports = {
  getPlaceOrder: async (req, res) => {
    console.log('-----------');
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let total = 0;
    if (products.length > 0) {
      total = await userHelpers.getTotalAmount(req.session.user._id);
    }
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)

    }
    userHelpers.getAllAddresses(req.session.user._id)
      .then((addresses) => {
        res.render('user/place-order', { products, total, user: req.session.user, cartCount, addresses })

      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
  postPlaceOrder: async (req, res) => {
    
    let discount = req.session.discountPrice
    req.session.discountPrice = null




    let products = await userHelpers.getCartProductList(req.body.userId);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    let discountamt = parseInt(totalPrice) - parseInt(discount);





    userHelpers.placeOrder(req.body, products, totalPrice, discountamt)
      .then((orderId) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.body['payment-method'] === 'COD') {

          res.json({ codSuccess: true })
        }
        else if (req.body['payment-method'] === 'WALLET') {
          let userId = req.session.user._id;
          let orderId = req.params.id;
          console.log(orderId,"OrderId----");

          userHelpers.changePaymentStatus(orderId)
          userHelpers.removeCartItems(userId)
          userHelpers.updateWallet(totalPrice, userId)
          .then((response) => {

              res.json(response)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });

        } else {
          userHelpers.generateRazorpay(orderId, totalPrice)
            .then((response) => {
              console.log(response)
              res.json(response)
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        }


      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    console.log(req.body)
  },
  getOrderSuccess: async (req, res) => {
    res.render('user/order-success', { user: req.session.user })
  },
  getOrders: async (req, res) => {

    console.log(req.session.user._id);
    let orders = await userHelpers.getUserOrders(req.session.user._id);

    res.render('user/orders', { user: req.session.user, orders })
  },
  getOrderDetails: async (req, res) => {

    let order = await userHelpers.getOrderDetails(req.params.id)
    let products = await userHelpers.getOrderProducts(req.params.id)
    let address = await userHelpers.getShipAddress(req.params.id)

    res.render('user/orderDetails', { user: req.session.user, order, products, address })
  },
  getOrderCancel: async (req, res) => {
    let orderId = req.params.id;
    let order = await userHelpers.getOrderDetails(req.params.id);
    let refund = order.totalAmount;
    let userId = req.session.user._id;
    
    userHelpers.addToWallet(refund, userId)
    userHelpers.cancelOrder(orderId)
      .then((response) => {
        res.redirect('/orders')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

  },
  postVerifyPayment: (req, res) => {
    userHelpers.verifyPayment(req.body).then(() => {
      userHelpers.changePaymentStatus(req.body['order[receipt]'])
      let userId = req.session.user._id;
      userHelpers.removeCartItems(userId)
        .then(() => {
          res.json({ status: true })
        })

    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: '' })
    })
  },
  getOrderReturn: async (req, res) => {
    let orderId = req.params.id;
    let order = await userHelpers.getOrderDetails(req.params.id);
    let refund = order.totalAmount;
    let userId = req.session.user._id;
    userHelpers.addToWallet(refund, userId)
    userHelpers.returnOrder(orderId)
      .then((response) => {
        res.redirect('/orders')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

  },
  applyCoupon: async (req, res) => {

    const { couponCode, total } = req.body

    let discount = await userHelpers.getCouponDetails(couponCode);
    console.log("discount", discount);
    console.log("discount-amount", discount[0].discountAmount);
    if (couponCode == discount[0].couponName) {
      if (new Date(discount[0].expirationDate) > new Date()) {
        let count = parseInt(discount[0].discountAmount);
        const discountedPrice = (total - count).toFixed(2);
        req.session.discountPrice = discountedPrice

        res.json({ status: true, discountedPrice });
      } else {

        res.json({ status: false });
      }
    } else {

      res.json({ status: false });
    }
  }



}
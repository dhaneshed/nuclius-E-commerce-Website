var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../../helpers/categoryHelpers');
var productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;

module.exports={
  getOrder:async(req,res)=>{
    userHelpers.getAllOrders()
    .then((orders) => {
      adminIn = req.session.loggedIn
      res.render('admin/orders', {layout:'adminLayout', admin: true, adminIn:true, orders });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  getOrderDetails:async(req,res)=>{
     adminIn=req.session.loggedIn
    let order = await userHelpers.getOrderDetails(req.params.id)
    let products= await userHelpers.getOrderProducts(req.params.id)
    let address= await userHelpers.getShipAddress(req.params.id)
     
     res.render('admin/orderDetails',{layout:'adminLayout',admin:true, adminIn:true,order,products,address})
   },
   postEditStatus: (req, res) => {
    console.log(req.params.id);
    console.log(req.body.status);
    userHelpers.updateStatus(req.params.id,req.body)
    .then(() => {      
        res.redirect("/admin/orders");
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  }



}
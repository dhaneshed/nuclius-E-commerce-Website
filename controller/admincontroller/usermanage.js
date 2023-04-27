var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../../helpers/categoryHelpers');
var productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;

module.exports={
  getUser:function (req, res) {
    userHelpers.getAllUsers()
    .then(users => {
  
      adminIn = req.session.adminloggedIn
      res.render('admin/viewUser', {layout:'adminLayout', admin: true, adminIn:true, users });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  getActivateUser:async (req, res) => {
    adminIn = req.session.adminloggedIn
    let user = await userHelpers.getUserDetails(req.params.id)
    console.log(user);
    let data = req.params.id;
    userHelpers.activateUser(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/user');
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  postActivateUser:async (req, res) => {
    let user = await userHelpers.getUserDetails(req.params.id)
    console.log(req.params.id);
    let data = req.params.id;
    userHelpers.activateUser(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/user');
  
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },

  getDisableUser:async (req, res) => {
    adminIn = req.session.adminloggedIn
    let user = await userHelpers.getUserDetails(req.params.id)
    console.log(user);
    let data = req.params.id;
    userHelpers.disableUser(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/user');
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  postDisableUser: async (req, res) => {
    let user = await userHelpers.getUserDetails(req.params.id)
    console.log(req.params.id);
    let data = req.params.id;
    userHelpers.disableUser(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/user');
  
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  }
}
var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../../helpers/categoryHelpers');
var productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const bannerHelpers= require('../../helpers/bannerHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;

module.exports={
getAddBanner:function (req, res) {
    adminIn = req.session.loggedIn
    res.render('admin/addBanner', { layout:'adminLayout',admin: true, adminIn:true });
  
},

postAddBanner:(req, res) => {
  let image = req.file.filename;
  console.log(req.file,"Kamal");
  req.body.image=image;
  bannerHelpers.addBanner(req.body)
  .then(() => {
      res.redirect('/admin')

  })
  .catch(error => {
    console.error(`The operation failed with error: ${error.message}`);
  });
  },
  getBanner:function (req, res) {
   
    bannerHelpers.getAllBanners()
    .then((banners) => {
      adminIn = req.session.loggedIn
     
      res.render('admin/viewBanners', {layout:'adminLayout', admin: true, adminIn:true, banners});
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  
  },
  getDeleteBanner: (req, res) => {
    let bannerId = req.params.id;
    console.log(bannerId);
    bannerHelpers.deleteBanner(bannerId)
    .then((response) => {
      res.redirect('/admin/')
    })  
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });

  },
  getEditBanner:async (req, res) => {
    adminIn = req.session.loggedIn
    let banner = await bannerHelpers.getBannerDetails(req.params.id)
    .then((banner) => {
      
      res.render('admin/editBanner', {layout:'adminLayout', banner, admin: true, adminIn:true });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  postEditBanner: (req, res) => {
    let id=req.params.id
    let image = null;

    if(req.file && req.file.filename)
    {
     image=req.file.filename
    }
    else
    {
      image=req.body.image
    }
    

    bannerHelpers.updateBanner(id, req.body, image)
    .then(() => {
     
        res.redirect("/admin");
  
      
  
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  }

  
  
  
  }
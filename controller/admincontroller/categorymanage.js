var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../../helpers/categoryHelpers');
var productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;

module.exports={
  getCategory:function (req, res) {
    categoryHelpers.getAllCategories()
    .then((categories) => {
      adminIn = req.session.loggedIn
      res.render('admin/viewCategory', {layout:'adminLayout', admin: true, adminIn:true, categories });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  postCategory:(req, res) => {
    let name = req.body.CategoryName
    let id = req.body.catId
    categoryHelpers.updateCategory(id,name)
    .then((data) => {
  
    
      categoryHelpers.getAllCategories()
      .then((categories) => {
        adminIn = req.session.loggedIn
        // res.render('admin/viewCategory', { admin: true, adminIn, categories });
        res.redirect('/admin/category')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  postAddCategory:async(req, res) => {
    console.log("CATEAGory reqbody",req.body);
    let catexist= await categoryHelpers.isCategoryExist(req.body);
    console.log("CATEXIST",catexist);
    if(catexist)
    {
      console.log("CATEGORY EXIST condition");
      let preExist=true;
      categoryHelpers.getAllCategories()
      .then((categories) => {
        adminIn = req.session.loggedIn
        res.render('admin/viewCategory', {layout:'adminLayout', admin: true, adminIn:true, categories,preExist });
      })

    }else
    {
      console.log("CATEGORY ADD condition")
      preExist=false;
      categoryHelpers.addCategory(req.body)
      .then((data)=>{
       res.redirect('/admin/category')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

    }
   
  },
  getEditCategory:async (req, res) => {
    adminIn = req.session.loggedIn
    let category = await categoryHelpers.getCategoryDetails(req.params.id)
    console.log(category);
    res.render('admin/editCategory', {layout:'adminLayout', category, admin: true, adminIn });
  },
  postEditCategory:async (req, res) => {
    categoryHelpers.updateCategory(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/category');
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });

  },
  getDeleteCategory: (req, res) => {
    let catId = req.params.id;
    console.log(catId);
    categoryHelpers.deleteCategory(catId)
    .then((response) => {
      res.redirect('/admin/category')
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });

  },
  // getUniqueCategory: (req, res) => {
  //   let catId = req.params.id;
  //   console.log(catId);
  //   categoryHelpers.getUniqueCategory(catId).then((response) => {
  //     res.redirect('/admin/category')
  //   })

  // }

}
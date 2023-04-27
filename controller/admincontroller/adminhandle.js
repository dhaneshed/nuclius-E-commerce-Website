var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../../helpers/categoryHelpers');
var productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;




const adminCredential={
  name:'superAdmin',
  email:'admin@gmail.com',
  password:'admin123'
 }

module.exports={
  // get Admin Dash Board
  getAdminDashboard:async(req,res)=>{
    let dayWiseSales=await userHelpers.getDayWiseSales()
    console.log(dayWiseSales,'haiiiiiiiiii')
    let categoryQuantity=await userHelpers.getCategoryQty()
    let revenue=await userHelpers.getRevenue()
    let ordersCount=await userHelpers.getOrdersCount()
    let productCount=await userHelpers.getProductCount()
    let categoryCount=await userHelpers.getCategoryCount()
    let AverageValue=await userHelpers.getMonthlyIncome()
    AverageValue=AverageValue[0].AverageValue
    console.log("AVG",AverageValue);
    revenue=revenue[0].revenue
    console.log("REVENUEEEE",revenue);
       
  
    productHelpers.getAllProducts()
    .then((products) => {
      adminIn = req.session.adminloggedIn
      res.render('admin/adminDashboard', {layout:'adminLayout', login:true,admin: true, adminIn:true, products,dayWiseSales,categoryQuantity,revenue,ordersCount,productCount,categoryCount,AverageValue });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },

  // get Admin Login

  getAdminLogin: (req, res) => {
    if(req.session.adminloggedIn){
      res.redirect('/admin')
    }else{
      let isLoginPage=true;
      res.render('admin/loginAdmin', { layout:'adminLayout',admin: true, adminIn:false,isLoginPage })
    }  
  },


  postAdminLogin:function (req, res) {
    var email = req.body.Email;
    var password = req.body.Password;
  
    console.log(req.body);
  
    // validate the input and check if the credentials are correct
    if (email === adminCredential.email && password === adminCredential.password) {
      req.session.adminloggedIn = true;
      let adminloggedInErr=false;
      let adminIn = req.session.adminloggedIn
      console.log("check" + adminIn);
      res.redirect('/admin');
    } else {
      adminloggedInErr=true
      let isLoginPage=true;
      res.render('admin/loginAdmin', { layout:'adminLayout',admin: true, adminIn:false,isLoginPage, adminloggedInErr})
      
    }
  },
  //  get Admin Logout
  
  getAdminLogout:(req, res) => {
    req.session.adminloggedIn = null
    adminIn = false
    res.redirect('/admin/')
  }
    
  }

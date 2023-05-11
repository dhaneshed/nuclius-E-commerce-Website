
const { json } = require('express');
var express = require('express');
const { MongoErrorLabel } = require('mongodb');
const bannerHelpers=require('../../helpers/bannerHelpers');
const productHelpers= require('../../helpers/productHelpers');
const userHelpers=require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const multer = require('multer');

module.exports={
  getDashboard:async(req,res)=>{

    let user=req.session.user
    let cartCount=null
    let wishListCount=null
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
      wishListCount=await userHelpers.getWishListCount(req.session.user._id)
    }
    bannerHelpers.getAllBanners()
    .then((banners) => {
  
      res.render('user/homePage', { admin:false,user,cartCount,wishListCount,banners});
  
    })
    
  
  },
  getLogin:(req,res)=>{
    if(req.session.loggedIn)
    {
      res.redirect('/')
    }else{
      let isLoginPage=true
      res.render('user/login',{isLoginPage})
    
    }
    
  },
  postLogin: async(req,res)=>{
    userHelpers.doLogin(req.body)
    .then((response)=>{
     if(response.status){
       req.session.user=response.user
       req.session.loggedIn=true
       res.redirect('/')
     } else if(response.blocked){
         let userBlockErr= true;
         res.render('user/login', {userBlockErr});
     } else {
      let loginErr=true;
      res.render('user/login', {loginErr}); // pass login error to login page
     }
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
},
   getOtpLogin:(req,res)=>{
    let isLoginPage=true
  
    res.render('user/loginOtp',{isLoginPage});
  },
   postOtpLogin:async(req,res)=>{
    userHelpers.doLoginOtp(req.body.mobile)
    .then((response)=>{
     if(response.status){
       
       req.session.user=response.user
       req.session.user.loggedIn=true
       res.redirect('/');
      
     }else if(response.blocked){
         req.session.userBlockErr="This profile is blocked "
         res.redirect('/loginOtp')
       }
       else if(!response.status){
         req.session.loginErr="Invalid username or password"
         res.redirect('/loginOtp')
       }
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
   },
  getSignup:(req,res)=>{
    let isLoginPage=true
    res.render('user/signup',{isLoginPage})
  },
  postSignup:(req,res)=>{
    console.log(req.body);
     userHelpers.doSignup(req.body)
     .then((response)=>{
      console.log(response);
      req.session.user=response;
      req.session.user.loggedIn=true;
       res.redirect('/')
     })
     .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  getLogout:(req,res)=>{
    req.session.loggedIn=false
      req.session.user=null
     res.redirect('/')
  },
  getProfile:async(req,res)=>{
  
    let total=await userHelpers?.getTotalAmount(req.session.user._id);
    let orders=await userHelpers?.getUserOrders(req.session.user._id);
    let balance=await userHelpers?.getWalletBalance(req.session.user._id);
    let cartCount=null
    let wishListCount=null
    if(req.session.user){
      cartCount=await userHelpers?.getCartCount(req.session.user._id);
      wishListCount=await userHelpers?.getWishListCount(req.session.user_id);
    
    }
    userHelpers?.getAllAddresses(req.session.user._id)
    .then((addresses)=>{ 
      res.render('user/profile',{total,user:req.session.user,cartCount,addresses,orders,balance})
     
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });




  },
  postAddress:(req, res) => {
  
    userHelpers.addAddress(req.body)
    .then((data) => {
    
  
    res.redirect('/profile');
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
    },

    getDeleteAddress: (req, res) => {
      let addressId = req.params.id;
      userHelpers.deleteAddress(addressId)
      .then((response) => {
        res.redirect('/profile')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    },
  getEditAddress:async (req, res) => {
    user=req.session.user;
    let address = await userHelpers.getAddressDetails(req.params.id);
    let orders=await userHelpers.getUserOrders(req.session.user._id);
      
      res.render('user/editAddress', { address, admin: false, user,orders });
    
  },
  postEditAddress:(req, res) => {
    let id=req.params.id
    
    userHelpers.updateAddress(id, req.body)
    .then(() => {
      res.redirect("/profile");
  
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  putEditAddress:(req, res) => {
    let id=req.params.id
    
    userHelpers.updateAddress(id, req.body)
    .then(() => {
      res.redirect("/profile");
  
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  deleteAddress:(req, res) => {
    let addressId = req.params.id;
    userHelpers.deleteAddress(addressId)
    .then(() => {
      console.log('sucessssssssssssssssssssssssssss');
      res.json(true)
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },

}
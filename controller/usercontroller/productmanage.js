const { json } = require('express');
var express = require('express');
const { MongoErrorLabel } = require('mongodb');
const productHelpers= require('../../helpers/productHelpers');
const categoryHelpers=require('../../helpers/categoryHelpers');
const userHelpers=require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
var hbs=require('express-handlebars');
const multer=require('multer');
const fs=require('fs');

module.exports={
  getProduct:async(req, res,next)=>{
    let user=req.session.user
    let cartCount=null
    let wishListCount=null
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
      wishListCount=await userHelpers.getWishListCount(req.session.user._id)
    }
    var search='';
    if(req.query.search)
    {
      search= req.query.search;
    }
    var page=1;
    if(req.query.page)
    {
      page= req.query.page;
    }
   const limit = 2;
   let count=productHelpers.getProductsPageCount(search,page,limit);
   let totalPages= Math.ceil(count/limit);
    productHelpers.getAllProducts(search,page,limit)
    .then((products)=>{ 
      categoryHelpers.getAllCategories()
      .then((categories) => {
      
        
          res.render('user/viewProducts', { products,admin:false,user,cartCount,wishListCount,categories,totalPages,currentPage:page,search});
        

        
          
        
      
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
     
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
      
  },
  getProductDetails: async (req, res) => {
    let product = await productHelpers.getProductDetails(req.params.id)
    let cartCount=null
    if(req.session.user){
      cartCount=await userHelpers.getCartCount(req.session.user._id)
    }
    res.render('user/productDetails', {layout:'layout',user:req.session.user,cartCount, product, admin:false});
  },
  getCatProdFilter: async(req,res)=>{

    let products = await productHelpers.getProductFilter(req.params.id)
      let user=req.session.user
      let cartCount=null
      if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
      }
    
      
      
        categoryHelpers.getAllCategories()
        .then((categories) => {
            
        res.render('user/viewCategoryProducts', { products,admin:false,user,cartCount,categories});
          
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
       
      
    
  }


}
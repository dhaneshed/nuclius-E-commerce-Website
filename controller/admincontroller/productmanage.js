var express = require('express');
const { ObjectId } = require('mongodb');
const categoryHelpers = require('../../helpers/categoryHelpers');
var productHelpers = require('../../helpers/productHelpers');
const userHelpers = require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;

module.exports={

  // getProduct
  getProduct:function (req, res) {
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
    productHelpers.getAllProducts(search,page,limit)
    .then((products) => {

      categoryHelpers.getAllCategories()
    .then((categories) => {
      adminIn = req.session.loggedIn
      let totalPages= Math.ceil(count/limit);
     console.log("ToTalPaGeS",totalPages);
      res.render('admin/viewProducts', {layout:'adminLayout', admin: true, adminIn:true, products,totalPages,currentPage:page,categories });
     
    })
     
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  
  },
  getAddProduct:function (req, res) {
    categoryHelpers.getAllCategories()
    .then((categories) => {
      adminIn = req.session.loggedIn
      res.render('admin/addProduct', { layout:'adminLayout',admin: true, adminIn:true, categories });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  postAddProduct:(req, res) => {
    let images = req.files.map(files=>files.filename) ;
    req.body.images=images;
    req.body.Quantity=parseInt(req.body.Quantity);
    req.body.Price=parseInt(req.body.Price);
    console.log(req.body.images);
    productHelpers.addProduct(req.body)
    .then(() => {
        res.redirect('/admin')

    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
    },
    getDeleteProduct:(req, res) => {
      let proId = req.params.id;
      console.log(proId);
      productHelpers.deleteProduct(proId)
      .then((response) => {
        res.redirect('/admin/')
      })  
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });

    },
    getEditProduct:async (req, res) => {
      adminIn = req.session.loggedIn
      let product = await productHelpers.getProductDetails(req.params.id)
      console.log(product);
      categoryHelpers.getAllCategories()
      .then((categories) => {
        
        res.render('admin/editProduct', {layout:'adminLayout', product, admin: true, adminIn:true,categories });
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    },
    postEditProduct: (req, res) => {
      let id=req.params.id
      console.log("req.body",req.body);
      console.log("req.body",req.body.image1);
      let images = []
  
      if(req.files.image1)
      {
        images.push(req.files.image1[0].filename)
      }
      else
      {
        images.push(req.body.image1)
      }
      if(req.files.image2)
      {
        images.push(req.files.image2[0].filename)
      }
      else
      {
        images.push(req.body.image2)
      }
      if(req.files.image3)
      {
        images.push(req.files.image3[0].filename)
      }
      else
      {
        images.push(req.body.image3)
      }
      if(req.files.image4)
      {
        images.push(req.files.image4[0].filename)
      }
      else
      {
        images.push(req.body.image4)
      }

      productHelpers.updateProduct(id, req.body, images)
      .then(() => {
       
          res.redirect("/admin");
    
        
    
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    }


}
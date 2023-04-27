const userHelpers = require('../../helpers/userHelpers');
const middleware=require('../../middleware/middleware');
const objectId = require('mongodb').ObjectId;

module.exports={
  getSales:async(req,res)=>{
    userHelpers.getAllSales()
    .then((sales) => {
      adminIn = req.session.loggedIn
      res.render('admin/sales',{layout:'adminLayout', admin: true, adminIn:true, sales });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },

  getSalesFilter:async(req,res)=>{
    console.log("Date details",req.body);
    const date1 = new Date(req.body.startDate)
    const date2 = new Date(req.body.endDate)
   let sales= userHelpers.getAllSalesInDateRange(date1,date2)
    .then((sales) => {
      adminIn = req.session.loggedIn
      res.render('admin/sales',{layout:'adminLayout', admin: true, adminIn:true, sales });
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  },
  getAddCoupon:function (req, res) {
  
      adminIn = req.session.loggedIn
      res.render('admin/addCoupon', { layout:'adminLayout',admin: true, adminIn:true });
 
  },
  postAddCoupon:(req, res) => {
    let couponExist=userHelpers.getCouponDetails(req.body.couponName);
    let preExist=false;
    if(couponExist)
    {
       preExist=true;
      userHelpers.getAllCoupons()
      .then((coupons) => {
        adminIn = req.session.loggedIn
        res.render('admin/viewCoupons', {layout:'adminLayout', admin: true, adminIn:true, coupons,preExist });
      })

    }else{
     preExist=false;

      userHelpers.addCoupon(req.body)
      .then(() => {
  
          res.redirect('/admin')
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });



    }
    

    },
    getCoupon:function (req, res) {
      userHelpers.getAllCoupons()
      .then((coupons) => {
        adminIn = req.session.loggedIn
        res.render('admin/viewCoupons', {layout:'adminLayout', admin: true, adminIn:true, coupons });
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    
    },
    getDeleteCoupon: (req, res) => {
      let couponId = req.params.id;
      console.log(couponId);
      userHelpers.deleteCoupon(couponId)
      .then((response) => {
        res.redirect('/admin/')
      })  
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  
    },

    getEditCoupon:async (req, res) => {
      adminIn = req.session.loggedIn
      let coupon = await userHelpers.getEditCoupon(req.params.id)
      .then((coupon) => {
        
        res.render('admin/editCoupon', {layout:'adminLayout', coupon, admin: true, adminIn:true });
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    },
    postEditCoupon: (req, res) => {
      let id=req.params.id
     
  
      userHelpers.updateCoupon(id, req.body)
      .then(() => {
       
          res.redirect("/admin");
    
        
    
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    }
    

}
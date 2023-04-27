var db = require('../config/connection');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId;
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_KPz16bVWcyfzIh',
  key_secret: 'lf8nWWpGZD5MWCLqThwBt8Vn',
});

var moment = require('moment');
const { log } = require('console');
const async = require('hbs/lib/async');
const Swal = require('sweetalert');

module.exports={

  addBanner: (banner) => {
    return new Promise(async (resolve, reject) => {
  
     
      // Get the total count of banners in the banners collection
      const totalBanners = await db.get().collection(collection.BANNER_COLLECTION).countDocuments();
  
      // Add the count field to the product document
      banner.count = totalBanners + 1;
  
      // Insert the banner  document into the banners collection
      await db.get().collection(collection.BANNER_COLLECTION).insertOne(banner)
      .then((data) => {
        resolve(data.insertedId);
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    });
  },
  getAllBanners: ()=>{
    return new Promise(async(resolve,reject)=>{
      let banners=await db.get().collection(collection.BANNER_COLLECTION).find({}).toArray()
      resolve(banners)
    })
  },
  deleteBanner:(bannerId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerId)})
      .then((response)=>{
        console.log(response);
        resolve(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    }) 
},
getBannerDetails:(bannerId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerId)})
    .then((banner)=>{
      resolve(banner)
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  })
},
updateBanner:(bannerId,bannerDetails,image)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.BANNER_COLLECTION)
    .updateOne({_id:objectId(bannerId)},{
      $set:{
          subHeading:bannerDetails.subHeading,
          mainHeading:bannerDetails.mainHeading,
          content:bannerDetails.content,
          tagline_01:bannerDetails.tagline_01,
          tagline_02:bannerDetails.tagline_02,
           image:image

      }
    })
    .then((response)=>{
      console.log(response);
      resolve()
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error}`);
    });
  })
}

}
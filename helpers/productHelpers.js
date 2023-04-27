var db=require('../config/connection');
var collection=require('../config/collection'); 
// const { nObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectId
const Swal = require('sweetalert');


module.exports={


  addProduct: (product) => {
    return new Promise(async (resolve, reject) => {
      // Get the category document for the given category name
      const category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ name: product.category });
  
      // Add the category_id field to the product document
      if (category) {
        product.category_id = category._id;
      } else {
        reject(new Error(`Cannot find category ${product.category}`));
        return;
      }
  
      // Get the total count of products in the products collection
      const totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments();
  
      // Add the count field to the product document
      product.count = totalProducts + 1;
  
      // Insert the product document into the products collection
      await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
      .then((data) => {
        resolve(data.insertedId);
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    });
  },
  
  
  getAllProducts:(search,page,limit)=>{
    return new Promise(async(resolve,reject)=>{
      let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{Name:{$regex:'.*'+search+'.*',$options:'i'}},{Category:{$regex:'.*'+search+'.*',$options:'i'}},{Price:{$regex:'.*'+search+'.*',$options:'i'}},{Description :{$regex:'.*'+search+'.*',$options:'i'}}]}).sort({ Price: 1 }).limit(limit*1).skip((page-1)*limit).toArray()
      
      console.log("product is"+products)
      resolve(products)
    })
  },
    
  getProductsPageCount:(search,page,limit)=>{
    return new Promise(async(resolve,reject)=>{
      let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{Name:{$regex:'.*'+search+'.*',$options:'i'}},{Category:{$regex:'.*'+search+'.*',$options:'i'}},{Price:{$regex:'.*'+search+'.*',$options:'i'}},{Description :{$regex:'.*'+search+'.*',$options:'i'}}]}).sort({ Price: 1 }).limit(limit*1).skip((page-1)*limit).toArray()
      let count=await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({$or:[{Name:{$regex:'.*'+search+'.*',$options:'i'}},{Category:{$regex:'.*'+search+'.*',$options:'i'}},{Price:{$regex:'.*'+search+'.*',$options:'i'}},{Description :{$regex:'.*'+search+'.*',$options:'i'}}]})
      resolve(count)
    })
  },
  deleteProduct:(prodId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)})
      .then((response)=>{
        console.log(response);
        resolve(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    }) 
},
getProductDetails:(proId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
    .then((product)=>{
      resolve(product)
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  })
},
updateProduct:(proId,proDetails,images)=>{
  let Quantity=parseInt(proDetails.Quantity);
  let Price=parseInt(proDetails.Price);
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.PRODUCT_COLLECTION)
    .updateOne({_id:objectId(proId)},{
      $set:{
           Name:proDetails.Name,
           Description:proDetails.Description,
           Price:Price,
           Category:proDetails.Category,
           Quantity:Quantity,
           images:images

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
},

  getProductFilter:(catName)=>{
    return new Promise(async(resolve,reject)=>{
    let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:catName}).toArray()
    resolve(products)
    })
  },
  getInventory: (proId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION)
        .find({ _id: objectId(proId) }, { Quantity: 1 })
        .toArray()
        .then((inventory) => {
          if (inventory.length > 0) {
            const quantity = inventory[0].Quantity;
          
            resolve(quantity);
          } else {
      
            resolve(0);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  

  
  
}
var db=require('../config/connection');
var collection=require('../config/collection');

// const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectId
const Swal = require('sweetalert');

module.exports={
  addCategory:(category)=>{
    return new Promise(async(resolve,reject)=>{
      // Get the total count of banners in the banners collection
      const totalCategories = await db.get().collection(collection.CATEGORY_COLLECTION).countDocuments();
  
      // Add the count field to the product document
      category.count = totalCategories + 1;
  
  
       await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category)
       .then((data)=>{
       console.log(data);
        resolve(data.insertedId);
       })
       .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
      })
      
  // db.get().collection('product').insertOne(product).then((data)=>{
    
  
      
  //   callback(data.insertedId);


},


isCategoryExist: (category)=>{
  return new Promise(async(resolve,reject)=>{
    let catexist=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({CategoryName:category})
   
     .then((catexist)=>{
      resolve(catexist);
     })
     .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
    })


},





  getAllCategories:()=>{
    return new Promise(async(resolve,reject)=>{
      let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(categories)
    
    })
  },
  deleteCategory:(catId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)})
      .then((response)=>{
        console.log(response);
        resolve(response)
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
    }) 
},

getCategoryDetails:(catId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
    .then((category)=>{
      resolve(category)
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  })
},

// updateCategory:(id,name)=>{
//   console.log("pArA"+id);

//   console.log("nAmPaRa"+name);
//   return new Promise((resolve,reject)=>{
   
   
//     db.get().collection(collection.CATEGORY_COLLECTION)
//     .updateOne({_id:objectId(id)},{
//       $set:{
//            CategoryName:name
//       }
//     }).then((response)=>{
    
//       resolve();
//     });
//   });
// }
// updateCategory: (id, name) => {
//   console.log("pArA"+id);
//   console.log("nAmPaRa"+name);
//   return new Promise((resolve, reject) => {
//     db.get().collection(collection.CATEGORY_COLLECTION)
//       .updateOne({_id: objectId(id)}, {
//         $set: {
//           CategoryName: name
//         }
//       })
//       .then((response) => {
//         resolve();
//       });
//   });
// }



updateCategory:(id,name)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.CATEGORY_COLLECTION)
    .updateOne({_id:objectId(id)},{
      $set:{
           Category:name
      }
    })
    .then((response)=>{
      console.log("ReSp"+response);
      resolve()
    })
    .catch(error => {
      console.error(`The operation failed with error: ${error.message}`);
    });
  })
},
activateCategory: (catId, catDetails) => {
  return new Promise(async(resolve, reject) => {
    let catName=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
    db.get().collection(collection.CATEGORY_COLLECTION)
      .updateOne({ _id: objectId(catId) }, {
        $set: {

          isBlocked: false
        }
      })
      db.get().collection(collection.PRODUCT_COLLECTION).updateMany({Category:catName.CategoryName},{

        $set:{
           isBlocked:false
        }
            })
      .then((response) => {
        resolve()
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  })
},
disableCategory: (catId, catDetails) => {
  return new Promise(async(resolve, reject) => {
    let catName=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
    db.get().collection(collection.CATEGORY_COLLECTION)
      .updateOne({ _id: objectId(catId) }, {
        $set: {
          isBlocked: true
        }
      })
      db.get().collection(collection.PRODUCT_COLLECTION).updateMany({Category:catName.CategoryName},{

        $set:{
           isBlocked:true
        }
            })
      .then((response) => {
        resolve()
      })
      .catch(error => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  })
}


}
  

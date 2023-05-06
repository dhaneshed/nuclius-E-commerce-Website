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






module.exports = {
  doSignup: (userData) => {
    console.log(userData);
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10)
      // Get the total count of  users in the users collection
      const totalUsers = await db.get().collection(collection.USER_COLLECTION).countDocuments();

      // Add the count field to the user document
      userData.count = totalUsers + 1;
      db.get().collection(collection.USER_COLLECTION).insertOne(userData)
        .then((data) => {

          resolve(data)

        }).catch((err) => {
          console.log(err);
        })

    })
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      let loginStatus = false
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
      if (user) {
        if (user.isBlocked) {
          console.log("User blocked");
          response.blocked = true;
          resolve(response)
        } else {
          bcrypt.compare(userData.Password, user.Password)
            .then((status) => {
              if (status) {
                console.log("login success");
                response.user = user
                response.status = true
                resolve(response)
              } else {
                console.log("login failed");
                resolve({ status: false })
              }
            })
            .catch(error => {
              console.error(`The operation failed with error: ${error.message}`);
            });
        }

      } else {
        console.log("login failed");
        resolve({ status: false })

      }
    })
  },


  doLoginOtp: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      let loginStatus = false
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Phonenumber: userData })
      if (user) {
        if (!user.isBlocked) {
          response.user = user;
          response.status = true;
          resolve(response)
        } else {
          response.blocked = true;
          response.status = false;
          resolve(response)
        }
      }
    })
  },





  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
      resolve(users)
    })
  },

  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(userId) })
        .then((response) => {
          console.log(response);
          resolve(response)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },



  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
        .then((user) => {
          resolve(user)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },


  activateUser: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, {
          $set: {

            isBlocked: false
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
  disableUser: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTION)
        .updateOne({ _id: objectId(userId) }, {
          $set: {
            isBlocked: true
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

  blockedUserCheck: (userId) => {

    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
        console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,", response.isBlocked);
        resolve(response)
      })
    })

  },


  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proId)
        if (proExist != -1 && product && product.Quantity > 0) {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
              {
                $inc: { 'products.$.quantity': 1 }
              }
            ).then(() => {
              resolve({ outOfStock: false })
            })

          // update the product quantity in the inventory
          db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({ _id: objectId(proId) },
              {
                $inc: { Quantity: -1 }
              }
            ).then(() => {
              resolve()
            })



        }
        else if (product && product.Quantity < 1) {
          resolve({ outOfStock: true })

        } else {
          db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId) },
              {

                $push: { products: proObj }

              }
            ).then((response) => {
              resolve()
            })


          //  update the product Quantity in the inventory
          db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({ _id: objectId(proId) },
              {
                $inc: { Quantity: -1 }
              }
            ).then(() => {
              resolve()
            })
        }
      } else if (product && product.Quantity < 1) {
        // check the availability of the product in the inventory
        resolve({ outOfStock: true })

      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          console.log(response);
          resolve()
        })

        // update the product Quantity in the inventory
        db.get().collection(collection.PRODUCT_COLLECTION)
          .updateOne({ _id: objectId(proId) },
            {
              $inc: { Quantity: -1 }
            }
          ).then(() => {
            resolve()
          })
      }

    })
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {

      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }

          }
        }
      ]).toArray()
      resolve(cartItems)
      console.log("cartItems", cartItems);
    })
  },





  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      console.log(cart);
      if (cart) {
        count = cart.products.length

      }
      resolve(count)

    })
  },

  changeProductQuantity: (details) => {
    return new Promise((resolve, reject) => {
      details.count = parseInt(details.count);
      details.quantity = parseInt(details.quantity);
      details.inventory = parseInt(details.inventory);

      if (details.inventory <= details.quantity) {
        resolve({ outOfStock: true })
      }
      if (details.count === -1 && details.quantity === 1) {
        // remove product from cart
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } }
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          })
          .catch((error) => {
            console.error(`The operation failed with error: ${error.message}`);
            reject(error);
          });
        // update the product Quantity in the inventory
        db.get().collection(collection.PRODUCT_COLLECTION)
          .updateOne({ _id: objectId(details.product) },
            {
              $inc: { Quantity: 1 }
            }
          ).then(() => {
            resolve()
          });


      } else {
        // check product availability in inventory
        db.get().collection(collection.PRODUCT_COLLECTION)
          .aggregate([
            { $match: { _id: objectId(details.product) } },
            { $set: { QuantityNumeric: { $toInt: "$Quantity" } } }
          ])
          .toArray()
          .then((productArray) => {
            let product = productArray[0];
            if (!product || product.QuantityNumeric <= details.quantity) {
              resolve({ outOfStock: true });
            } else {
              // update product quantity in cart
              db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                  {
                    $inc: { 'products.$.quantity': details.count }
                  }
                )
                .then((response) => {
                  // update product quantity in inventory
                  db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne({ _id: objectId(details.product) },
                      {
                        $set: { QuantityNumeric: product.QuantityNumeric - details.quantity }
                      }
                    )
                    .then(() => {
                      resolve({ status: true });
                    })
                    .catch((error) => {
                      console.error(`The operation failed with error: ${error.message}`);
                      reject(error);
                    });
                })
                .catch((error) => {
                  console.error(`The operation failed with error: ${error.message}`);
                  reject(error);
                });
            }
          })
          .catch((error) => {
            console.error(`The operation failed with error: ${error.message}`);
            reject(error);
          });

      }
    });

  },





  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {

      db.get().collection(collection.CART_COLLECTION)
        .updateOne({ _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } }
          }
        )
        .then((response) => {
          resolve({ removeProduct: true })
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);

        });

      // update the product Quantity in the inventory
      db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: objectId(details.product) },
          {
            $inc: { Quantity: 1 }
          }
        ).then(() => {
          resolve()
        })

    })




  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {

      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }

          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: [
                  { $toDouble: "$quantity" },
                  { $toDouble: "$product.Price" }
                ]
              }
            }

            // total:{$sum:{$multiply:['$quantity','$product.Price']}}
            // total: {$sum: {$multiply:[{$arrayElemAt:["$Array.quantity",0]},"$product.Price"]}} 

          }
        }

      ]).toArray()
      if (total[0]) {
        resolve(total[0].total);
      }
      else {
        resolve(0)
      }

    })

  },


  placeOrder: (order, products, total, discountamt) => {
    let discount = 0
    if (discountamt > 0) {
      discount = discountamt
    }




    return new Promise((resolve, reject) => {
      total = parseInt(total) - parseInt(discount)
      let status = 'pending';
      if (order['payment-method'] === 'COD' || order['payment-method'] === 'WALLET') {
        status = 'placed';
      }

      const date = new Date();
      let orderObj = {
        user: objectId(order.userId),
        address: objectId(order.address),
        Name: order.Name,
        phone: order.phone,
        email: order.Email,
        paymentMethod: order['payment-method'],
        products: products.products,
        totalAmount: total,
        status: status,
        date: date
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)

        .then((response) => {

          if (status === 'placed') {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) });
          }


          resolve(response.insertedId)

        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },
  getCartProductList: async (userId) => {
    console.log(userId)
    let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
    console.log("CARRRRT", cart);
    return cart

  },

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let orders = await db.get().collection(collection.ORDER_COLLECTION)
        .find({ user: objectId(userId) }).sort({ date: -1 }).toArray()
      console.log(orders);
      resolve(orders)
    })
  },

  addAddress: (address) => {
    return new Promise(async (resolve, reject) => {

      let addressObj = {
        user: objectId(address.userId),
        name: address.name,
        phone: address.phone,
        billing_address: address.billing_address,
        billing_address2: address.billing_address2,
        city: address.city,
        state: address.state,
        pincode: address.zipcode
      }





      await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj)
        .then((data) => {
          resolve(data.insertedId);
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    });
  },
  getAllAddresses: (userId) => {
    return new Promise(async (resolve, reject) => {
      let addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: objectId(userId) }).toArray()
      resolve(addresses);
    })
  },
  deleteAddress: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: objectId(addressId) })
        .then((response) => {
          console.log(response);
          resolve(response)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },
  getAddressDetails: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(addressId) })
        .then((address) => {
          resolve(address)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },
  updateAddress: (addressId, addressDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ADDRESS_COLLECTION)
        .updateOne({ _id: objectId(addressId) }, {
          $set: {
            billing_address: addressDetails.billing_address,
            billing_address2: addressDetails.billing_address2,
            city: addressDetails.city,
            state: addressDetails.state,
            zipcode: addressDetails.zipcode
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

  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
        .then((order) => {
          resolve(order)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {

      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: objectId(orderId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }

          }
        }
      ]).toArray()
      resolve(orderItems)
    })
  },
  getShipAddress: (orderId) => {

    return new Promise(async (resolve, reject) => {

      let addressList = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: ObjectId(orderId) }
        },
        {
          $lookup: {
            from: collection.ADDRESS_COLLECTION,
            localField: 'address',
            foreignField: '_id',
            as: 'address'
          }
        },
        {
          $project: {
            address: { $arrayElemAt: ['$address', 0] }

          }
        }
      ]).toArray()
      console.log(addressList);
      resolve(addressList);
    })
  },

  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: 'Cancel'
            }
          }
        ).then(() => {
          resolve()
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({ date: -1 }).toArray()
      resolve(orders)
    })
  },
  updateStatus: (orderId, orderDetails) => {
    console.log(orderId);
    console.log(orderDetails.status)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) }, {
          $set: {

            status: orderDetails.status

          }
        })
        .then((response) => {
          console.log(response);
          resolve()
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error}`);
        });
    })
  },
  generateRazorpay: (orderId, total) => {
    console.log('generate razorpay');
    console.log("orderid", orderId);
    return new Promise((resolve, reject) => {


      var options = {
        amount: total * 100, //amount in the smallest currency unit
        currency: "INR",
        receipt: orderId + ""
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("New Order:", order);
          resolve(order)
        }

      });

    })
  },
  verifyPayment: (details) => {
    try {
      return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'lf8nWWpGZD5MWCLqThwBt8Vn');
        console.log(hmac);
        hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
        hmac = hmac.digest('hex')
        if (hmac == details['payment[razorpay_signature]']) {
          resolve()
        } else {
          reject()
        }

      })

    } catch (error) {
      console.log(error)
    }

  },
  changePaymentStatus: (orderId) => {
    console.log(orderId)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: 'placed'
            }
          }
        ).then(() => {
          resolve()
        })



    })
  },
  returnOrder: (orderId) => {
    console.log(orderId)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: 'Return'
            }
          }
        ).then(() => {
          resolve()
        })
    })
  },
  getAllSales: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER_COLLECTION).find({ status: 'Delivered' }).sort({ date: -1 }).toArray()
      resolve(sales)
    })
  },
  getAllSalesInDateRange: (date1, date2) => {
    // let beginning = new Date(details.startDate);
    // let beg_utc = beginning.toISOString().replace("Z","+00:00");
    // let ending = new Date(details.endDate);
    // let end_utc = ending.toISOString().replace("Z","+00:00");
    // console.log('beg',beg_utc);
    return new Promise(async (resolve, reject) => {
      try {
        const sales = await db.get().collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: 'Delivered',
                date: {
                  $gte: new Date(date1),
                  $lte: new Date(date2)
                },
              },
            }
          ]).toArray()
        // .find({
        //   status: 'Delivered',
        //   date: {
        //     $gte: new Date(date1),
        //     $lte: new Date(date2)
        //   },
        // }).toArray();
        console.log("Sales---", sales);
        // console.log("beginning", beg_utc);
        // console.log("ending", end_utc);
        resolve(sales);
      } catch (error) {
        console.log("Error fetching sales: ", error);
        reject(error);
      }
    });
  },
  addCoupon: (coupon) => {
    return new Promise(async (resolve, reject) => {
      // Insert the coupon document into the coupons collection
      await db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon)
        .then((data) => {
          resolve(data.insertedId);
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    });
  },
  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let coupons = await db.get().collection(collection.COUPON_COLLECTION).find({}).toArray()
      resolve(coupons);
    })
  },
  getCouponDetails: (couponCode) => {
    return new Promise(async (resolve, reject) => {
      let discount = await db.get().collection(collection.COUPON_COLLECTION).find({ couponName: couponCode }).toArray()
      resolve(discount);

    })

  },
  getDayWiseSales: () => {
    return new Promise(async (resolve, reject) => {

      let dayWiseSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:
          {
            status: "Delivered",
          },
        },
        {
          $group: {
            _id: {
              day: {
                $dayOfWeek: "$date",
              },
            },
            total: {
              $sum: "$totalAmount",
            },
          },
        },
        {
          $project: {
            daywise: "$_id.day",
            _id: 0,
            total: 1,
          },
        },
        {
          $sort: {
            daywise: 1,
          },
        },
        {
          $project: {
            days: {
              $arrayElemAt: [
                [
                  "",
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ],
                "$daywise",
              ],
            },
            total: 1,
          },
        },
      ]).toArray()

      resolve(dayWiseSales)


    })
  },
  getCategoryQty: () => {
    return new Promise(async (resolve, reject) => {
      let categoryQuantity = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:

          {
            status: "Delivered",
          },
        },
        {
          $unwind:

          {
            path: "$products",
          },
        },
        {
          $lookup:

          {
            from: "product",
            localField: "products.item",
            foreignField: "_id",
            as: "Data",
          },
        },
        {
          $project:

          {
            Category: "$Data.Category",
            Quantity: "$Data.Quantity",
          },
        },
        {
          $group:

          {
            _id: "$Category",
            Quantity: {
              $sum: 1,
            },
          },
        },
        {
          $unwind:

          {
            path: "$_id",
          },
        },
      ]).toArray()
      resolve(categoryQuantity)
    })
  },
  getRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:

          {
            status: "Delivered",
          },
        },
        {
          $project:

          {
            _id: 0,
            totalAmount: 1,
          },
        },
        {
          $group:

          {
            _id: "",
            revenue: {
              $sum: "$totalAmount",
            },
          },
        },
        {
          $project:

          {
            _id: 0,
            revenue: 1,
          },
        },
      ]).toArray()
      resolve(revenue)
    })
  },
  getOrdersCount: () => {
    return new Promise(async (resolve, reject) => {
      let ordersCount = db.get().collection(collection.ORDER_COLLECTION).countDocuments({ status: "Delivered" })
      resolve(ordersCount)
    })
  },
  getProductCount: () => {
    return new Promise(async (resolve, reject) => {
      let productCount = db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({})
      resolve(productCount)
    })
  },
  getCategoryCount: () => {
    return new Promise(async (resolve, reject) => {
      let categoryCount = db.get().collection(collection.CATEGORY_COLLECTION).countDocuments({})
      resolve(categoryCount)
    })
  },
  getMonthlyIncome: () => {
    return new Promise(async (resolve, reject) => {
      let monthlyIncome = db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match:

          {
            status: "Delivered",
          },
        },
        {
          $group:

          {
            _id: {
              month: {
                $month: "$date",
              },
            },
            total: {
              $sum: "$totalAmount",
            },
          },
        },
        {
          $group:

          {
            _id: "_id",
            AverageValue: {
              $avg: "$total",
            },
          },
        },
        {
          $project:

          {
            _id: 0,
            AverageValue: 1,
          },
        },
      ]).toArray()
      resolve(monthlyIncome)
    })
  },
  // WishList
  getWishListProducts: (userId) => {
    return new Promise(async (resolve, reject) => {

      let wishListItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            item: 1, product: { $arrayElemAt: ['$product', 0] }

          }
        }
      ]).toArray()
      resolve(wishListItems)
      console.log("cartItems", wishListItems);
    })
  },
  getWishListCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      let wishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
      console.log(wishList);
      if (wishList) {
        count = wishList.products.length

      }
      resolve(count)

    })
  },
  addToWishList: (proId, userId) => {
    let proObj = {
      item: objectId(proId)
    }
    return new Promise(async (resolve, reject) => {
      let userWishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
      if (userWishList) {
        let proExist = userWishList.products.findIndex(product => product.item == proId)
        if (proExist != -1) {

        }
        else {
          db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({ user: objectId(userId) },
              {

                $push: { products: proObj }

              }
            ).then((response) => {
              resolve()
            })
        }
      } else {
        let wishListObj = {
          user: objectId(userId),
          products: [proObj]
        }
        db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishListObj).then((response) => {
          console.log(response);
          resolve()
        })
      }

    })
  },
  removeWishListProduct: (details) => {
    return new Promise((resolve, reject) => {

      db.get().collection(collection.WISHLIST_COLLECTION)
        .updateOne({ _id: objectId(details.wishlist) },
          {
            $pull: { products: { item: objectId(details.product) } }
          }
        )
        .then((response) => {
          resolve({ removeProduct: true })
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);

        });


    })




  },
  getWalletBalance: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(userId) })
      let balance = Math.abs(wallet.balance);
      resolve(balance)
    })
  },
  addToWallet: (refund, userId) => {
    let amount = parseInt(refund);
    return new Promise(async (resolve, reject) => {
      let userWallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(userId) })

      if (userWallet) {

        // update the balance in the wallet
        db.get().collection(collection.WALLET_COLLECTION)
          .updateOne({ user: objectId(userId) },
            {
              $inc: { balance: amount }
            }
          ).then(() => {
            resolve()
          })

      } else {
        let balanceObj = {
          user: objectId(userId),
          balance: amount
        }
        db.get().collection(collection.WALLET_COLLECTION).insertOne(balanceObj).then((response) => {
          console.log(response);
          resolve()
        })

      }

    })
  },
  updateWallet: (total, userId) => {
    let amount = parseInt(total);
    return new Promise(async (resolve, reject) => {
      let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: objectId(userId) })
      const balance = Math.abs(wallet.balance);
      console.log(balance, "BALANCE AMount");
      if (balance < amount) {
        let outOfCash = false;
        resolve({ outOfCash: true })
      } else {
        // update the balance in the wallet
        db.get().collection(collection.WALLET_COLLECTION)
          .updateOne({ user: objectId(userId) },
            {
              $inc: { balance: -amount }
            }
          ).then(() => {
            let walletSuccess = false;
            resolve({ walletSuccess: true })
          })

      }



    })
  },
  removeCartItems: (userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })

        .then((response) => {
          resolve({})
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);

        });



    })




  },
  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponId) })
        .then((response) => {
          console.log(response);
          resolve(response)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },
  getEditCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: objectId(couponId) })
        .then((coupon) => {
          resolve(coupon)
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error.message}`);
        });
    })
  },
  updateCoupon: (couponId, couponDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION)
        .updateOne({ _id: objectId(couponId) }, {
          $set: {
            couponName: couponDetails.couponName,
            discountAmount: couponDetails.discountAmount,
            couponDescription: couponDetails.couponDescription,
            expirationDate: couponDetails.expirationDate
          }
        })
        .then((response) => {
          console.log(response);
          resolve()
        })
        .catch(error => {
          console.error(`The operation failed with error: ${error}`);
        });
    })
  }




}
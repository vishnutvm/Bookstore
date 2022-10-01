const db = require("../config/connections");
const collection = require("../config/collections");
const objectId = require("mongodb").ObjectId;

module.exports = {
  getAllUsers: () => {
    return new Promise(async (res, rej) => {
      let usersDetails = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .find()
        .toArray();
      console.log(usersDetails);
      res(usersDetails);
    });
  },
  blockUser: (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .updateOne({ _id: objectId(userId) }, { $set: { blocked: true } })
        .then((response) => {
          resolve(response);
        });
    });
  },
  unblockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .updateOne({ _id: objectId(userId) }, { $set: { blocked: false } })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllOrders: () => {
    return new Promise(async (res, rej) => {
      let allOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTIONS)
        .aggregate([
          {
            $lookup: {
              from: collection.USER_COLLECTIONS,
              localField: "userId",
              foreignField: "_id",
              as: "users",
            },
          },
        ])
        .toArray();
      console.log(allOrders.users);
      res(allOrders);
    });
  },
  satusToPacking: (orderId) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.ORDER_COLLECTIONS)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Packing",
            },
          }
        )
        .then(() => {
          res();
        });
    });
  },
  satusToShipped: (orderId) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.ORDER_COLLECTIONS)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Shipped",
            },
          }
        )
        .then(() => {
          res();
        });
    });
  },
  satusToDelivered: (orderId) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.ORDER_COLLECTIONS)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Delivered",
            },
          }


        )
        .then(() => {
          res();
        });
    });
  },
  cancelOrder: (orderId) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.ORDER_COLLECTIONS)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Cancelled By Seller",
            },
          }
        )
        .then(() => {
          res();
        });
    });
  },
  addCarousel: (carouselData) => {
    console.log(carouselData);
    return new Promise(async (res, rej) => {
      await db
        .get()
        .collection(collection.CAROUSEL_COLLECTIONS)
        .insertOne(carouselData)
        .then((response) => {
          console.log(response);
          res(response.insertedId);
        });
    });
  },
  getCarousel: () => {
    return new Promise(async (res, rej) => {
      var carousels = await db
        .get()
        .collection(collection.CAROUSEL_COLLECTIONS)
        .find()
        .toArray();

      res(carousels);
    });
  },
  deleteCaursol: (caursolId) => {
    return new Promise(async (res, rej) => {
      db.get()
        .collection(collection.CAROUSEL_COLLECTIONS)
        .deleteOne({ _id: objectId(caursolId) })
        .then((response) => {
          // passing the response. may use later
          res(response);
        });
    });
  },
  addCategoryTohome: (categories) => {
    return new Promise(async(res, rej) => {
      // first reseting the collection
    console.log("showing the input")
console.log(categories.options)

 if(categories.options == ''){
  console.log("null ")
 await db.get().collection(collection.HOMECATEGORY_COLLECTIONS).deleteMany({}).then((response)=>{
  res()
 })

}else{
  console.log("wokring too")
     await db.get().collection(collection.HOMECATEGORY_COLLECTIONS).deleteMany({})

    let categoriesArry = categories.options.split(",");

      console.log(categoriesArry);

     categoriesArry.forEach((category) => {

        db.get()
          .collection(collection.HOMECATEGORY_COLLECTIONS)
          .insertOne({category})
          .then((response) => {
            // passing the resonse it may usefull in future
            res(response);
          }).catch((err)=>{
            console.log(err)
          });
          
     });
}

    });
  },
  getHomeCategory:()=>{
    return new Promise(async (res, rej) => {

      


      var homeCategory = await db
        .get()
        .collection(collection.HOMECATEGORY_COLLECTIONS)
        .find()
        .toArray();

      res(homeCategory);
    });
  },
  addTrendingProducts: (products) => {
    return new Promise(async(res, rej) => {
      // first reseting the collection

if(products.options == ''){
  db.get().collection(collection.TRENDINGPRODUCT_COLLECIONS).deleteMany({})
  res()
}else{

      db.get().collection(collection.TRENDINGPRODUCT_COLLECIONS).deleteMany({})

    let trend = products.options.split(",");

      console.log(trend);

     trend.forEach((product) => {
 product = objectId(product)
        db.get()
          .collection(collection.TRENDINGPRODUCT_COLLECIONS)
          .insertOne({product})
          .then((response) => {
            // passing the resonse it may usefull in future
            res(response);
          }).catch((err)=>{
            console.log(err)
          });
          
     });
}

    });
  },
  getTrending:()=>{
    return new Promise(async (res, rej) => {

      const trending = await db.get().collection(collection.TRENDINGPRODUCT_COLLECIONS).aggregate([
      {
        $lookup:{
          from:collection.PRODUCT_COLLECTIONS,
          localField:'product',
          foreignField:'_id',
          as:'product'
        }
      }
      ]).toArray()
      // the product details of trending products will get in trending[index].product
      res(trending)
    });
  },
};

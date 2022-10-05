const db = require("../config/connections");
const collection = require("../config/collections");
const objectId = require("mongodb").ObjectId;
const excelJs = require("exceljs");

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
    return new Promise(async (res, rej) => {
      // first reseting the collection
      console.log("showing the input");
      console.log(categories.options);

      if (categories.options == "") {
        console.log("null ");
        await db
          .get()
          .collection(collection.HOMECATEGORY_COLLECTIONS)
          .deleteMany({})
          .then((response) => {
            res();
          });
      } else {
        console.log("wokring too");
        await db
          .get()
          .collection(collection.HOMECATEGORY_COLLECTIONS)
          .deleteMany({});

        let categoriesArry = categories.options.split(",");

        console.log(categoriesArry);

        categoriesArry.forEach((category) => {
          db.get()
            .collection(collection.HOMECATEGORY_COLLECTIONS)
            .insertOne({ category })
            .then((response) => {
              // passing the resonse it may usefull in future
              res(response);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      }
    });
  },
  getHomeCategory: () => {
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
    return new Promise(async (res, rej) => {
      // first reseting the collection

      if (products.options == "") {
        db.get()
          .collection(collection.TRENDINGPRODUCT_COLLECIONS)
          .deleteMany({});
        res();
      } else {
        db.get()
          .collection(collection.TRENDINGPRODUCT_COLLECIONS)
          .deleteMany({});

        let trend = products.options.split(",");

        console.log(trend);

        trend.forEach((product) => {
          product = objectId(product);
          db.get()
            .collection(collection.TRENDINGPRODUCT_COLLECIONS)
            .insertOne({ product })
            .then((response) => {
              // passing the resonse it may usefull in future
              res(response);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      }
    });
  },
  getTrending: () => {
    return new Promise(async (res, rej) => {
      const trending = await db
        .get()
        .collection(collection.TRENDINGPRODUCT_COLLECIONS)
        .aggregate([
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "product",
              foreignField: "_id",
              as: "product",
            },
          },
        ])
        .toArray();
      // the product details of trending products will get in trending[index].product
      res(trending);
    });
  },
  getMonthSalesReport: () => {
    currentYear = new Date().getFullYear();
    return new Promise(async (res, rej) => {
      let SalesReport = await db
        .get()
        .collection(collection.ORDER_COLLECTIONS)
        .aggregate([
          {
            $match: {
              CurrentDate: {
                $gte: new Date(`${currentYear}-01-01`),
                $lt: new Date(`${currentYear + 1}-01-01`),
              },
            },
          },
          {
            $group: {
              _id: "$currentMonth",
              totalSalesAmount: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      res(SalesReport);
    });
  },
  getProductReport: () => {
    currentYear = new Date().getFullYear();
    return new Promise(async (res, rej) => {
      let ProductReport = await db
        .get()
        .collection(collection.ORDER_COLLECTIONS)
        .aggregate([
          {
            $match: {
              CurrentDate: {
                $gte: new Date(`${currentYear}-01-01`),
                $lt: new Date(`${currentYear + 1}-01-01`),
              },
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $group: {
              _id: "$item",
              totalSaledProduct: { $sum: "$quantity" },
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              name: "$product.name",
              totalSaledProduct: 1,
              _id: 1,
            },
          },
        ])
        .toArray();
      console.log(ProductReport);
      res(ProductReport);
    });
  },
  getTotalProducts: () => {
    return new Promise(async (res, rej) => {
      let totalProduct = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .count();

      res(totalProduct);
    });
  },
  getTotalOrders: () => {
    return new Promise(async (res, rej) => {
      let totalOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTIONS)
        .count();

      res(totalOrders);
    });
  },

  getTotalSalesReport: () => {
    // giving total sales report (including all the status,payment method,date) no fileteration is given

    return new Promise(async (res, rej) => {
      let SalesReport = await db
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
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
        ])
        .toArray();
      console.log("sales report");
      console.log(SalesReport);
      res(SalesReport);
    });
  },
  addProductOffer: (offerData) => {
    let productsArray = offerData.options.split(",");
    let products = [];

    productsArray.forEach((prod) => {
      products.push({ product: objectId(prod) });
    });
    console.log(offerData);
    const offer = {
      name: offerData.name,
      value: offerData.value,
      include: products,
    };
    console.log(offer);

    return new Promise((res, rej) => {
      db.get()
        .collection(collection.OFFER_COLLECIONS)
        .insertOne(offer)
        .then((response) => {
          // passing the resonse it may usefull in future
          console.log(response);

          products.forEach(async (val) => {
            val.product;

            let product = await db
              .get()
              .collection(collection.PRODUCT_COLLECTIONS)
              .findOne({ _id: objectId(val.product) });
            console.log(product);
            var finalprice =
              parseInt(product.price) -
              (parseInt(product.price) * offerData.value) / 100;

            console.log(offerData.value);

            db.get()
              .collection(collection.PRODUCT_COLLECTIONS)
              .updateOne(
                { _id: val.product },
                {
                  $set: {
                    discount: offerData.value,
                    finalPrice: finalprice,
                    offer: true,
                  },
                }
              )
              .then(() => {
                res();
              });
          });
        });
    });
  },
  getAllOffers: () => {
    return new Promise((res, rej) => {
      let offers = db
        .get()
        .collection(collection.OFFER_COLLECIONS)
        .aggregate([
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "include.product",
              foreignField: "_id",
              as: "products",
            },
          },
        ])

        .toArray();
      res(offers);
    });
  },
  deleteOffer: (offId) => {
    return new Promise(async (res, rej) => {


      let offerData = await db
      .get()
      .collection(collection.OFFER_COLLECIONS)
      .aggregate([
        {
          $match: { _id: objectId(offId) },
        }
      ]).toArray()

      offerData[0].include.forEach(async (eachProd)=>{

      let singleProd= await db.get().collection(collection.PRODUCT_COLLECTIONS).find({_id:eachProd.product}).toArray()

        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne(
               { _id: eachProd.product },
                {
                  $set: {
                    discount: 0,
                    finalPrice:singleProd[0].price ,
                    offer: false,
                  },
                }
        )
      })


      await db.get().collection(collection.OFFER_COLLECIONS).deleteOne(({_id:objectId(offId)}))







      console.log("debug data");
  
      res();
    });
  },
};

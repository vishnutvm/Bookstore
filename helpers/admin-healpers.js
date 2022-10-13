const db = require("../config/connections");
const collection = require("../config/collections");
const objectId = require("mongodb").ObjectId;

module.exports = {
  // helper function for get all users
  getAllUsers: () => {
    return new Promise(async (res, rej) => {
      const usersDetails = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .find()
        .toArray();
      console.log(usersDetails);
      res(usersDetails);
    });
  },

  // helper function for block the user
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
  // helper function for unblock the users
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

  // helper function for get All the orederDetails
  getAllOrders: () => {
    return new Promise(async (res, rej) => {
      const allOrders = await db
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

  // helper function for change the order status to packing
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

  // helper function for change the order status to shipped
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
  // helper function for change the order status to deleverd
  satusToDelivered: (orderId) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.ORDER_COLLECTIONS)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "Delivered",
              deliverd: true,
            },
          }
        )
        .then(() => {
          res();
        });
    });
  },
  // helper function for cancel the order by admin
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
  // helper function for add carousel in home page by admin
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
  // helper function for get all the carousel
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
  // helper function for delete added Caursol by admin
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

  // helper function for add main categories to home page by admin
  addCategoryTohome: (categories) => {
    return new Promise(async (res, rej) => {
      // first reseting the collection
      // console.log("showing the input");
      // console.log(categories.options);

      if (categories.options == "") {
        // console.log("null ");
        await db
          .get()
          .collection(collection.HOMECATEGORY_COLLECTIONS)
          .deleteMany({})
          .then((response) => {
            res();
          });
      } else {
        // console.log("wokring too");
        await db
          .get()
          .collection(collection.HOMECATEGORY_COLLECTIONS)
          .deleteMany({});

        const categoriesArry = categories.options.split(",");

        // console.log(categoriesArry);

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

  // helper function for get all the categories in home page added by admin
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

  // helper function for add trending products in home page by admin
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

        const trend = products.options.split(",");

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
  // helper function for get all trending products
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
  // helper function for get monthly sales report
  getMonthSalesReport: () => {
    currentYear = new Date().getFullYear();
    return new Promise(async (res, rej) => {
      const SalesReport = await db
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
  // helper function for get top selling products report
  getProductReport: () => {
    currentYear = new Date().getFullYear();
    return new Promise(async (res, rej) => {
      const ProductReport = await db
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

  // helper function for get total products count
  getTotalProducts: () => {
    return new Promise(async (res, rej) => {
      const totalProduct = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .count();

      res(totalProduct);
    });
  },
  // helper function for get total orders count
  getTotalOrders: () => {
    return new Promise(async (res, rej) => {
      const totalOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTIONS)
        .count();

      res(totalOrders);
    });
  },
  // helper function for get sales report
  getTotalSalesReport: () => {
    // giving total sales report (including all the status,payment method,date) no fileteration is given

    return new Promise(async (res, rej) => {
      const SalesReport = await db
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
    console.log(offerData);
    let productsArray = offerData.options.split(",");
    let products = [];

    productsArray.forEach((prod) => {
      products.push({ product: objectId(prod) });
    });
    console.log(offerData);
    const offer = {
      name: offerData.name,
      value: offerData.value,
      offerType: offerData.offerType,
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
          },
        ])
        .toArray();

      offerData[0].include.forEach(async (eachProd) => {
        let singleProd = await db
          .get()
          .collection(collection.PRODUCT_COLLECTIONS)
          .find({ _id: eachProd.product })
          .toArray();

        db.get()
          .collection(collection.PRODUCT_COLLECTIONS)
          .updateOne(
            { _id: eachProd.product },
            {
              $set: {
                discount: 0,
                finalPrice: singleProd[0].price,
                offer: false,
              },
            }
          );
      });

      await db
        .get()
        .collection(collection.OFFER_COLLECIONS)
        .deleteOne({ _id: objectId(offId) });

      console.log("debug data");

      res();
    });
  },

  addCategoryOffer: async (offerData) => {
    // giving the product Array
    let categories = offerData.options.split(",");

    console.log(categories);
    let productsArray = await db
      .get()
      .collection(collection.PRODUCT_COLLECTIONS)
      .find({ category: { $in: categories } })
      .toArray();
    console.log("debugPrduct");
    console.log(productsArray);

    // let productsArray = offerData.options.split(",");
    let products = [];

    productsArray.forEach((prod) => {
      products.push({ product: prod._id });
    });
    console.log(offerData);
    const offer = {
      name: offerData.name,
      value: offerData.value,
      offerType: offerData.offerType,
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
  addCoupen: (coupenData) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.COUPENCODE_COLLECTIONS)
        .insertOne(coupenData)
        .then((response) => {
          // passing the resonse it may usefull in future
          res(response);
        });
    });
  },
  getAllCoupen: () => {
    return new Promise((res, rej) => {
      let coupen = db
        .get()
        .collection(collection.COUPENCODE_COLLECTIONS)
        .find()
        .toArray();
      res(coupen);
    });
  },
  deleteCoupen: (id) => {
    console.log("delete stared");
    console.log(id);
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.COUPENCODE_COLLECTIONS)
        .deleteOne({ _id: objectId(id) })
        .then((response) => {
          // passing the response. may use later
          res(response);
        });
    });
  },
  getApplyToken: (tokenId) => {
    return new Promise((res, rej) => {
      let coupen = db
        .get()
        .collection(collection.COUPENCODE_COLLECTIONS)
        .find({ _id: objectId(tokenId) })
        .toArray();
      res(coupen);
    });
  },
};

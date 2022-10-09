const db = require("../config/connections");
const collection = require("../config/collections");
const objectid = require("mongodb").ObjectId;

module.exports = {
  addProduct: (productdata) => {

    console.log(productdata)
    return new Promise(async (res, rej) => {
      productdata.discount=0;
      productdata.finalPrice= productdata.price - productdata.discount;
      productdata.offer=false;
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .insertOne(productdata)
        .then((response) => {
          res(response.insertedId);
        });
    });
  },
  getAllProduct: () => {


    return new Promise(async (res, rej) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find()
        .toArray();
      res(product);


    });


  },


  getFillterdProduct:(category)=>{

    return new Promise(async (res, rej) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .find({ category: category })
        .toArray();
      res(product);


    });


  },
  addCategory: (category) => {
    category.offer=false;
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTIONS)
        .insertOne(category)
        .then((response) => {
          // passing the resonse it may usefull in future
          res(response);
        });
    });
  },
  getAllCategory: () => {
    return new Promise((res, rej) => {
      let category = db
        .get()
        .collection(collection.CATEGORY_COLLECTIONS)
        .find()
        .toArray();
      res(category);
    });
  },
  deleteCategory: (id) => {
    console.log("delete stared");
    console.log(id);
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTIONS)
        .deleteOne({ _id: objectid(id) })
        .then((response) => {
          // passing the response. may use later
          res(response);
        });
    });
  },
  getAllSubCategory: () => {
    return new Promise(async (res, rej) => {
      console.log("getting sub category working...");
      let subCategory = await db
        .get()
        .collection(collection.SUB_CATEGORY_COLLECTIONS)
        .find()
        .toArray();
      res(subCategory);
    });
  },
  addSubCategory: (subcategory) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.SUB_CATEGORY_COLLECTIONS)
        .insertOne(subcategory)
        .then((response) => {
          // passing the resonse it may usefull in future
          res(response);
        });
    });
  },
  deleteSubCategory: (id) => {
    console.log("sub delete stared");
    console.log(id);
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.SUB_CATEGORY_COLLECTIONS)
        .deleteOne({ _id: objectid(id) })
        .then((response) => {
          // passing the response. may use later
          res(response);
        });
    });
  },
  deleteProduct: (id) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .deleteOne({ _id: objectid(id) })
        .then((response) => {
          res(response);
        });
    });
  },
  getEditProduct: (id) => {
    return new Promise((res, rej) => {
      let editingProduct = db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .findOne({ _id: objectid(id) });
      res(editingProduct);
    });
  },
  editProduct: (editedData, id) => {
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .updateOne(
          { _id: objectid(id) },
          {
            $set: {
              name: editedData.name,
              authname: editedData.authname,
              price: editedData.price,
              discription: editedData.discription,
              category: editedData.category,
              subcategory: editedData.subcategory,
              stock:editedData.stock
            },
          }
        )
        .then((response) => {
          res(response.insertedId);
        });
    });
  },
  getProductDetails:(proId)=>{
    return new Promise(async(res,rej)=>{
      try{
        let ProductDetails = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS)
        .findOne({ _id: objectid(proId)})
        res(ProductDetails)
      
      }catch(err){
        rej(err)
      }
     
    })


  },
  getAllProductWithoutOffer:()=>{

    return new Promise(async (res, rej) => {

      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTIONS).aggregate([
          {
            $match:{offer:false}
          }
        ]).toArray()
      res(product);

    });

  },
  getAllCategoryWithoutOffer: () => {
    return new Promise((res, rej) => {
      let category = db
        .get()
        .collection(collection.CATEGORY_COLLECTIONS).aggregate([
          {
            $match:{offer:false}
          }
        ]).toArray()
        console.log(category)
      res(category);
    });
  },


};

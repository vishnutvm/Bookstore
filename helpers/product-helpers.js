const db = require("../config/connections");
const collection = require("../config/collections");
const objectid = require('mongodb').ObjectId



module.exports = {
    addProduct:(productdata)=>{
        return new Promise(async(res,rej)=>{
           await db.get().collection(collection.PRODUCT_COLLECTIONS).insertOne(productdata).then((response)=>{

                res(response.insertedId)
            })
        })
    },
    getAllProduct:()=>{
        return new Promise(async(res,rej)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
            res(product)
        })
    },
    addCategory:(categoryName)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTIONS).insertOne(categoryName).then((response)=>{
                // passing the resonse it may usefull in future 
                res(response)
            })
        })
    },
    getAllCategory:()=>{

        return new Promise ((res,rej)=>{
          
        let category =  db.get().collection(collection.CATEGORY_COLLECTIONS).find().toArray()
        res(category)
 
        })
    },
    deleteCategory:(id)=>{
        console.log("delete stared")
        console.log(id)
        return new Promise((res,rej)=>{
            db.get().collection(collection.CATEGORY_COLLECTIONS).deleteOne({_id:objectid(id)}).then((response)=>{
                // passing the response. may use later
                res(response)
            })
        })

    },
    getAllSubCategory:()=>{
        return new Promise (async(res,rej)=>{
            console.log("getting sub category working...")
            let subCategory=  await db.get().collection(collection.SUB_CATEGORY_COLLECTIONS).find().toArray();
            res(subCategory)
        })
    },
    addSubCategory:(subcategory)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collection.SUB_CATEGORY_COLLECTIONS).insertOne(subcategory).then((response)=>{
                // passing the resonse it may usefull in future 
                res(response)
            })
        })
    },
    deleteSubCategory:(id)=>{
        console.log("sub delete stared")
        console.log(id)
        return new Promise((res,rej)=>{
            db.get().collection(collection.SUB_CATEGORY_COLLECTIONS).deleteOne({_id:objectid(id)}).then((response)=>{
                // passing the response. may use later
                res(response)
            })
        })

    },
}


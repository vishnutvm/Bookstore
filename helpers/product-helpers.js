const db = require("../config/connections");
const collection = require("../config/collections");
const convert = require('mongodb').ObjectId



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
    }
}

// getAllUsers: ()=>{
//     return new Promise (async(res,rej)=>{
//        let usersDetails= await db.get().collection(collection.USER_COLLECTIONS).find().toArray()
//        console.log(usersDetails)
//        res(usersDetails)
//     })   
//    },
const db = require("../config/connections");
const collection = require("../config/collections");
const objectId = require('mongodb').ObjectId


module.exports = {
    getAllUsers: ()=>{
     return new Promise (async(res,rej)=>{
        let usersDetails= await db.get().collection(collection.USER_COLLECTIONS).find().toArray()
        console.log(usersDetails)
        res(usersDetails)
     })   
    },
    blockUser:(userId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:objectId(userId)},{$set:{blocked:true}}).then((response)=>{
                resolve(response)
            })
        })
    },
    unblockUser:(userId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:objectId(userId)},{$set:{blocked:false}}).then((response)=>{
                resolve(response)
            })
        })
    }
}
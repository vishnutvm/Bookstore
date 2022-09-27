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
        console.log(userId)
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
    },
    getAllOrders:()=>{
        return new Promise(async(res,rej)=>{
            let allOrders = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                {
                    $lookup:{
                        from:collection.USER_COLLECTIONS,
                        localField:'userId',
                        foreignField:'_id',
                        as:'users'
                      }
                }
            ]).toArray()
            console.log(allOrders.users)
            res(allOrders)
        })
        },
        satusToPacking:(orderId)=>{
            return new Promise((res,rej)=>{
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},{
               $set:{
                 status:'Packing'
               }
             }).then(()=>{
               res()
             })
             })
        },
        satusToShipped:(orderId)=>{
            return new Promise((res,rej)=>{
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},{
               $set:{
                 status:'Shipped'
               }
             }).then(()=>{
               res()
             })
             })
        },
        satusToDelivered:(orderId)=>{
            return new Promise((res,rej)=>{
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},{
               $set:{
                 status:'Delivered'
               }
             }).then(()=>{
               res()
             })
             })
        },
        cancelOrder:(orderId)=>{
            return new Promise((res,rej)=>{
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},{
               $set:{
                 status:'Cancelled By Seller'
               }
             }).then(()=>{
               res()
             })
             })

        }

}
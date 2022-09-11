const db = require("../config/connections");
const collection = require("../config/collections");

module.exports = {
    getAllUsers: ()=>{
     return new Promise (async(res,rej)=>{
        let usersDetails= await db.get().collection(collection.USER_COLLECTIONS).find().toArray()
        console.log(usersDetails)
        res(usersDetails)
     })   
    }
}
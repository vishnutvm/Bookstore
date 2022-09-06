const db = require('../config/connections')
const collection= require('../config/collections')
const bcrypt = require('bcrypt');
module.exports={ 
    doSignup:(userData)=>{
        return new Promise (async(res,rej)=>{
              userData.password= await bcrypt.hash(userData.password,10)
           db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
                res(data)
            })
            
        })
      

    }
}
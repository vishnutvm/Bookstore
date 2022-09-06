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
      

    },
    doLogin:(userData)=>{
        console.log(userData)
        return new Promise (async(res,rej)=>{
            let response={}
            let user =await db.get().collection(collection.USER_COLLECTIONS).findOne({email: userData.email})

            console.log(user)
            if(user){
                console.log('email find')
                bcrypt.compare(userData.password, user.password).then((status)=>{
                    console.log(status);
                    if(status){
                        console.log('login success')
                        response.user = user
                        response.status = true;
                        res(response)
                    }else{
                        console.log("login filed")
                        res({status:false})
                    }
                })
            }else{
              
                res({status:false})
            }
        })
    }
}
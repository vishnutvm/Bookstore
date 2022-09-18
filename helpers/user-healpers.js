const db = require("../config/connections");
const collection = require("../config/collections");
const config = require('../config/otpConfig')
const objectid = require("mongodb").ObjectId;
const client = require('twilio')(config.accountSID,config.authToken)
const bcrypt = require("bcrypt");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (res, rej) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      userData.address = "Not given"
      userData.blocked = false;
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .insertOne(userData)
        .then((data) => {
          res(data);
        });
    });
  },
  doLogin: (userData) => {
    console.log(userData);
    return new Promise(async (res, rej) => {
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ email: userData.email });
      console.log(user);

        // checking if the user is blocked or not blocked
        if(user){
          if(user.blocked){
            response.blocked=true
             res(response)
           }else{
            console.log("email find");
            bcrypt.compare(userData.password, user.password).then((status) => {
              console.log(status);
              if (status) {
                console.log("login success");
                response.user = user;
                response.status = true;
                res(response);
              } else {
                console.log("login filed");
                res({ status: false });
              }
            });
           }
        }   else {
          res({ status: false });
        }
 

        
       
   
     
    });
  },
  sendOtp: (phone) => {
    console.log("started to send")
    console.log(phone)
phone="+91"+phone
console.log(phone)
    client
    .verify
      .services(config.serviceID)
      .verifications
      .create({
        to: phone,
        channel: "sms",
      })
      .then((data) => {
        console.log('otp Sending successfully to ${phone}');
      });
  }
  ,
  veriOtp:(otpval,phone)=>{

    return new  Promise(async(res,rej)=>{
          phone="+91"+phone
      console.log(phone)
    var OTP=""
    var otpverify

    otpval.forEach(val => {
        OTP +=val;
    });
    console.log(OTP)
    // chcking the otp

    if(OTP.length==4){
      await client
    .verify
    .services(config.serviceID)
    .verificationChecks
    .create({
        to:phone,
        code:OTP
    })
    .then((data)=>{
      console.log(data)
        if(data.status == 'approved'){
        otpverify=true;
        }else{
            otpverify=false
        }

    })
    }else{

      otpverify = false
    }
    console.log(otpverify)
    res(otpverify)
    
    })
  },
  addToCart:(proId,userId)=>{
    return new Promise (async(res,rej)=>{
         const userCart =await db.get().collection(collection.CART_COLLECTIONS).findOne({user:objectid(userId)})
         if(userCart){
          console.log("have the user cart")
           db.get().collection(collection.CART_COLLECTIONS).updateOne({user:objectid(userId)},{$push:{products:objectid(proId)}}).then((response)=>{
            res(response)
          })
         }else{
          console.log("creating the usercart for new")
            const cartObj={
              user:objectid(userId),
              products:[objectid(proId)]
            }
             db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response)=>{
              console.log(cartObj)
              res(response)
            })
         }
    })
  },
  getAllCart:(userId)=>{
    
    return new Promise(async(res,rej)=>{
      let cartItems=await db.get().collection(collection.CART_COLLECTIONS).aggregate([
        {
          $match:{user:objectid(userId)}
        },
        {
          $lookup:
          {
            from:"product",
            localField:"products",
            foreignField:"_id",
              as:"productData"
          }
        }
      ]).toArray()
      res(cartItems)
          
    })
  }

};

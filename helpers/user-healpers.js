const db = require("../config/connections");
const collection = require("../config/collections");
const config = require('../config/otpConfig')
const client = require('twilio')(config.accountSID,config.authToken)


const bcrypt = require("bcrypt");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (res, rej) => {
      userData.password = await bcrypt.hash(userData.password, 10);
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
      if (user) {
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
      } else {
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
    await client
    .verify
    .services(config.serviceID)
    .verificationChecks
    .create({
        to:phone,
        code:OTP
    }).then((data)=>{
      console.log(data)
        if(data.status == 'approved'){
        otpverify=true;
        }else{
            otpverify=false
        }

    })
    console.log(otpverify)
    res(otpverify)
    
    })
  }

};

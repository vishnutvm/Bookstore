// setting otp twilio credentials 
const accountSID=process.env.accountSID;
const serviceID=process.env.serviceID;
const authToken=process.env.authToken

const db = require("../config/connections");
const collection = require("../config/collections");
const config = require('../config/otpConfig')
const objectid = require("mongodb").ObjectId;
const client = require('twilio')(accountSID,authToken)
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
      .services(serviceID)
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
    .services(serviceID)
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
    var proObj ={
      item:objectid(proId),
      quantity:1
    }
    console.log(proId)
    return new Promise (async(res,rej)=>{
         const userCart =await db.get().collection(collection.CART_COLLECTIONS).findOne({user:objectid(userId)})
         console.log(userCart)
         if(userCart){
          console.log("alredy have a cart")
      
          var productExist=userCart.products.findIndex(product=> 
           product.item == proId
            )
            console.log(productExist)
            if(productExist!= -1){
            
              db.get().collection(collection.CART_COLLECTIONS).updateOne({'products.item':objectid(proId)},{
                $inc:{'products.$.quantity':1}
              }
              
              ).then(()=>{
                res()
              })
            }else{

              console.log(objectid(proId))
              console.log(productExist)
    
              console.log("have the user cart")
               db.get().collection(collection.CART_COLLECTIONS).updateOne({user:objectid(userId)},

                {$push:{products:proObj}}

                ).then((response)=>{
                res(response)
              })
            }
         }else{
          console.log("creating the new user cart ")
            const cartObj={
              user:objectid(userId),
              products:[proObj]
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
        },{
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTIONS,
            localField:'item',
            foreignField:'_id',
            as:'products'
          }
        },{
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
          }
        }
   
      ]).toArray()
      
      res(cartItems)
          
    })
  },
  getCartCount:(userId)=>{
    return new Promise(async(res,rej)=>{
      let count=0;
      let cart =await db.get().collection(collection.CART_COLLECTIONS).findOne({user:objectid(userId)})
     
      if(cart){
      
       cart.products.forEach((val)=>{
        count += val.quantity
        })
      }
      res(count)
    })
  },
  changeProductCount:(details)=>{
    console.log(details)
    
count = parseInt(details.count)
quantity = parseInt(details.quantity)

    return new Promise((res,rej)=>{


  if(count == -1 && quantity ==1){
    console.log("removing the c")
    db.get().collection(collection.CART_COLLECTIONS).updateOne({_id:objectid(details.cart)},
    {
      $pull:{products:{item:objectid(details.product)}}
    }
    ).then((response)=>{
      res({removeProduct:true})
    })
   
  }else{
    
    
          db.get().collection(collection.CART_COLLECTIONS).updateOne({_id:objectid(details.cart),'products.item':objectid(details.product)},{
            $inc:{'products.$.quantity':count}
          }
          
          ).then((response)=>{
            res(true)
          })
  }
    })

  },
  removeProduct:(prodData)=>{
    return new Promise((res,rej)=>{
      db.get().collection(collection.CART_COLLECTIONS).updateOne({_id:objectid(prodData.cartId)},
      {
        $pull:{products:{item:objectid(prodData.proId)}}
      }
      
      
      ).then((response)=>{
        res(response)
      })
    })
  },
  getTotalAmount:(userId)=>{
    return new Promise(async(res,rej)=>{
    prodata=await db.get().collection(collection.CART_COLLECTIONS).aggregate([
        {
          $match:{user:objectid(userId)}
        },{
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTIONS,
            localField:'item',
            foreignField:'_id',
            as:'products'
          }
        },{
          $project:{
            item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
          }
        }
       
      ]).toArray()


    let total=0;
    let grandTotal=0
    prodata.forEach((x)=>{
      
      // console.log(x.quantity)
      // console.log(x.product.price)
       total= (x.quantity) * (x.product.price)
       console.log(total)
       grandTotal += total
     })
     

      res(grandTotal)  
    })
  },
  placeOrder:(orderData,products,totalPrice)=>{
    return new Promise((res,rej)=>{
      console.log(orderData,products,totalPrice);
    let status = orderData.paymentMethod === 'cod'? 'placed' : 'pending';
    // creating obj for insert in order collection

    // getting current time data
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let AmOrPm = hours >= 12 ? 'pm' : 'am';
    hours = (hours % 12) || 12;
    let minutes = date_ob.getMinutes();

      // settig current time
     let currentTime = (year + "-" + month + "-" + date + "," + hours + ":" + minutes + " " + AmOrPm);
  



    let orderObj ={
      userId:objectid(orderData.userId),
      paymentMethod:orderData.paymentMethod,
      products:products,
      status:status,
      totalPrice:totalPrice,
      date:currentTime,
      deliveryDetails:{
        name:orderData.name,
        phone:orderData.phone,
        address:orderData.address,
        pincode:orderData.pincode,
      
      }
    }
    db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj).then((response)=>{

      // clearing the cart after the product checkout
      db.get().collection(collection.CART_COLLECTIONS).deleteOne({user:objectid(orderData.userId)}).then((response)=>{
        console.log(response)
      })

      res(response)
    })
    })
    

  },
  getCartProductList:(userId)=>{

    return new Promise(async(res,rej)=>{
      let cart= await db.get().collection(collection.CART_COLLECTIONS).findOne({user:objectid(userId)})
      res(cart.products)
    })
  },
  getAllOrders:(user)=>{
    return new Promise(async(res,rej)=>{
      console.log(user)
      let orders = await db.get().collection(collection.ORDER_COLLECTIONS).find({userId:objectid(user._id)}).toArray()
      console.log(orders)
      res(orders)
    })
  }

  


};

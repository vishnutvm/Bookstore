// setting otp twilio credentials 
const accountSID=process.env.accountSID;
const serviceID=process.env.serviceID;
const authToken=process.env.authToken

const db = require("../config/connections");
const collection = require("../config/collections");
const objectid = require("mongodb").ObjectId;
const client = require('twilio')(accountSID,authToken)
const bcrypt = require("bcrypt");





// rasopay 
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: "rzp_test_iuxZcw2GsP7kC4",
  key_secret:"oq5x15xdQVJG05DyZUcLQa4q",
});

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
    const OTP=""
    let otpverify

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
         let userCart =await db.get().collection(collection.CART_COLLECTIONS).findOne({user:objectid(userId)})
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
// add to wishlist
  addToWishlist:(proId,userId)=>{
    var proObj ={
      item:objectid(proId)
    }
return new Promise(async(res, rej)=>{

  let userwishlist =await db.get().collection(collection.WISHLIST_COLLECTIONS).findOne({user:objectid(userId)})

  console.log(userwishlist)


  if(userwishlist){
    console.log("alredy have a wishlist")
    
    var productExist=userwishlist.products.findIndex(product=> 
      product.item == proId
       )
       console.log(productExist)

if(productExist!= -1){


rej()
}else{
    console.log(objectid(proId))
        console.log(productExist)
         db.get().collection(collection.WISHLIST_COLLECTIONS).updateOne({user:objectid(userId)},
          {$push:{products:proObj}}

          ).then((response)=>{
          res(response)
          
        })
}



  }else{
    console.log("creating the new wish list for user ")
    const cartObj={
      user:objectid(userId),
      products:[proObj]
    }
     db.get().collection(collection.WISHLIST_COLLECTIONS).insertOne(cartObj).then((response)=>{
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
  
  getAllWishlist:(userId)=>{
    
    return new Promise(async(res,rej)=>{
      let wishlistItem=await db.get().collection(collection.WISHLIST_COLLECTIONS).aggregate([
        {
          $match:{user:objectid(userId)}
        },{
          $unwind:'$products'
        },
        {
          $project:{
            item:'$products.item',
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
            item:1,product:{$arrayElemAt:['$products',0]}
          }
        }
   
      ]).toArray()
      
      res(wishlistItem)
          
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
  getWishListCount:(userId)=>{
    return new Promise(async(res,rej)=>{
      let count=0;
      let wishlist =await db.get().collection(collection.WISHLIST_COLLECTIONS).findOne({user:objectid(userId)})
     
      if(wishlist){
      
       count =wishlist.products.length
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

  removeWishlitProduct:(prodData)=>{
    return new Promise((res,rej)=>{
      db.get().collection(collection.WISHLIST_COLLECTIONS).updateOne({_id:objectid(prodData.wishId)},
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
      
      console.log(x.quantity)
      console.log(x.product.price)
      console.log(x.product.finalPrice)
       total= (x.quantity) * (x.product.finalPrice)
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

    console.log("the current date is"+date_ob)
    console.log(date_ob.getDate())
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let AmOrPm = hours >= 12 ? 'pm' : 'am';
    hours = (hours % 12) || 12;
    let minutes = date_ob.getMinutes();

      // settig current time
     let currentTime = (year + "-" + month + "-" + date + " / " + hours + ":" + minutes + " " + AmOrPm);
      
     switch(month){
      case "1" :month="Jan"
      break;
      case "2" :month="Feb"
      break;
      case "3" :month="Mar"
      break;
      case "4" :month="Apr"
      break;
      case "5" :month="May"
      break;
      case "6" :month="Jun"
      break;
      case "7" :month="Jul"
      break;
      case "8" :month="Aug"
      break;
      case "9" :month="Sep"
      break;
      case "10" :month="Aug"
      break;
      case "11" :month="Nov"
      break;
      case "12" :month="Dec"
      break;
      default:console.log("someting wrong")
     }
console.log("the current moth is"+month)


    const orderObj ={
      userId:objectid(orderData.userId),
      paymentMethod:orderData.paymentMethod,
      products:products,
      status:status,
      deliverd:false,
      totalPrice:totalPrice,
      date:currentTime,
      CurrentDate:date_ob,
      currentMonth:month,
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
      console.log("the order id")
      console.log(response)
      res(response.insertedId)
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
  },



  
  getOrderdProducts:(orderId)=>{
    return new Promise(async(res,rej)=>{
      let orderDetails= await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
        {
          $match:{_id:objectid(orderId)}

        },
        {
          $unwind:'$products'
        }
        ,{
          $project:{
            paymentMethod:1,
            totalPrice:1,
            date:1,
            status:1,
            deliveryDetails:1,
            item:'$products.item',
            quantity:'$products.quantity'
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTIONS,
            localField:'item',
            foreignField:'_id',
            as:'product'
          }
          
        },{
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]},paymentMethod:1,totalPrice:1,deliveryDetails:1,date:1,status:1
            }
          }
      ]).toArray()
    
      res(orderDetails)
    })
  },
  generateRazorpay:(orderId,totalprice)=>{
    console.log("Total price"+totalprice)
    return new Promise((res,rej)=>{

      var options = {
        amount: totalprice*100,  // amount in the smallest currency unit
        currency: "INR",
        // the receipt must be string and amount must be int so for converting the orderId to string easly - attached to a string(The order id use here only for making unique id)
        receipt: ""+orderId
      };
      console.log("options"+options)
      instance.orders.create(options, function(err, order) {
        if(err){
          console.log(err)
        }else{
         
           console.log(order);
        res(order)
        }
       
      });


    })
  },
  verifyPayment:(details)=>{
    console.log("enterd to verification")
    return new Promise((res,rej)=>{
      const crypto = require('crypto')
    let hmac = crypto.createHmac('sha256','oq5x15xdQVJG05DyZUcLQa4q')
    
    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
    hmac = hmac.digest('hex')
    if (hmac == details['payment[razorpay_signature]']) {
      console.log('mached')
      res()
  }
  else {
      console.log('not mached')
      rej()
  }
    })
  },
  changePaymentStatus:(orderId,currectStatus)=>{
    return new Promise((res,rej)=>{
       db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectid(orderId)},{
      $set:{
        status:currectStatus
      }
    }).then(()=>{
      res()
    })
    })
   
  },
  cancelOrder:(orderId)=>{
    return new Promise((res,rej)=>{
      db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectid(orderId)},{
     $set:{
       status:'Cancelled By Customer'
     }
   }).then(()=>{
     res()
   })
   })
  },


  returnOrder:(orderId)=>{
    return new Promise((res,rej)=>{
      db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectid(orderId)},{
     $set:{
       status:'Returned'
     }
   }).then(()=>{
     res()
   })
   })
  },
  getalluserData:(id)=>{
    return new Promise(async (res,rej)=>{
let userDetails =await db.get().collection(collection.USER_COLLECTIONS).find({_id:objectid(id)}).toArray()

res(userDetails)
   })
  },
  editProfile:(userdata,id)=>{
    console.log(userdata)
    return new Promise((res, rej) => {
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .updateOne(
          { _id: objectid(id) },
          {
            $set: {
              name: userdata.name,
              email:userdata.email,
              phone:userdata.phone,
              address:userdata.address
              
   
            },
          }
        )
        .then((response) => {
          res(response.insertedId);
        });
    }); 
  }


};

const express = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHealpers = require("../helpers/user-healpers");
const router = express.Router();
const paypal = require('paypal-rest-sdk');
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUMW-aazthVYZUjcjvCRbCZMO1pR0D13gMD_WwL7AgdEIKoTILry3B9rQGzOtZrhqlQZPcYnLD-Vuixu',
  'client_secret': 'EPOay6fgqj301VsRw7Gw27GWFPcUpj5ugz-eBSY9MHPvwiyJLk4nvYStQK60m3LjUzaWlsc1O4b57FdH'
});


const verifyuserlogin = (req, res, next) => {
  if (req.session.userLoggin) {
    next();
  } else {
    res.redirect("/user_signin");
  }
};

/* GET users listing. */
router.get("/", async function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  let cartCount = 0;
  if (req.session.userLoggin) {
    cartCount = await userHealpers.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
  }

  productHelpers.getAllProduct().then((products) => {
    console.log(req.session.userLoggin);
    res.render("users/view-product", {
      user: true,
      userLoggin: req.session.userLoggin,
      products,
      cartCount,
    });
  });
});

router.get("/user_signin", (req, res) => {
  if (req.session.userLoggin) {
    res.redirect("/");
  } else {
    res.render("users/login", {
      logginErr: req.session.logginErr,
      blocked: req.session.blocked,
    });
    req.session.blocked = false;
    req.session.logginErr = false;
  }
});

router.post("/user_signin", async (req, res) => {
  await userHealpers.doLogin(req.body).then((response) => {
    if (response.blocked) {
      console.log("The user is blocked");
      req.session.blocked = true;
      res.redirect("/user_signin");
    } else {
      if (response.status) {
        req.session.phone = response.user.phone;
        req.session.user = response.user;

        res.redirect("/otp");
      } else {
        req.session.logginErr = true;
        res.redirect("/user_signin");
      }
    }
  });
});

// otp verification

router.get("/otp", (req, res) => {
  // hard setting for dev mod need to remove
  req.session.userLoggin = true;

  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  if (req.session.userLoggin) {
    res.redirect("/");
  } else {
    userHealpers.sendOtp(req.session.phone);
    res.render("users/otp", {
      phone: req.session.phone,
      otpErr: req.session.otpErr,
    });
    req.session.otpErr = false;
  }
});

router.post("/verifyOtp", (req, res) => {
  userHealpers.veriOtp(req.body.otpval, req.session.phone).then((verifi) => {
    console.log(verifi);
    if (verifi) {
      req.session.userLoggin = true;
      console.log("otp success");
      res.redirect("/");
    } else {
      console.log("otp failed");
      req.session.otpErr = true;
      res.redirect("/otp");
    }
  });
});

router.get("/resend", (req, res) => {
  res.redirect("/otp");
});

router.get("/user_logout", (req, res) => {
  req.session.userLoggin = false;
  res.redirect("/");
});

router.get("/user_registration", (req, res) => {
  res.render("users/register");
});

router.post("/user_registration", (req, res) => {
  userHealpers.doSignup(req.body).then((response) => {
    res.redirect("/user_signin");
  });
});

// cart

router.get("/product-details/:id", async(req,res)=>{
  const id = req.params.id;
  if(req.session.userLoggin){
    cartCount = await userHealpers.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
  }

await productHelpers.getProductDetails(id).then((productDetails)=>{


res.render("users/expand-product",{
      user: true,
  userLoggin: req.session.userLoggin,
  productDetails,
  
cartCount:req.session.cartCount
})
})



})


router.get("/cart", verifyuserlogin, async (req, res) => {
  let totalPrice = await userHealpers.getTotalAmount(req.session.user._id);
  req.session.totalPrice = totalPrice;
  cartCount = await userHealpers.getCartCount(req.session.user._id);
  req.session.cartCount = cartCount;
  let cartProduct = await userHealpers.getAllCart(req.session.user._id);

  res.render("users/cart", {
    cartProduct,
    user: true,
    userLoggin: req.session.userLoggin,
    cartCount: req.session.cartCount,
    totalPrice: totalPrice,
  });
});

// add to cart
router.get("/add-to-cart/:id", verifyuserlogin, (req, res) => {
  console.log("api call");
  userHealpers
    .addToCart(req.params.id, req.session.user._id)
    .then((response) => {
      res.json({ status: true });
    });
});

router.post("/change-pro-quantity", (req, res, next) => {
  console.log(req.body);
  userHealpers.changeProductCount(req.body).then((response) => {
    res.json(response);
  });
});
router.get("/remove-product", (req, res, next) => {
  console.log(req.query);
  console.log(req.query.cartId);
  console.log(req.query.proId);

  userHealpers.removeProduct(req.query).then((response) => {
    res.redirect("/cart");
  });
});

//order page
router.get("/place-order", verifyuserlogin, async (req, res) => {
  console.log("enterd in")
  // changed total price in the session for render new updated price in the cart
  let totalPrice = await userHealpers.getTotalAmount(req.session.user._id);
  req.session.totalPrice = totalPrice;

  res.render("users/placeOrder", {
    user: true,
    userLoggin: req.session.userLoggin,
    cartCount: req.session.cartCount,
    totalPrice: req.session.totalPrice,
    user:req.session.user
  });
});


// checkout 
router.post("/place-order",async(req,res)=>{
  console.log(req.body);
  // get total price
  let totalPrice = await userHealpers.getTotalAmount(req.body.userId);
  
  // get product
  let products= await userHealpers.getCartProductList(req.body.userId)
  // pass form data ,totalprice,product details to place order

  userHealpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{

    if(req.body['paymentMethod'] ==='cod'){
           res.json({codSuccess:true})
    }else if(req.body['paymentMethod'] ==='razorpay'){
    console.log("Genarating razorpay")
    userHealpers.generateRazorpay(orderId,totalPrice).then((order)=>{
      console.log("the respose is printing in admin.sj")
      console.log(order)
      res.json({order,razorpay:true})
    })
    }else{
      console.log("redirceing to genarate paypal section")

console.log(totalPrice)
      // generatePaypalPay(totalPrice)
      res.json({totalPrice,paypal:true,orderId})



    }

  })
})







// order success
router.get("/orderSuccess",verifyuserlogin,async(req,res)=>{
  cartCount = await userHealpers.getCartCount(req.session.user._id);
  req.session.cartCount = cartCount;
  res.render('users/orderSuccess',{user: true,
    userLoggin: req.session.userLoggin, cartCount: req.session.cartCount,})
})


router.get("/orders",verifyuserlogin,async(req,res)=>{
// geting orders form database
let orders = await userHealpers.getAllOrders(req.session.user)


  res.render('users/orders',{user: true,
    userLoggin: req.session.userLoggin, cartCount: req.session.cartCount,orders})
})

router.get("/cancelOrder/:id",(req,res)=>{
  const orderId = req.params.id
  userHealpers.cancelOrder(orderId).then((response)=>{
    console.log(response)
    res.redirect("/orders")
  })
})


// view orderded proudcts
router.get("/view-orderd-products/:id",verifyuserlogin,async(req,res)=>{
orderId = req.params.id
  // get total price

await userHealpers.getOrderdProducts(orderId).then((orderDetails)=>{
console.log(orderDetails)
totalPrice= orderDetails[0].totalPrice,
deliveryDetails= orderDetails[0].deliveryDetails,
CurrentStatus= orderDetails[0].status
PaymentMethod=orderDetails[0].paymentMethod.toUpperCase()
CurrentDate = orderDetails[0].date
console.log(PaymentMethod)
paymentStatus= PaymentMethod == 'COD' ? 'pending' : 'paid'


  res.render('users/viewOrderdProducts',{user: true,
  userLoggin: req.session.userLoggin, cartCount: req.session.cartCount,orderDetails,totalPrice,deliveryDetails,CurrentStatus,PaymentMethod,CurrentDate,paymentStatus})
})
})

// razorpay payment system

router.post("/razo-verify-payment",(req,res)=>{
  console.log(req.body)
  userHealpers.verifyPayment(req.body).then(()=>{
    userHealpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
    console.log("payment success")
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false})
  })
})





router.post("/paypal-payment", (req, res) => {
  console.log(req.body)
  // let totalPrice = req.body.totalPrice;
  let orderId =  req.body.orderId
  req.session.user.orderId= orderId
  console.log("the paypal is started to worki")
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:4000/paypal-payment/success",
        "cancel_url": "http://localhost:4000/paypal-payment/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {

  if (error) {
      throw error;
  } else {
    console.log("Create Payment resoponse")

    payment.orderId =orderId
    console.log(payment)

 {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          // res.redirect(payment.links[i].href)

          res.json({forwardLink: payment.links[i].href});
           
        }
      }
  }
  }
  
});

});


router.get("/paypal-payment/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
const orderId= req.session.user.orderId
  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
      console.log("this pay ment final")
console.log(payment.transactions[0])
console.log(payment.transactions[0].amount)

      userHealpers.changePaymentStatus(orderId).then(()=>{
        console.log("payment success")
          // res.json({status:true})
          console.log(JSON.stringify(payment));
        res.render("users/orderSuccess"); 
        })

      
        console.log(JSON.stringify(payment));
        res.render("users/orderSuccess");
        
        
    }
    
});
});

router.get("/paypal-payment/cancel", (req, res) => res.send('{Payment Cancelled'));

module.exports = router;

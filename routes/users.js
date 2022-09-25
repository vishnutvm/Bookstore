const express = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHealpers = require("../helpers/user-healpers");
const router = express.Router();

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

  userHealpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json({status:true})
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



module.exports = router;

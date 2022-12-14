const express = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHealpers = require("../helpers/user-healpers");
const adminHealpers = require("../helpers/admin-healpers");
const router = express.Router();
const paypal = require("paypal-rest-sdk");
const createError = require("http-errors");

var content;
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AUMW-aazthVYZUjcjvCRbCZMO1pR0D13gMD_WwL7AgdEIKoTILry3B9rQGzOtZrhqlQZPcYnLD-Vuixu",
  client_secret:
    "EPOay6fgqj301VsRw7Gw27GWFPcUpj5ugz-eBSY9MHPvwiyJLk4nvYStQK60m3LjUzaWlsc1O4b57FdH",
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
  let wishcount = 0;
  if (req.session.userLoggin) {
    cartCount = await userHealpers.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
    wishcount = await userHealpers.getWishListCount(req.session.user._id);
    req.session.wishcount = wishcount;
  }
  const carousels = await adminHealpers.getCarousel();
  const homeCategory = await adminHealpers.getHomeCategory();
  const trendingProduct = await adminHealpers.getTrending();

  console.log(req.session.userLoggin);
  res.render("users/home", {
    user: true,
    userLoggin: req.session.userLoggin,
    carousels,
    cartCount,
    homeCategory,
    trendingProduct,
    wishcount,
  });
});

router.get("/explore-all", async (req, res) => {
  let cartCount = 0;
  let wishcount = 0;
  if (req.session.userLoggin) {
    cartCount = await userHealpers.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
    wishcount = await userHealpers.getWishListCount(req.session.user._id);
    req.session.wishcount = wishcount;
  }
  let allCategory = await productHelpers.getAllCategory();
  let allSubCategory = await productHelpers.getAllSubCategory();
  productHelpers.getAllProduct().then((products) => {
    console.log(req.session.userLoggin);
    content = "vishnu";
    res.render("users/view-product", {
      user: true,
      userLoggin: req.session.userLoggin,
      products,
      cartCount,
      content,
      allCategory,
      allSubCategory,
      wishcount,
    });
  });
});

router.get("/products", async (req, res) => {
  const category = req.query.category;

  let cartCount = 0;
  let wishcount = 0;
  if (req.session.userLoggin) {
    cartCount = await userHealpers.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
    wishcount = await userHealpers.getWishListCount(req.session.user._id);
    req.session.wishcount = wishcount;
  }

  let allCategory = await productHelpers.getAllCategory();
  let allSubCategory = await productHelpers.getAllSubCategory();
  productHelpers.getFillterdProduct(category).then((products) => {
    res.render("users/view-product", {
      user: true,
      userLoggin: req.session.userLoggin,
      products,
      cartCount,
      category,
      allSubCategory,
      wishcount,
      categorySearch: true,
    });
  });
});

router.post("/product/filter", async (req, res) => {
  console.log(req.body.category);
  console.log("new api cal");
  let products;
  if (req.body.category == "All") {
    products = await productHelpers.getAllProduct();
  } else {
    products = await productHelpers.getFillterdProduct(req.body.category);
  }
  res.json({ products });
});
router.post("/products/langFilter", async (req, res) => {
  console.log(req.body);
  const subCategory = req.body.subCategoryName;
  const currectCategory = req.body.currentCategory;
  const minPrice = req.body.min_val;
  const maxPrice = req.body.max_val;

  let products = await productHelpers.advancedFilter(
    subCategory,
    currectCategory,
    minPrice,
    maxPrice
  );
  res.json({ products });
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

// otp verificationp

router.get("/otp", (req, res) => {
  // hard setting for dev mod need to remove
  // req.session.userLoggin = true;

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

router.get("/product-details/:id", async (req, res) => {
  const id = req.params.id;
  if (req.session.userLoggin) {
    cartCount = await userHealpers.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
    wishcount = await userHealpers.getWishListCount(req.session.user._id);
    req.session.wishcount = wishcount;
  }

  productHelpers
    .getProductDetails(id)
    .then((productDetails) => {
      res.render("users/expand-product", {
        user: true,
        userLoggin: req.session.userLoggin,
        productDetails,
        wishcount: req.session.wishcount,
        cartCount: req.session.cartCount,
      });
    })
    .catch((err) => {
      console.log("log err" + err);
      res.render("404", { message: err.message });
    });
});

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
    wishcount: req.session.wishcount,
  });
});

router.get("/wishlist", verifyuserlogin, async (req, res) => {
  cartCount = await userHealpers.getCartCount(req.session.user._id);
  // geting wishlist form database
  req.session.cartCount = cartCount;
  wishcount = await userHealpers.getWishListCount(req.session.user._id);
  req.session.wishcount = wishcount;
  let wishlist = await userHealpers.getAllWishlist(req.session.user._id);

  console.log(wishlist);
  res.render("users/wishlist", {
    user: true,
    userLoggin: req.session.userLoggin,
    cartCount: req.session.cartCount,
    wishcount: req.session.wishcount,
    wishlist,
  });
});

// add to cart
router.get("/add-to-cart/:id", verifyuserlogin, (req, res) => {
  console.log("api call");
  userHealpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});
// add to wishlist

router.get("/add-to-Wishlist/:id", verifyuserlogin, (req, res) => {
  console.log("api call  for wishlist");
  userHealpers
    .addToWishlist(req.params.id, req.session.user._id)
    .then((response) => {
      console.log("repsonse from db");
      console.log(response);
      res.json({ status: true });
    })
    .catch((err) => {
      res.json({ status: false });
    });
});

router.post("/change-pro-quantity", (req, res, next) => {
  console.log(req.body);
  userHealpers.changeProductCount(req.body).then((response) => {
    response.val = 10;
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

router.get("/remove-wish-product", (req, res, next) => {
  console.log(req.query);
  console.log(req.query.cartId);
  console.log(req.query.proId);

  userHealpers.removeWishlitProduct(req.query).then((response) => {
    res.redirect("/wishlist");
  });
});

//order page
router.get("/place-order", verifyuserlogin, async (req, res) => {
  try {
    let billingDetails = await userHealpers.getalluserData(
      req.session.user._id
    );

    console.log(billingDetails);

    console.log("enterd in");
    // changed total price in the session for render new updated price in the cart
    let totalPrice = await userHealpers.getTotalAmount(req.session.user._id);
    req.session.totalPrice = totalPrice;

    res.render("users/placeOrder", {
      user: true,
      userLoggin: req.session.userLoggin,
      cartCount: req.session.cartCount,
      totalPrice: req.session.totalPrice,
      user: req.session.user,
      wishcount: req.session.wishcount,
      billingDetails: billingDetails[0],
    });
  } catch (error) {
    console.log("log err" + error);
    res.redirect("/");
  }
});

// checkout
router.post("/place-order", async (req, res) => {
  console.log(req.body);
  // get total price
  let totalPrice = await userHealpers.getTotalAmount(req.body.userId);

  let token = await adminHealpers.getApplyToken(req.body.coupen);
  console.log("token Debug");
  if (token.length >= 1) {
    totalPrice = parseInt(totalPrice) - parseInt(token[0].value);
  }

  // get product
  try {
    var products = await userHealpers.getCartProductList(req.body.userId);
  } catch (err) {
    console.log(err);
    res.render("404");
  }

  // pass form data ,totalprice,product details to place order

  userHealpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body["paymentMethod"] === "cod") {
      res.json({ codSuccess: true });
    } else if (req.body["paymentMethod"] === "razorpay") {
      console.log("Genarating razorpay");
      userHealpers.generateRazorpay(orderId, totalPrice).then((order) => {
        console.log("the respose is printing in admin.sj");
        console.log(order);
        res.json({ order, razorpay: true });
      });
    } else {
      console.log("redirceing to genarate paypal section");

      console.log(totalPrice);
      // generatePaypalPay(totalPrice)
      res.json({ totalPrice, paypal: true, orderId });
    }
  });
});

// order success
router.get("/orderSuccess", verifyuserlogin, async (req, res) => {
  cartCount = await userHealpers.getCartCount(req.session.user._id);
  req.session.cartCount = cartCount;
  res.render("users/orderSuccess", {
    user: true,
    userLoggin: req.session.userLoggin,
    cartCount: req.session.cartCount,
    wishcount: req.session.wishcount,
  });
});

router.get("/orders", verifyuserlogin, async (req, res) => {
  // geting orders form database
  let orders = await userHealpers.getAllOrders(req.session.user);

  res.render("users/orders", {
    user: true,
    userLoggin: req.session.userLoggin,
    cartCount: req.session.cartCount,
    wishcount: req.session.wishcount,
    orders,
  });
});

router.get("/cancelOrder/:id", (req, res) => {
  const orderId = req.params.id;
  userHealpers.cancelOrder(orderId).then((response) => {
    console.log(response);
    res.redirect("/orders");
  });
});

router.get("/returnOrder/:id", (req, res) => {
  const orderId = req.params.id;
  userHealpers.returnOrder(orderId).then((response) => {
    console.log(response);
    res.redirect("/orders");
  });
});

// view orderded proudcts
router.get("/view-orderd-products/:id", verifyuserlogin, async (req, res) => {
  orderId = req.params.id;
  // get total price

  await userHealpers
    .getOrderdProducts(orderId)
    .then((orderDetails) => {
      console.log(orderDetails);
      (totalPrice = orderDetails[0].totalPrice),
        (deliveryDetails = orderDetails[0].deliveryDetails),
        (CurrentStatus = orderDetails[0].status);
      PaymentMethod = orderDetails[0].paymentMethod.toUpperCase();
      CurrentDate = orderDetails[0].date;
      console.log(PaymentMethod);
      // paymentStatus= PaymentMethod == 'COD' ? 'pending' : 'paid'

      if (PaymentMethod == "COD" && CurrentStatus == "placed") {
        paymentStatus = "pending";
      } else if (CurrentStatus == "pending") {
        paymentStatus = "pending";
      } else if (CurrentStatus == "Returned") {
        paymentStatus = "refunded";
      } else {
        paymentStatus = "paid";
      }

      res.render("users/viewOrderdProducts", {
        user: true,
        userLoggin: req.session.userLoggin,
        cartCount: req.session.cartCount,
        wishcount: req.session.wishcount,
        orderDetails,
        totalPrice,
        deliveryDetails,
        CurrentStatus,
        PaymentMethod,
        CurrentDate,
        paymentStatus,
      });
    })
    .catch((err) => {
      res.render("404");
    });
});

// razorpay payment system

router.post("/razo-verify-payment", (req, res) => {
  console.log(req.body);
  userHealpers
    .verifyPayment(req.body)
    .then(() => {
      currectStatus = "placed";

      userHealpers
        .changePaymentStatus(req.body["order[receipt]"], currectStatus)
        .then(() => {
          console.log("payment success");
          res.json({ status: true });
        });
    })
    .catch((err) => {
      console.log(err);
      currectStatus = "Payment Not Compleeted";

      userHealpers
        .changePaymentStatus(req.body["order[receipt]"], currectStatus)
        .then(() => {
          console.log("paymement not compeeeet");
          res.json({ status: false });
        });
    });
});

router.post("/verify-token", async (req, res) => {
  let offers = await adminHealpers.getAllCoupen();
  console.log(req.body.tokenName);

  var found = offers.find((e) => e.name == "" + req.body.tokenName);
  console.log(found);
  if (found == undefined) {
    res.json({ token: false });
  } else {
    res.json({ token: true, found });
  }
});

router.post("/paypal-payment", (req, res) => {
  let PORT = process.env.PORT;
  console.log(req.body);
  let totalPrice = req.body.totalPrice;
  req.session.totalPrice = totalPrice;
  let orderId = req.body.orderId;
  req.session.user.orderId = orderId;
  console.log("the paypal is started to worki");
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `http://localhost:${PORT}/paypal-payment/success`,
      cancel_url: `http://localhost:${PORT}/paypal-payment/cancel`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "" + totalPrice,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "" + totalPrice,
        },
        description: "Hat for the best team ever",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment resoponse");

      payment.orderId = orderId;
      console.log(payment);

      {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.json({ forwardLink: payment.links[i].href });
          }
        }
      }
    }
  });
});

router.get("/paypal-payment/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const totalPrice = req.session.totalPrice;
  const orderId = req.session.user.orderId;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "" + totalPrice,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log("this pay ment final");
        currectStatus = "placed";
        userHealpers.changePaymentStatus(orderId, currectStatus).then(() => {
          console.log("payment success");
          res.render("users/orderSuccess");
        });
      }
    }
  );
});

router.get("/paypal-payment/cancel", (req, res) => {
  // need to replace with the currect payment cancelled notification
  res.send("payment cancelled");
  const orderId = req.session.user.orderId;
  currectStatus = "Payment Not Compleeted";

  userHealpers.changePaymentStatus(orderId, currectStatus).then(() => {
    console.log("paymement not compeeeet");
    res.json({ status: false });
  });
});
//

router.get("/profile", verifyuserlogin, async (req, res) => {
  //getting orders form database
  let totalOrders = await userHealpers.getAllOrders(req.session.user);

  // geting userdata form database
  userHealpers.getalluserData(req.session.user._id).then((userdata) => {
    console.log(userdata);
    res.render("users/user-profile", {
      user: true,
      userLoggin: req.session.userLoggin,
      cartCount: req.session.cartCount,
      wishcount: req.session.wishcount,
      userdata: userdata[0],
      totalOrders: totalOrders.length,
    });
  });
});
router.get("/edit-profile", verifyuserlogin, (req, res) => {
  userHealpers.getalluserData(req.session.user._id).then((userdata) => {
    console.log(userdata);
    res.render("users/edit-profile-page", {
      user: true,
      userLoggin: req.session.userLoggin,
      cartCount: req.session.cartCount,
      wishcount: req.session.wishcount,
      userdata: userdata[0],
    });
  });
});

router.post("/editProfile/:id", (req, res) => {
  const id = req.params.id;
  userHealpers.editProfile(req.body, id).then((respose) => {
    res.redirect("/profile");
  });
});

module.exports = router;

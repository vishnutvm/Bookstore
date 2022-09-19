var express = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHealpers = require("../helpers/user-healpers");
var router = express.Router();

const verifyuserlogin = (req, res, next) => {
  if (req.session.userLoggin) {
    next();
  } else {
    res.redirect("/user_signin");
  }
};

/* GET users listing. */
router.get("/",async function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
let cartCount = 3
if(req.session.userLoggin){

  cartCount=await userHealpers.getCartCount(req.session.user._id)
  req.session.cartCount=cartCount
}
  
  productHelpers.getAllProduct().then((products) => {
    console.log(req.session.userLoggin)
    res.render("users/view-product", {
      user: true,
      userLoggin: req.session.userLoggin,
      products,
      cartCount
    });


  });
});



router.get("/user_signin", (req, res) => {
  // hard setting for wrok with code


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
        req.session.user = response.user
     
        res.redirect("/otp");
      } else {
        req.session.logginErr = true;
        res.redirect("/user_signin");
      }
    } 
  });
});

// otp verification

router.get("/otp",(req, res) => {
// hard setting for otp verificatoi need to remove
req.session.userLoggin =true


  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  if(req.session.userLoggin){
    res.redirect('/')
  }else{
    userHealpers.sendOtp(req.session.phone)
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

router.get('/resend',(req,res)=>{
  res.redirect('/otp')
})

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

router.get("/cart",async (req,res)=>{
 let cartProduct =await userHealpers.getAllCart(req.session.user._id)
  res.render("users/cart",{cartProduct,
    user: true,
    userLoggin: req.session.userLoggin,
  cartCount:req.session.cartCount
  })
})





// add to cart
router.get("/add-to-cart/:id",(req,res)=>{
  console.log("api call")
  // console.log(req.params.id)
  // console.log(req.session.user)
  userHealpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
    res.json({status:true})
  })


})

module.exports = router;

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
router.get("/", function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  productHelpers.getAllProduct().then((products) => {
    console.log(req.session.userLoggin)
    res.render("users/view-product", {
      user: true,
      userLoggin: req.session.userLoggin,
      products,
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
      req.session.userid = null;
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

module.exports = router;

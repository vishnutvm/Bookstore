const express = require("express");
const adminhelpers = require("../helpers/admin-healpers");
const productHelpers = require("../helpers/product-helpers");
const router = express.Router();
const path = require("path");

/* GET home page. */

// session middleware

const verifyLogin = (req, res, next) => {
  if (req.session.adminid) {
    next();
  } else {
    res.redirect("/admin/adminLogin");
  }
};

// adminlogg err
var adminLoggErr;
var session;
var adminLogin;

// setting admin id and pass
const adminDb = {
  username: "vishnu",
  password: "1234",
};

// admin page
router.get("/", function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  session = req.session;
  if (session.adminid) {
    res.render("admin/dashbord", { admin: true, adminLogin: adminLogin });
  } else {
    res.redirect("admin/adminLogin");
  }
});

// admin loggin
router.get("/adminLogin", (req, res) => {
  if (session.adminid) {
    res.redirect("/admin");
  }
  res.render("admin/login", { adminLoggErr: adminLoggErr, admin: true });
});

router.post("/adminLogin", function (req, res) {
  if (
    req.body.name == adminDb.username &&
    req.body.password == adminDb.password
  ) {
    session = req.session;
    session.adminid = req.body.name;
    adminLogin = true;
    console.log("admin log success");
    adminLoggErr = false;

    res.redirect("/admin");
  } else {
    console.log("admin log false");
    adminLoggErr = true;
    res.redirect("/admin");
  }
});

// admin logout
router.get("/adminLogout", (req, res) => {
  console.log("admin loggout");
  req.session.adminid = null;
  adminLogin = false;
  res.redirect("/admin");
});

// user managerment
router.get("/users", verifyLogin, (req, res) => {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  if (session.adminid) {
    adminhelpers.getAllUsers().then((allUsersDetails) => {
      res.render("admin/userManagement", {
        admin: true,
        adminLogin: adminLogin,
        allUsersDetails,
      });
    });
  } else {
    res.redirect("/admin");
  }
});

// block user
router.get("/block/:id", (req, res) => {
  const proId = req.params.id;
  adminhelpers.blockUser(proId).then((response) => {
    console.log(response);
    res.redirect("/admin/users");
  });
});

// unblock user
router.get("/unblock/:id", (req, res) => {
  const proId = req.params.id;
  adminhelpers.unblockUser(proId).then((response) => {
    res.redirect("/admin/users");
  });
});

// addproduct
router.get("/product", (req, res) => {
  if (req.session.adminid) {
    productHelpers.getAllProduct().then((product) => {
      res.render("admin/view-product", {
        admin: true,
        adminLogin: adminLogin,
        product,
      });
    });
  } else {
    res.redirect("/admin/adminLogin");
  }
});

router.get("/add-product", verifyLogin, (req, res) => {
  res.render("admin/add-product", { admin: true, adminLogin: adminLogin });
});

router.post("/add-product", (req, res) => {
  console.log(req.body);
  console.log(req.files.image);
  productHelpers.addProduct(req.body).then((response) => {
    let id = response.toString();
    let image = req.files.image;
    console.log(image);

    image.mv("./public/product-images/" + id + ".jpg");

    res.redirect("/admin/product");
  });
});

module.exports = router;

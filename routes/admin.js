const express = require("express");
const adminhelpers = require("../helpers/admin-healpers");
const productHelpers = require("../helpers/product-helpers");
const router = express.Router();


/* GET home page. */

// session middleware

const verifyAdminLogin = (req, res, next) => {

  // hard setting login to true for easy coding
  req.session.adminLoggin=true

  if (req.session.adminLoggin) {
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
router.get("/", verifyAdminLogin, function (req, res, next) {
  res.render("admin/dashbord", { admin: true, adminLogginPage: false });
});

// admin loggin
router.get("/adminLogin", (req, res) => {
  if (req.session.adminLoggin) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", {
      adminLoggErr: adminLoggErr,
      admin: true,
      adminLogginPage: true,
    });
  }
});

router.post("/adminLogin", function (req, res) {
  if (
    req.body.name == adminDb.username &&
    req.body.password == adminDb.password
  ) {
    req.session.adminLoggin = true;
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
  req.session.adminLoggin = false;
  adminLogin = false;
  res.redirect("/admin");
});

// user managerment
router.get("/users", verifyAdminLogin, (req, res) => {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  adminhelpers.getAllUsers().then((allUsersDetails) => {
    res.render("admin/userManagement", {
      admin: true,
      adminLogin: adminLogin,
      allUsersDetails,
    });
  });
});

// block user
router.get("/block/:id", verifyAdminLogin, (req, res) => {
  const proId = req.params.id;
  console.log(proId);
  adminhelpers.blockUser(proId).then((response) => {
    console.log(response);
    res.redirect("/admin/users");
  });
});

// unblock user
router.get("/unblock/:id", verifyAdminLogin, (req, res) => {
  const proId = req.params.id;
  adminhelpers.unblockUser(proId).then((response) => {
    res.redirect("/admin/users");
  });
});

// addproduct
router.get("/product", verifyAdminLogin, (req, res) => {
  productHelpers.getAllProduct().then((product) => {
    res.render("admin/view-product", {
      admin: true,
      adminLogin: adminLogin,
      product,
    });
  });
});

// add products

router.get("/add-product", verifyAdminLogin, (req, res) => {
  Promise.all([productHelpers.getAllCategory(),productHelpers.getAllSubCategory()]).then((response)=>{
    
     res.render("admin/add-product", { admin: true, adminLogin: adminLogin,category:response[0],subCategory:response[1]});
  })
 
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

// category management

router.get("/manage-category", verifyAdminLogin, (req, res) => {
  productHelpers.getAllCategory().then((category) => {
    res.render("admin/view-category", {
      admin: true,
      adminLogin: adminLogin,
      category,
    });
  });
});

router.get("/add-category", verifyAdminLogin, (req, res) => {
  res.render("admin/add-category", { admin: true, adminLogin: adminLogin });
});
router.post("/add-category", (req, res) => {
  productHelpers.addCategory(req.body).then((response) => {
    res.redirect("/admin/manage-category");
  });
});



// delete category

router.get("/delete-category/:id",(req,res)=>{
  const id = req.params.id;
  productHelpers.deleteCategory(id).then((response)=>{
  console.log(response)
    res.redirect("/admin/manage-category")
  })
})




// subcategory management

router.get("/mange-subCategory", verifyAdminLogin, (req, res) => {
  productHelpers.getAllSubCategory().then((subCategory) => {
    res.render("admin/view-sub-category", {
      admin: true,
      adminLogin: adminLogin,
      subCategory,
    });
  });
});

router.get("/add-subCategory", verifyAdminLogin, (req, res) => {
  res.render("admin/add-sub-category", { admin: true, adminLogin: adminLogin });
});
router.post("/add-subCategory", (req, res) => {
  productHelpers.addSubCategory(req.body).then((response) => {
    res.redirect("/admin/mange-subCategory");
  });
});



// delete sub category

router.get("/delete-subCategory/:id",(req,res)=>{
  const id = req.params.id;
  productHelpers.deleteSubCategory(id).then((response)=>{
  console.log(response)
  res.redirect("/admin/mange-subCategory")
  })
})




module.exports = router;

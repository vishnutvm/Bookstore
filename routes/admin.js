const express = require("express");
const adminhelpers = require("../helpers/admin-healpers");
const productHelpers = require("../helpers/product-helpers");
const userHealpers = require("../helpers/user-healpers");
const router = express.Router();
const excelJs = require('exceljs')


/* GET home page. */

// session middleware

// setting id and pass from env
const adminUsername = process.env.adminUsername;
const adminPassword = process.env.adminPassword;

const verifyAdminLogin = (req, res, next) => {
  // hard setting login to true for easy coding
  req.session.adminLoggin = true;

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

// setting admin id and pass localy
// const adminDb = {
//   username: "vishnu",
//   password: "1234",
// };

// admin page
router.get("/", verifyAdminLogin, async function (req, res, next) {

// // redering sales report 
const SalesReport = await adminhelpers.getMonthSalesReport()
const ProductReport = await adminhelpers.getProductReport()
const totalProducts = await adminhelpers.getTotalProducts()
const totalOrders = await adminhelpers.getTotalOrders()

let totalsales=0
SalesReport.forEach((doc)=>{
totalsales += doc.totalSalesAmount
})





  res.render("admin/dashbord", {
     admin: true,
      adminLogginPage: false,
      SalesReport,totalsales,ProductReport,totalProducts,totalOrders
     });
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
  if (req.body.name == adminUsername && req.body.password == adminPassword) {
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

// product
router.get("/product", verifyAdminLogin, (req, res) => {
  productHelpers.getAllProduct().then((product) => {
    res.render("admin/view-product", {
      admin: true,
      adminLogin: adminLogin,
      product,
    });
  });
});

// delete product

router.get("/DeleteProduct/:id", (req, res) => {
  const prodId = req.params.id;
  productHelpers.deleteProduct(prodId).then((response) => {
    console.log(response);
    res.redirect("/admin/product");
  });
});

router.get("/EditProduct/:id", (req, res) => {
  const prodId = req.params.id;
  Promise.all([
    productHelpers.getAllCategory(),
    productHelpers.getAllSubCategory(),
    productHelpers.getEditProduct(prodId),
  ]).then((response) => {
    console.log(response[2]);
    res.render("admin/edit-product", {
      admin: true,
      adminLogin,
      category: response[0],
      subCategory: response[1],
      editingProduct: response[2],
      modelJqury: true,
    });
  });
});

router.post("/EditProduct/:id", (req, res) => {
  const id = req.params.id;
  productHelpers.editProduct(req.body, id).then((response) => {
    res.redirect("/admin/product");
    if (req.files) {
      console.log("this have image");
      console.log(id);
      let image = req.files.image;

      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});

// add products

router.get("/add-product", verifyAdminLogin, (req, res) => {
  Promise.all([
    productHelpers.getAllCategory(),
    productHelpers.getAllSubCategory(),
  ]).then((response) => {
    res.render("admin/add-product", {
      admin: true,
      adminLogin: adminLogin,
      category: response[0],
      subCategory: response[1],
      modelJqury: true,
    });
  });
});

router.post("/add-product", (req, res) => {
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

router.get("/delete-category/:id", (req, res) => {
  const id = req.params.id;
  productHelpers.deleteCategory(id).then((response) => {
    console.log(response);
    res.redirect("/admin/manage-category");
  });
});

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

router.get("/delete-subCategory/:id", (req, res) => {
  const id = req.params.id;
  productHelpers.deleteSubCategory(id).then((response) => {
    console.log(response);
    res.redirect("/admin/mange-subCategory");
  });
});

// Orders listing

router.get("/orders", (req, res) => {

  adminhelpers.getAllOrders().then((allOrders) => {
    console.log("debut orders")
    console.log(allOrders)
    res.render("admin/vew-orders", {
      admin: true,
      adminLogin: adminLogin,
      allOrders,
    });
  });
});

router.get("/view-order-details/:id", async (req, res) => {
  orderId = req.params.id;
  // get total price

  await userHealpers.getOrderdProducts(orderId).then((orderDetails) => {
    console.log(orderDetails);
    (totalPrice = orderDetails[0].totalPrice),
      (deliveryDetails = orderDetails[0].deliveryDetails),
      (CurrentStatus = orderDetails[0].status);
    PaymentMethod = orderDetails[0].paymentMethod.toUpperCase();
    CurrentDate = orderDetails[0].date;
    console.log(PaymentMethod);
    paymentStatus = PaymentMethod == "COD" ? "pending" : "paid";

    res.render("admin/view-order-details", {
      admin: true,
      adminLogin: adminLogin,
      orderDetails,
      totalPrice,
      deliveryDetails,
      CurrentStatus,
      PaymentMethod,
      CurrentDate,
      paymentStatus,
    });
  });
});

// changing order status

router.get("/statusToPacking/:id", (req, res) => {
  console.log("packing is working");
  const orderId = req.params.id;
  adminhelpers.satusToPacking(orderId).then((response) => {
    console.log(response);
    res.redirect("/admin/orders");
  });
});

router.get("/statusToShipped/:id", (req, res) => {
  console.log("shippped is working");
  const orderId = req.params.id;
  adminhelpers.satusToShipped(orderId).then((response) => {
    console.log(response);
    res.redirect("/admin/orders");
  });
});
router.get("/statusToDeliverd/:id", (req, res) => {
  console.log("delivery is working");
  const orderId = req.params.id;
  adminhelpers.satusToDelivered(orderId).then((response) => {
    console.log(response);
    res.redirect("/admin/orders");
  });
});

router.get("/cancelOrder/:id", (req, res) => {
  const orderId = req.params.id;
  adminhelpers.cancelOrder(orderId).then((response) => {
    console.log(response);
    res.redirect("/admin/orders");
  });
});

router.get("/edit-page", async (req, res) => {
  const carousels = await adminhelpers.getCarousel();
  const homeCategory = await adminhelpers.getHomeCategory();
  const trendingProduct = await adminhelpers.getTrending();

  const AllCategory = await productHelpers.getAllCategory();
  const AllProductList = await productHelpers.getAllProduct();
  console.log(carousels);

  res.render("admin/edit", {
    admin: true,
    adminLogin: adminLogin,
    carousels,
    AllCategory,
    AllProductList,
    homeCategory,
    trendingProduct,
  });
});

router.get("/addcarousel", (req, res) => {
  res.render("admin/add-carousel", {
    admin: true,
    adminLogin: adminLogin,
    modelJqury: true,
  });
});

router.post("/addcarousel", (req, res) => {
  adminhelpers.addCarousel(req.body).then((response) => {
    const id = response.toString();

    if (req.files) {
      let image = req.files.image;
      console.log(image);
      image.mv("./public/carousel-images/" + id + ".jpg");
    }

    res.redirect("/admin/edit-page");
  });
});

// delete the caursol

router.get("/Delete-caursol/:id", (req, res) => {
  const caursolId = req.params.id;
  adminhelpers.deleteCaursol(caursolId).then((response) => {
    res.redirect("/admin/edit-page");
  });
});

// add category to home page by admin
router.post("/addCategoryToHome", (req, res) => {
  adminhelpers.addCategoryTohome(req.body).then((response) => {
    res.redirect("/admin/edit-page");
  });
});

router.post("/addTrendingProducts", (req, res) => {
  adminhelpers.addTrendingProducts(req.body).then((response) => {
    res.redirect("/admin/edit-page");
  });
});

router.get("/sales-report",async(req,res)=>{
 let SalesReport= await adminhelpers.getTotalSalesReport()

  console.log(SalesReport)
 res.render("admin/sales-report", {
  admin: true,
   adminLogginPage: false,
   SalesReport
  });


})

router.get("/export_to_excel",async(req,res)=>{
  let SalesReport= await adminhelpers.getTotalSalesReport()

   
  try{
    
    const workbook=new  excelJs.Workbook();

    const worksheet= workbook.addWorksheet("Sales Report")

    worksheet.columns = [
     {header:"S no.",key:"s_no"},
     {header:"OrderID",key:"_id"},
     {header:"User",key:"name"},
     {header:"Date",key:"date"},
     {header:"Products",key:"products"},
     {header:"Method",key:"paymentMethod"},
     {header:"status",key:"status"},
     {header:"Amount",key:"totalPrice"},

    ];
    let counter = 1;
    SalesReport.forEach((report)=>{
     report.s_no = counter;
     report.products="";
     report.name=report.users[0].name;
     report.product.forEach((eachProduct)=>{
      report.products += eachProduct.name+","
     })
     worksheet.addRow(report)
     counter++
    })

    worksheet.getRow(1).eachCell((cell) =>{
     cell.font = {bold:true};
    })
// console.log("finaly resolving the promic ")

res.header(
"Content-Type",
"application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet"
);
res.header("Content-Disposition",'attachment; filename=report.xlsx')

workbook.xlsx.write(res)
    
   }catch(err){
     console.log(err.message)
   }
})


// product offer management
router.get("/manage-productOffer", verifyAdminLogin, async(req, res) => {
  let offers =await adminhelpers.getAllOffers()
  res.render("admin/product-offer", {
    admin: true,
    adminLogin: adminLogin,
    offers
  });
});


// add product offer

router.get("/add-product_offer", verifyAdminLogin,async (req, res) => {

  const AllProductList = await productHelpers.getAllProductWithoutOffer();

  res.render("admin/add-product-offers", { admin: true,
     adminLogin: adminLogin,
     AllProductList
     });
});

router.post("/add-product_offer", (req, res) => {


  adminhelpers.addProductOffer(req.body).then((response) => {
    res.redirect("/admin/manage-productOffer");
  });


});

router.get("/delete-prod-offer/:id", (req, res) => {
  const offId = req.params.id;
  console.log(offId)
  adminhelpers.deleteOffer(offId).then((response) => {
    console.log(response);
    res.redirect("/admin/manage-productOffer");
  });
});


module.exports = router;

const express = require('express');
const router = express.Router();
/* GET home page. */

// adminlogg err
var adminLoggErr;
// setting admin id and pass
const adminDb={
  username:"vishnu",
  password:'1234'
}


// admin page
router.get('/', function(req, res, next) {
 res.redirect('/admin/adminLogin')
});


// admin loggin
router.get('/adminLogin',(req,res)=>{
  res.render('admin/login',{adminLoggErr:adminLoggErr,admin:true})
  adminLoggErr=false
})


router.post('/adminLogin',function (req,res){
  if(req.body.name == adminDb.username && req.body.password == adminDb.password){
    req.adminLoggined=true
    console.log("admin log success")
    res.render('admin/dashbord')
    
  }else{
    console.log('admin log false')
    adminLoggErr=true
    res.redirect('/admin')
    
  }
})


module.exports = router;



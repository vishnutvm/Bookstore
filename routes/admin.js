const express = require('express');
const router = express.Router();
/* GET home page. */

// adminlogg err
var adminLoggErr;
var session;
var adminLogin;

// setting admin id and pass
const adminDb={
  username:"vishnu",
  password:'1234'
}

// admin page
router.get('/', function(req, res, next) {
  session= req.session;
  if(session.adminid){
    res.render('admin/dashbord',{admin:true,adminLogin:adminLogin})
  }else{
    res.redirect('admin/adminLogin')
  }
});


// admin loggin
router.get('/adminLogin',(req,res)=>{
  if(session.adminid){
    res.redirect('/admin')
  }
  res.render('admin/login',{adminLoggErr:adminLoggErr,admin:true})

 

})


router.post('/adminLogin',function (req,res){
  if(req.body.name == adminDb.username && req.body.password == adminDb.password){
    session= req.session;
    session.adminid=req.body.name
    adminLogin=true
    console.log("admin log success")
   adminLoggErr=false

    res.redirect('/admin')
    
    
  }else{
    console.log('admin log false')
    adminLoggErr=true
    res.redirect('/admin')
    
  }
})
router.get('/adminLogout',(req,res)=>{
  console.log("admin loggout")
  req.session.adminid=null;
  adminLogin=false
  res.redirect('/admin')
})


module.exports = router;



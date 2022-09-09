const express = require('express');
const router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/login',{admin:true})

});





const adminDb={
  username:"vishnu",
  password:'1234'
}
router.post('/adminLogin',function (req,res){
  if(req.body.name == adminDb.username && req.body.password == adminDb.password){
    req.adminLoggined=true
    console.log("successs")
    res.render('admin/dashbord')
    
  }else{
 
    res.render('/',{adminLoggErr:true})
    
  }
})


module.exports = router;



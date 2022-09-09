
var express = require('express');
const userHealpers = require('../helpers/user-healpers');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users/view-product',{admin:false})
});


// user login
router.get('/user_signin',(req,res)=>{
  res.render('users/login')
})
router.post('/user_signin',(req,res)=>{
  userHealpers.doLogin(req.body).then((response)=>{
   if(response.status){
    res.redirect('/')
   }else{
    res.render('users/login',{logginErr:true})
    
   }
  })

})

// user register  
router.get('/user_registration',(req,res)=>{
res.render('users/register')
})

router.post('/user_registration',(req,res)=>{
userHealpers.doSignup(req.body).then((response)=>{

 res.redirect('/user_signin')
})
  
})






module.exports = router;

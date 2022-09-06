const { response } = require('express');
var express = require('express');
const userHealpers = require('../helpers/user-healpers');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users/view-product',{admin:false})
});

router.get('/user_signin',(req,res)=>{
  res.render('users/login')
})
router.post('/user_signin',(req,res)=>{
  userHealpers.doLogin(req.body).then((response)=>{
   if(response.status){
    res.redirect('/')
   }else{
    res.redirect('/user_signin')
   }
  })
})
router.get('/user_registration',(req,res)=>{
res.render('users/register')
})

router.post('/user_registration',(req,res)=>{
userHealpers.doSignup(req.body).then((response)=>{

  res.send(response)
})
  
})






module.exports = router;

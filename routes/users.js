
var express = require('express');
const userHealpers = require('../helpers/user-healpers');
var router = express.Router();

var session;
/* GET users listing. */
router.get('/', function(req, res, next) {
  session= req.session;
  if(session.userid){

  res.render('users/view-product',{admin:false,userid:session.userid})
  }else{
    res.redirect('/user_signin')
  }
});

router.get('/user_signin',(req,res)=>{
  if(session.userid){
   res.redirect('/')
  }
   res.render('users/login',{logginErr:req.session.logginErr})
   
   req.session.logginErr=false;
})

router.post('/user_signin',(req,res)=>{
  userHealpers.doLogin(req.body).then((response)=>{
   if(response.status){
    session = req.session;
    session.userid = req.body.email;
    console.log(req.session)
    res.redirect('/')
   }else{
    
     req.session.logginErr=true;
    res.redirect('/user_signin')
   }
  })

})
router.get('/user_logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
  

router.get('/user_registration',(req,res)=>{
res.render('users/register')
})

router.post('/user_registration',(req,res)=>{
userHealpers.doSignup(req.body).then((response)=>{
 res.redirect('/user_signin')
})

})






module.exports = router;

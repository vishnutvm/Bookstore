
var express = require('express');
const userHealpers = require('../helpers/user-healpers');
var router = express.Router();

var session;
var userLoggin;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
session=req.session
  if(session.userid){
    req.session.userLoggin= true
  res.render('users/view-product',{user:true,userLoggin:req.session.userLoggin})
 
  }else{
    res.redirect('/user_signin')
  }
});

router.get('/user_signin',(req,res)=>{
  session= req.session;
  if(session.userid){
   res.redirect('/')
  }
   res.render('users/login',{logginErr:req.session.logginErr})
   
   req.session.logginErr=false;
})

router.post('/user_signin',async(req,res)=>{
  await userHealpers.doLogin(req.body).then((response)=>{
   if(response.status){
    session = req.session;

    session.userid = req.body.email;
    console.log(session)

session.phone=response.user.phone
 userHealpers.sendOtp(response.user.phone)
    res.redirect('/otp')
   }else{
    
     req.session.logginErr=true;
    res.redirect('/user_signin')
   }
  })

})

// otp verification

router.get('/otp',(req,res)=>{
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  if(req.session.userLoggin){
    res.redirect('/')
  }else{
    res.render('users/otp',{phone:session.phone,otpErr:req.session.otpErr})
    req.session.otpErr=false;
  }


})
router.post('/verifyOtp',(req,res)=>{
  
  userHealpers.veriOtp(req.body.otpval,session.phone).then((verifi)=>{
    console.log(verifi)
    if(verifi){
      console.log("otp success")
      res.redirect('/')
      
    }else{
      console.log("otp failed");
      req.session.userid=null
      req.session.otpErr=true
      res.redirect('/otp')
    }
  })
})



router.get('/user_logout',(req,res)=>{
  req.session.userid=null;
  req.session.userLoggin= false
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

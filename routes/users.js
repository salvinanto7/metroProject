var express = require('express');
var router = express.Router();

const verifyLogin=(req,res,next)=>{
  if (req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {

  res.render('user/index',{admin:false});
});

router.get('/train',(req,res)=>{
  res.render('user/train',{admin:false})
});

router.get('/ticket',(req,res)=>{
  res.render('user/ticket',{admin:false})
});
router.get('/about',(req,res)=>{
  res.render('user/about',{admin:false})
});

router.get('/login',(req,res)=>{
  res.render('user/login',{admin:false})
  //if(req.session.loggedin){
  //  res.redirect('/');
  //}
  //else{
  //  res.render('user/login',{loginErr:req.session.loginErr});
  //  req.session.loginErr = false;
  //}
});

router.get('/signup',(req,res)=>{
  res.render('user/signup',{admin:false});
});

router.post('/signup',(req,res)=>{
  //console.log(req.body)
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true;
    req.session.user = response;
  })
});

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.loggedIn =true;
      req.session.user = response.user;
      res.redirect('/');
    }else{
      req.session.loginErr = "Invalid username or password";
      res.redirect('/login');
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;

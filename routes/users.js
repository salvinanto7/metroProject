var express = require('express');
var router = express.Router();

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



module.exports = router;

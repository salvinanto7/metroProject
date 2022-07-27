var express = require('express');
var router = express.Router();
//var userHelpers = require('./helpers/userHelpers');
var db = require('../db');
var bcrypt = require('bcrypt');
var mysql = require('mysql');

const verifyLogin=(req,res,next)=>{
  if (req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  let user = req.session.user
  let admin = req.session.admin
  let schedule_res
  let train_res
  let station_res
  if (admin){
    db.getConnection(async(err,connection)=>{
      const schedule = 'SELECT * FROM schedule';
      await connection.query(schedule,(err,result)=>{
        if(err){
          return console.error(err.message)
        }else{
          schedule_res =Object.values(JSON.parse(JSON.stringify(result)))
          //console.log(result)
          console.log(schedule_res)
        }
      })
      const train = 'SELECT * FROM train';
      await connection.query(train,(err,result)=>{
        if(err){
          return console.error(err.message)
        }else{
          train_res =Object.values(JSON.parse(JSON.stringify(result)))
          //console.log(result)
          console.log(train_res)
        }
      })
      const station = 'SELECT * FROM station';
      await connection.query(station,(err,result)=>{
        if(err){
          return console.error(err.message)
        }else{
          station_res = Object.values(JSON.parse(JSON.stringify(result)))
          //console.log(result)
          console.log(station_res)
        }
        res.render('admin/index',{admin,user,schedule_res:schedule_res,train_res:train_res,station_res:station_res})
        //console.log(station_res)
        //console.log(train_res)
      })
    })
    //console.log(schedule_res)
    //console.log(train_res)
    //console.log(station_res)
    
  }else{
    res.render('user/index',{admin,user});
  }
});

router.get('/train',(req,res)=>{
  res.render('user/train',{admin:false,user:req.session.user})
});

router.get('/ticket',(req,res)=>{
  res.render('user/ticket',{admin:false,user:req.session.user})
});
router.get('/about',(req,res)=>{
  res.render('user/about',{admin:false,user:req.session.user})
});
router.get('/contact',(req,res)=>{
  res.render('user/contact',{admin:false,user:req.session.user})
});

router.get('/login',(req,res)=>{
  //res.render('user/login',{admin:false})
  if(req.session.loggedIn){
    res.redirect('/');
  }
  else{
    res.render('user/login',{loginErr:req.session.loginErr});
    req.session.loginErr = false;
  }
});

router.get('/signup',(req,res)=>{
  res.render('user/signup',{admin:false});
});

//router.post('/signup',(req,res)=>{
//  //console.log(req.body)
//  userHelpers.doSignup(req.body).then((response)=>{
//    console.log(response);
//    //req.session.loggedIn=true;
//    //req.session.user = response;
//  })
//});

router.post("/signup", async (req,res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const age = req.body.age;
  const phone = req.body.phone;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(req.body.password,10);
  db.getConnection( async (err, connection) => { 
    if (err) throw (err) 
    const sqlSearch = "SELECT * FROM user WHERE email = ?"
    const search_query = mysql.format(sqlSearch,[email]) 
    const sqlInsert = "INSERT INTO user VALUES (?,?,?,?,?,?,?,0)"
    const insert_query = mysql.format(sqlInsert,[hashedPassword,firstName,lastName,age,phone,email,username])
   // ? will be replaced by values
   // ?? will be replaced by string 
    await connection.query (search_query, async (err, result) => {  if (err) throw (err)
     console.log("------> Search Results")
     console.log(result.length)  
     if (result.length != 0) {
     connection.release()
     console.log("------> User already exists")
     res.redirect('/')
    } 
    else {
     await connection.query (insert_query, (err, result)=> {   
      connection.release()   
      if (err) throw (err)
      console.log ("--------> Created new User")
      console.log(result.insertId)
      req.session.loggedIn = true;
      req.session.user = firstName;
      res.redirect('/login')
    })
   }}) //end of connection.query()
  }) //end of db.getConnection()
}) //end of app.post()


//router.post('/login',(req,res)=>{
//  userHelpers.doLogin(req.body).then((response)=>{
//    if (response.status){
//      req.session.loggedIn =true;
//      req.session.user = response.user;
//      res.redirect('/');
//    }else{
//      req.session.loginErr = "Invalid username or password";
//      res.redirect('/login');
//    }
//  })
//})

router.post('/login',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlsearch = "SELECT * FROM user WHERE email = ?";
    const search_query  = mysql.format(sqlsearch,[email]);

    await connection.query(search_query,async(err,result)=>{
      connection.release()
      if (err) throw(err)
      if (result.length==0){
        console.log("user does not exist");
        res.redirect('/login');
      }else{
        const dbPassword = result[0].password;
        const name = result[0].first_name;
        console.log(result)
        //console.log(password)
        //var test
        //test = await bcrypt.hash(password,10)
        //console.log(test)
        //if(password===dbPassword){
        if (bcrypt.compare(password,dbPassword)){
          console.log(email+ ' logged in successfully');
          req.session.loggedIn = true;
          req.session.user = name;
          if (result[0].isAdmin){
            req.session.admin = true;
          }else{
            req.session.admin = false;
          }
          res.redirect('/')
          //res.redirect('/')
        }else{
          console.log("password incorrect");
          res.send("password incorrect");
        }
      }
    })
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/login');
});




// admin routers 


router.get('/delete-schedule/:id',(req,res)=>{
  let scheduleId = req.params.id
  //console.log(scheduleId)
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'DELETE FROM schedule WHERE schedule.schedule_id = ?'
    const search_query = mysql.format(sqlSearch,[scheduleId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
        console.log('schedule deleted '+ scheduleId)
        res.redirect('/')
      }
    })
  })
})

router.get('/delete-station/:id',(req,res)=>{
  let stationId = req.params.id
  //console.log(stationId)
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'DELETE FROM station WHERE station.station_code = ?'
    const search_query = mysql.format(sqlSearch,[stationId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
        //console.log('station deleted '+ scheduleId)
        res.redirect('/')
      }
    })
  })
})

router.get('/delete-train/:id',(req,res)=>{
  let trainId = req.params.id
  //console.log(stationId)
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'DELETE FROM train WHERE train.train_no = ?'
    const search_query = mysql.format(sqlSearch,[trainId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
        //console.log('train deleted '+ scheduleId)
        res.redirect('/')
      }
    })
  })
})


module.exports = router;

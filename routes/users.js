var express = require("express");
var router = express.Router();
//var userHelpers = require('./helpers/userHelpers');
var db = require("../db");
var bcrypt = require("bcrypt");
var mysql = require("mysql");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET users listing. */
router.get("/", async function (req, res, next) {
  var user = req.session.user;
  var admin = req.session.admin;

  var schedule_res = "";
  var train_res = "";
  var station_res = "";
  if (admin) {
    db.getConnection((err, connection) => {
      const schedule = "SELECT * FROM schedule";
      connection.query(schedule, (err, result) => {
        if (err) {
          return console.error(err.message);
        } else {
          schedule_res = Object.values(JSON.parse(JSON.stringify(result)));
          //console.log(result)
          //console.log(schedule_res)
        }
      });
      const train = "SELECT * FROM train";
      connection.query(train, (err, result) => {
        if (err) {
          return console.error(err.message);
        } else {
          train_res = Object.values(JSON.parse(JSON.stringify(result)));
          //console.log(result)
          console.log(train_res);
        }
      });
      const station = "SELECT * FROM station";
      connection.query(station, (err, result) => {
        if (err) {
          return console.error(err.message);
        } else {
          station_res = Object.values(JSON.parse(JSON.stringify(result)));
          //console.log(result)
          console.log(station_res);
        }
        res.render("admin/index", {
          admin,
          user,
          schedule_res: schedule_res,
          train_res: train_res,
          station_res: station_res,
        });
        //console.log(station_res)
        //console.log(train_res)
      });
    });

    //console.log(train_res)
    //console.log(station_res)
  } else {
    res.render("user/index", { admin, user });
  }

  // console.log(station_res);
  // console.log(admin);
});

router.get("/train", async (req, res) => {
  var admin = req.session.admin;
  var user = req.session.user;
  console.log(req.body);
  var station_res;
  db.getConnection((err, connection) => {
    const station = "SELECT * FROM station;";
    connection.query(station, (err, result) => {
      if (err) {
        return console.error(err.message);
      } else {
        station_res = Object.values(JSON.parse(JSON.stringify(result)));
        //console.log(result)
        console.log(station_res);
      }
      res.render("user/train", { admin, user, station_res: station_res });
      //console.log(station_res)
      //console.log(train_res)
    });
  });

  // res.render("user/train", { admin: false, user: req.session.user });
});
router.post("/search", async (req, res) => {
  var admin = req.session.admin;
  var user = req.session.user;
  var station;
  var schedule_list = [];
  var schedule_res;

  db.getConnection((err, connection) => {
    var source = parseInt(req.body.source, 10);
    var destination = parseInt(req.body.destination, 10);
    if (source > destination) {
      station = "SELECT * FROM schedule where source>=? and destination<=?;";
    } else {
      station = "SELECT * FROM schedule where source<=? and destination>=?;";
    }
    station = mysql.format(station, [source, destination]);
    connection.query(station, (err, result) => {
      if (err) {
        return console.error(err.message);
      } else {
        var sourcename;
        var destinationname;
        schedule_res = Object.values(JSON.parse(JSON.stringify(result)));
        schedule_res.forEach((element) => {
          connection.query(
            "select station_name from station where station_code=?",
            [element.source],
            async (err, station) => {
              sourcename = Object.values(
                JSON.parse(JSON.stringify(station[0]))
              );
            }
          );
          connection.query(
            "select station_name from station where station_code=?",
            [element.destination],
            async (err, station) => {
              destinationname = Object.values(
                JSON.parse(JSON.stringify(station[0]))
              );

              connection.release();
              schedule_list.push({
                ...element,
                sourcename: sourcename[0],
                destinationname: destinationname[0],
              });
              console.log("search query");
              console.log(schedule_list);
              //console.log(element)
            }
          );
          // console.log("dummy data");
          // console.log(sourcename);
          // console.log(destinationname);
          // console.log(element);
        });
        res.render("user/schedules", {
          admin,
          user,
          schedule_res: schedule_list,
        });
      }

      //console.log(train_res)
    });
  });

  // res.render("user/train", { admin: false, user: req.session.user });
});

router.get("/ticket", (req, res) => {
  res.render("user/ticket", { admin: false, user: req.session.user });
});
router.get("/about", (req, res) => {
  res.render("user/about", { admin: false, user: req.session.user });
});
router.get("/contact", (req, res) => {
  res.render("user/contact", { admin: false, user: req.session.user });
});
<<<<<<< HEAD

router.get("/login", (req, res) => {
=======
router.get('/no-access',(req,res)=>{
  res.render('user/no-access')
})
router.get('/login',(req,res)=>{
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b
  //res.render('user/login',{admin:false})
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup", { admin: false });
});

//router.post('/signup',(req,res)=>{
//  //console.log(req.body)
//  userHelpers.doSignup(req.body).then((response)=>{
//    console.log(response);
//    //req.session.loggedIn=true;
//    //req.session.user = response;
//  })
//});

router.post("/signup", async (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const age = req.body.age;
  const phone = req.body.phone;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM user WHERE email = ?";
    const search_query = mysql.format(sqlSearch, [email]);
    const sqlInsert = "INSERT INTO user VALUES (?,?,?,?,?,?,?,0)";
    const insert_query = mysql.format(sqlInsert, [
      hashedPassword,
      firstName,
      lastName,
      age,
      phone,
      email,
      username,
    ]);
    // ? will be replaced by values
    // ?? will be replaced by string
    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);
      if (result.length != 0) {
        connection.release();
        console.log("------> User already exists");
        res.redirect("/");
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("--------> Created new User");
          console.log(result.insertId);
          req.session.loggedIn = true;
          req.session.user = firstName;
          res.redirect("/login");
        });
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
}); //end of app.post()

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

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlsearch = "SELECT * FROM user WHERE email = ?";
    const search_query = mysql.format(sqlsearch, [email]);

    await connection.query(search_query, async (err, result) => {
      connection.release();
      if (err) throw err;
      if (result.length == 0) {
        console.log("user does not exist");
        res.redirect("/login");
      } else {
        const dbPassword = result[0].password;
        const name = result[0].first_name;
        console.log(result);
        //console.log(password)
        //var test
        //test = await bcrypt.hash(password,10)
        //console.log(test)
        //if(password===dbPassword){
        if (bcrypt.compare(password, dbPassword)) {
          console.log(email + " logged in successfully");
          req.session.loggedIn = true;
          req.session.user = name;
          if (result[0].isAdmin) {
            req.session.admin = true;
          } else {
            req.session.admin = false;
          }
          res.redirect("/");
          //res.redirect('/')
        } else {
          console.log("password incorrect");
          res.send("password incorrect");
        }
      }
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// admin routers

router.get("/delete-schedule/:id", (req, res) => {
  let scheduleId = req.params.id;
  //console.log(scheduleId)
<<<<<<< HEAD
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "DELETE FROM schedule WHERE schedule.schedule_id = ?";
    const search_query = mysql.format(sqlSearch, [scheduleId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("schedule deleted " + scheduleId);
        res.redirect("/");
      }
    });
  });
});
=======
  //console.log(req.session.id)
  //console.log(req.session.user)
  if(req.session.admin){
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
}else{
  res.redirect('../no-access')
}
})
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b

router.get("/delete-station/:id", (req, res) => {
  let stationId = req.params.id;
  //console.log(stationId)
<<<<<<< HEAD
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "DELETE FROM station WHERE station.station_code = ?";
    const search_query = mysql.format(sqlSearch, [stationId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
=======
  if(req.session.admin){
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'DELETE FROM station WHERE station.station_code = ?'
    const search_query = mysql.format(sqlSearch,[stationId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b
        //console.log('station deleted '+ scheduleId)
        res.redirect("/");
      }
<<<<<<< HEAD
    });
  });
});
=======
    })
  })}else{
    res.redirect('../no-access')
  }
})
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b

router.get("/delete-train/:id", (req, res) => {
  let trainId = req.params.id;
  //console.log(stationId)
<<<<<<< HEAD
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "DELETE FROM train WHERE train.train_no = ?";
    const search_query = mysql.format(sqlSearch, [trainId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
=======
  if(req.session.admin){
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'DELETE FROM train WHERE train.train_no = ?'
    const search_query = mysql.format(sqlSearch,[trainId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b
        //console.log('train deleted '+ scheduleId)
        res.redirect("/");
      }
<<<<<<< HEAD
    });
  });
});
=======
    })
  })}else{
    res.redirect('../no-access')
  }
})
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b

router.get("/edit-train/:id", (req, res) => {
  let trainId = req.params.id;
  //console.log(stationId)
<<<<<<< HEAD
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM train WHERE train.train_no = ?";
    const search_query = mysql.format(sqlSearch, [trainId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
=======
  if(req.session.admin){
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'SELECT * FROM train WHERE train.train_no = ?'
    const search_query = mysql.format(sqlSearch,[trainId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b
        //console.log('train deleted '+ scheduleId)
        let trainData = Object.values(JSON.parse(JSON.stringify(result)));
        console.log(trainData[0]);
        res.render("admin/edit-train", { train: trainData[0] });
      }
<<<<<<< HEAD
    });
  });
});
router.get("/edit-schedule/:id", (req, res) => {
  let scheduleId = req.params.id;
  //console.log(stationId)
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM schedule WHERE schedule.schedule_id = ?";
    const search_query = mysql.format(sqlSearch, [scheduleId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
=======
    })
  })}else{
    res.redirect('../no-access')
  }
})
router.get('/edit-schedule/:id',(req,res)=>{
  let scheduleId = req.params.id
  //console.log(stationId)
  if(req.session.admin){
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'SELECT * FROM schedule WHERE schedule.schedule_id = ?'
    const search_query = mysql.format(sqlSearch,[scheduleId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b
        //console.log('train deleted '+ scheduleId)
        let scheduleData = Object.values(JSON.parse(JSON.stringify(result)));
        //console.log(scheduleData[0])
        res.render("admin/edit-schedule", { schedule: scheduleData[0] });
      }
<<<<<<< HEAD
    });
  });
});
router.get("/edit-station/:id", (req, res) => {
  let stationId = req.params.id;
  //console.log(stationId)
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM station WHERE station.station_code = ?";
    const search_query = mysql.format(sqlSearch, [stationId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
=======
    })
  })}else{
    res.redirect('../no-access')
  }
})
router.get('/edit-station/:id',(req,res)=>{
  let stationId = req.params.id
  //console.log(stationId)
  if(req.session.admin){
  db.getConnection(async(err,connection)=>{
    if (err) throw(err)
    const sqlSearch = 'SELECT * FROM station WHERE station.station_code = ?'
    const search_query = mysql.format(sqlSearch,[stationId])
    await connection.query(search_query,(err,result)=>{
      if(err){
        console.log(err)
      }else{
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b
        //console.log('train deleted '+ scheduleId)
        let stationData = Object.values(JSON.parse(JSON.stringify(result)));
        console.log(stationData[0]);
        res.render("admin/edit-station", { station: stationData[0] });
      }
<<<<<<< HEAD
    });
  });
});
=======
    })
  })}else{
    res.redirect('../no-access')
  }
})
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b

router.post("/edit-station/:id", (req, res) => {
  let stationId = req.params.id;
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const stationCode = req.body.station_code;
    const stationName = req.body.station_name;
    const sqlSearch =
      "UPDATE station SET station_code = ? WHERE station.station_code = ?";
    const search_query = mysql.format(sqlSearch, [stationCode, stationId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("station code updated");
      }
    });
    const newsqlSearch =
      "UPDATE station SET station_name = ? WHERE station.station_code = ?";
    const newsearch_query = mysql.format(newsqlSearch, [
      stationName,
      stationCode,
    ]);
    await connection.query(newsearch_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("station name updated");
        res.redirect("/");
      }
    });
  });
});

router.post("/edit-train/:id", (req, res) => {
  let trainId = req.params.id;
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const trainCode = req.body.train_no;
    const trainName = req.body.train_name;
    const sqlSearch = "UPDATE train SET train_no = ? WHERE train.train_no = ?";
    const search_query = mysql.format(sqlSearch, [trainCode, trainId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("train code updated");
      }
    });
    const newsqlSearch =
      "UPDATE train SET train_name = ? WHERE train.train_no = ?";
    const newsearch_query = mysql.format(newsqlSearch, [trainName, trainCode]);
    await connection.query(newsearch_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("train name updated");
        res.redirect("/");
      }
    });
  });
});

router.post("/edit-schedule/:id", (req, res) => {
  let scheduleId = req.params.id;
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const scheduleCode = req.body.schedule_id;
    const trainId = req.body.train_id;
    const source = req.body.source;
    const destination = req.body.destination;
    const departure = req.body.departure_time;
    const arrival = req.body.arrival_time;
    const sqlSearch =
      "UPDATE schedule SET schedule_id = ? WHERE schedule.schedule_id = ?";
    const search_query = mysql.format(sqlSearch, [scheduleCode, scheduleId]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log('train code updated')
      }
    });
    const sqlSearch2 =
      "UPDATE schedule SET train_id = ? WHERE schedule.schedule_id = ?";
    const search_query2 = mysql.format(sqlSearch2, [trainId, scheduleCode]);
    await connection.query(search_query2, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train code updated')
      }
    });
    const sqlSearch3 =
      "UPDATE schedule SET source = ? WHERE schedule.schedule_id = ?";
    const search_query3 = mysql.format(sqlSearch3, [source, scheduleCode]);
    await connection.query(search_query3, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train code updated')
      }
    });
    const sqlSearch4 =
      "UPDATE schedule SET destination = ? WHERE schedule.schedule_id = ?";
    const search_query4 = mysql.format(sqlSearch4, [destination, scheduleCode]);
    await connection.query(search_query4, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train code updated')
      }
    });
    const sqlSearch5 =
      "UPDATE schedule SET departure_time = ? WHERE schedule.schedule_id = ?";
    const search_query5 = mysql.format(sqlSearch5, [departure, scheduleCode]);
    await connection.query(search_query5, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train code updated')
      }
    });
    const sqlSearch6 =
      "UPDATE schedule SET arrival_time = ? WHERE schedule.schedule_id = ?";
    const search_query6 = mysql.format(sqlSearch6, [arrival, scheduleCode]);
    await connection.query(search_query6, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train code updated')
        res.redirect("/");
      }
    });
  });
});

<<<<<<< HEAD
router.get("/add-train", (req, res) => {
  res.render("admin/add-train");
});
router.get("/add-schedule", (req, res) => {
  res.render("admin/add-schedule");
});
router.get("/add-station", (req, res) => {
  res.render("admin/add-station");
});
=======
router.get('/add-train',(req,res)=>{
  if(req.session.admin){
  res.render('admin/add-train');
  }else{res.redirect('../no-access')}
})
router.get('/add-schedule',(req,res)=>{
  if(req.session.admin){
    res.render('admin/add-schedule');
    }else{res.redirect('../no-access')}
})
router.get('/add-station',(req,res)=>{
  if(req.session.admin){
    res.render('admin/add-station');
    }else{res.redirect('../no-access')}
})
>>>>>>> 6ca666cc49118f6774cb2599853b6398ddce080b

router.post("/add-train", (req, res) => {
  let trainId = req.body.train_no;
  let trainName = req.body.train_name;
  console.log(trainId);
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "INSERT INTO train (train_no,train_name) VALUES (?,?)";
    const search_query = mysql.format(sqlSearch, [trainId, trainName]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train deleted '+ scheduleId)
        res.redirect("/");
      }
    });
  });
});
router.post("/add-station", (req, res) => {
  let stationId = req.body.station_code;
  let stationName = req.body.station_name;
  //console.log(trainId)
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch =
      "INSERT INTO station (station_code,station_name) VALUES (?,?)";
    const search_query = mysql.format(sqlSearch, [stationId, stationName]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train deleted '+ scheduleId)
        res.redirect("/");
      }
    });
  });
});
router.post("/add-schedule", (req, res) => {
  console.log("inside add schedule");
  let scheduleId = req.body.schedule_id;
  let trainId = req.body.train_id;
  let source = req.body.source;
  let destination = req.body.destination;
  let departure = req.body.departure_time;
  let arrival = req.body.arrival_time;
  //console.log(trainId)
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch =
      "INSERT INTO schedule (schedule_id,train_id,source,destination,departure_time,arrival_time) VALUES (?,?,?,?,?,?)";
    const search_query = mysql.format(sqlSearch, [
      scheduleId,
      trainId,
      source,
      destination,
      departure,
      arrival,
    ]);
    await connection.query(search_query, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //console.log('train deleted '+ scheduleId)
        res.redirect("/");
      }
    });
  });
});
module.exports = router;

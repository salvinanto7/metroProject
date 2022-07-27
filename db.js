var mysql      = require('mysql');
const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'metro_yathra'
  })
   pool.getConnection((err, connection) => {
     if(err) throw err
     console.log('connected as id ' + connection.threadId)
//     connection.query('SELECT * from train', (err, rows) => {
//         connection.release() // return the connection to pool

//         if (!err) {
//             console.log(rows)
            
//         } else {
//             console.log(err)
//         }

//         // if(err) throw err
//         console.log('The data from train table are: \n', rows)
//     })
 })
  module.exports=pool;
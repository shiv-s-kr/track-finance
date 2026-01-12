const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
   host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
    waitForConnections: true,
    enableKeepAlive: true,
});

// db.connect(err => {
//     if (err) throw err;
//     console.log('MySQL Connected');
// });

module.exports = {db};

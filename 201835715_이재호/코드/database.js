const mysql = require('mysql')
const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "jaeho",
    password: "1324mm55",
    database: "user_database"
})

module.exports = pool
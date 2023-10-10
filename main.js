const express = require('express')
const mysql = require('mysql')

const app = express();

app.use("/scripts", express.static(__dirname+"/scripts"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())


const pool = mysql.createPool({
    host: 'localhost',
    user:  'root',
    password: '',
    database: 'ums'
})




//const host = "localhost";


app.listen(3000, ()=> {
    console.log("누군가 연락했다");
});

// 처리해주는 함수
app.get('/', (req, res) => {
    res.sendStatus(404)
    //res.sendFile(__dirname+"/pages/index.html");
})

app.get('/about', (req, res) => {
    res.sendFile(__dirname+"/pages/about.html");
})

app.get('/signup', (req, res) => {
    res.sendFile(__dirname+"/pages/signup.html");
})

app.post("/process/signup", (req, res) => {
    
    pool.getConnection((err, conn) => {
        if(err) throw err
        const params = req.body
        const username = params.username
        const pwd = params.pwd
        const email = params.email
        const gender = params.gender

        console.log("before query!!", username,pwd,email,gender)
        
        
        const exec = conn.query('INSERT INTO users (username, pwd, email, gender) VALUES (?, password(?), ?, ?)', [username, pwd, email, gender,'',''], (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(!err) {
                res.send(`User with record ID has been added`)
            }
            else {
                console.log(`The data from the user table are:11 \n`, rows)
            }
        })

        
    })
})
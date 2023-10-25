const express = require('express')
const app = express()
const mysql = require('mysql')

/**
 * Install EJS and then include the following in your code
 */
const ejs = require('ejs')

app.use("/scripts", express.static(__dirname+"/scripts"))
app.use("/assets", express.static(__dirname+"/pages/assets/"))
app.use(express.urlencoded({extended: true}))


app.set("view engine", "ejs")
app.set("views", "./views")

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "ums",
    connectionLimit: 10,
})

app.listen(8080, ()=> {
    console.log("connection established")
})

app.get("/", (req, res)=>{
    console.log(__dirname)
    res.render('index')
})

app.get("/about", (req, res)=>{
    res.render('about')
})

app.get("/contact", (req, res)=>{
    res.render('contact')
})

app.get("/signup", (req, res)=>{
    res.render('signup')
})



app.get("/users", (req, res)=>{
    pool.getConnection((err, conn) =>{
        if(err) throw err

        const exec = conn.query('Select * from users', (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.render('users', {data: rows})
            }
        })
    })
    
    
})


app.get("/showusers", (req, res) => {
    /**
     * 
     */

    pool.getConnection((err, conn) => {
        const exec = conn.query('SELECT * FROM users', (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(!err) {
                res.json({rows})
            }
            else {
                console.log(`The data from the user table are:11 \n`, rows)
            }
        })
    })
})


app.get("/users/:id/delete", (req, res) => {
    /**
     * 
     */

    const id = req.params.id

    pool.getConnection((err, conn) => {
        const exec = conn.query('DELETE from users WHERE id = ?', [id], (err, rows) => {
            
            console.log('SQL', exec.sql)
            if(err) {
                res.json({"status":"Error"})
            }
            else {
                conn.release()
                res.json({"status":"Success", "message":"User deleted"})
               
    
                
            }
        })
    })
    

    
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

app.get("/delete/:id", (req, res)=>{
    const id = req.params.id
    console.log(id)
    pool.getConnection((err, conn) =>{
        if(err) throw err

        const exec = conn.query('DELETE from users WHERE id = ?', [id], (err, rows) => {
            
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error Deleting the data')
            }
            else {
                conn.release()
                res.redirect('/users')

               

                
            }
        })
    })
    
    
})




/**
 * Creating Backend API 
 */

app.get("/api/users", (req, res)=>{
    pool.getConnection((err, conn) =>{
        if(err) throw err

        const exec = conn.query('Select * from users', (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.json({rows})
            }
        })
    })
    
    
})


/** Project Management */

/** Insert Project */

app.get("/addproject", (req, res)=>{
    res.render('project')
})

app.post("/process/project", (req, res) => {
    
    pool.getConnection((err, conn) => {
        if(err) throw err
        const params = req.body
        const title = params.title
        const desc = params.desc
        const type = params.type
        

        
        
        const exec = conn.query('INSERT INTO projects (title, description, type) VALUES (?, ?, ?)', [title, desc, type], (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(!err) {
                res.redirect('/projects')
            }
            else {
                console.log(`The data from the user table are:11 \n`, rows)
            }
        })

        
    })
})

app.get("/projects", (req, res)=>{
    pool.getConnection((err, conn) =>{
        if(err) throw err

        const exec = conn.query('Select * from projects', (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.render('projects', {data: rows})
            }
        })
    })
    
    
})

app.get("/project/:id/delete", (req, res)=>{
    const id = req.params.id
    console.log(id)
    pool.getConnection((err, conn) =>{
        if(err) throw err

        const exec = conn.query('DELETE from projects WHERE id = ?', [id], (err, rows) => {
            
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error Deleting the data')
            }
            else {
                conn.release()
                res.redirect('/projects')

               

                
            }
        })
    })
    
    
})
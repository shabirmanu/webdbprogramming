const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const mysql = require('mysql')
const i18n = require('i18n')

const flash = require('connect-flash')

app.use(cookieParser())
app.use(flash())
var session = require('express-session')
/**
 * Session configuration
 */

/**
 * Configure i18n module
 */

i18n.configure({
    locales:['en','ko'],
    directory: __dirname+'/locales',
    defaultLocale:'en',
    cookie:'lang',
    objectNotation:true,
})

app.use(i18n.init)

// Populates req.session
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'keyboard cat'
  }));

/**
 * Install EJS and then include the following in your code
 */
const ejs = require('ejs')

/**
 * Login Check
 */
function requireLogin(req, res, next){
    if(req.session.username) {
        next()
    }
    else {
        req.flash('error', 'You have to login first!');
        res.redirect("/login")
    }
}



/**
 * Store data in res local
 */

app.use((req, res, next) => {
    res.locals.username = req.session.username || null;
    if(req.session.username) {
        res.locals.role = req.session.role
        console.log("role")
        console.log(res.locals.role)
    }
    next()
})


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


/**
 * Language Routes
 */
app.get('/lang/:locale', (req, res) => {
    const locale = req.params.locale;
    console.log('local ='+locale)
    res.cookie('lang', locale);
    res.redirect('back'); // Redirect back to the previous page or use a specific URL
  });

app.get("/", (req, res)=>{
    console.log(__dirname)
    res.render('index', {
        welcome: res.__('welcome'),
        intro: res.__('intro'),
        job: res.__('job')
    })
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

/**
 * Login Route
 */
app.get("/login", (req, res)=>{
    
    res.render('signin')
})



app.get("/users", requireLogin, (req, res)=>{
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

app.get("/logout",(req, res) => {
    req.session.destroy()
    res.redirect("/")
})


app.post("/process/signin", (req, res) => {
    
    pool.getConnection((err, conn) => {
        if(err) throw err
        const username = req.body.username
        const pwd = req.body.pwd

        console.log("before SELECT query!!", username,pwd)
        
        
        const exec = conn.query('SELECT * FROM users where username = ? AND pwd = password(?)', [username, pwd], (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(!err) {
                if(rows.length > 0) {
                    req.session.username = rows[0].username
                    req.session.role = rows[0].role
                    console.log("session info")
                    console.log(req.session.username)
                }
                res.redirect("/")
            }
            else {
                console.log(`The data from the user table are:11 \n`, rows)
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
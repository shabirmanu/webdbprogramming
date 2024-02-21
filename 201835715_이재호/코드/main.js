const express = require('express')
const session = require('express-session')
const app = express()
const router = require('./route')
const pool = require('./database')

/**
 * Install EJS and then include the following in your code
 */
const ejs = require('ejs')

app.use("/scripts", express.static(__dirname+"/scripts"))
app.use("/assets", express.static(__dirname+"/pages/assets/"))
app.use(express.urlencoded({extended: true}))
app.use(express.json());


app.use(
  session({
      secret: 'loginSession',
      resave: true,
      saveUninitialized: true,
  })
);

app.use('/', router)

app.set("view engine", "ejs")
app.set("views", "./views")

app.listen(8080, ()=> {
    console.log("connection established")
})

app.get("/", (req, res)=>{
    if (req.session.user) {
      res.render('index', { userName: req.session.user.name })
    } else {
      res.render('index', { userName: '' })
    }
})

app.get("/about", (req, res)=>{
    res.render('about')
})

// router.post('/signin'), (req, res) => {
//     const id = req.body.id
//     const password = req.body.password

//     const selectQuery = 'SELECT name, id, password FROM index_table WHERE id = ? AND password = ?'
    
//     pool.query(selectQuery, [id, password], (err, results) => {
//       if (err) {
//         console.error('SELECT 쿼리 실행 중 오류:', err);
//         return res.status(500).send('오류');
//       }

//       if (!isEmpty(results)) {
//         res.status(200).json({ success: true });
//       } else {
//         res.status(500).send('회원 정보가 존재하지 않습니다.');
//       }
//     });
// }

// router.post('/signup'), (req, res) => {
//     const name = req.body.name
//     const id = req.body.id
//     const password = req.body.password

//     const selectQuery = 'SELECT id FROM index_table WHERE id = ?'

//     pool.query(selectQuery, [id], (err, results) => {
//         if (err) {
//           console.log('req.body: ' + req.body);
//           console.log('res.body: ' + res.body);
//           console.error('SELECT 쿼리 실행 중 오류:', err);
//           return res.status(500).send('오류가 발생했습니다.');
//         }
        
//         if (isEmpty(results)) {
//             const insertQuery = 'INSERT INTO index_table (name, id, password) VALUES (?, ?, ?)'
    
//             pool.query(insertQuery, [name, id, password], (err, results) => {
//               if (err) {
//                 console.log('req.body: ' + req.body);
//                 console.log('res.body: ' + res.body);
//                 console.error('INSERT 쿼리 실행 중 오류:', err);
//                 return res.status(500).send('오류가 발생했습니다.');
//               }
//               res.status(200).json({ success: true });
//             });
//         }
//       });
// }

app.get("/contact", (req, res)=>{
    const query = 'SELECT id, name, message, password FROM contact_table';
    
    pool.query(query, (err, results) => {
      if (err) {
        console.error('SELECT 쿼리 실행 중 오류:', err);
        return res.status(500).send('오류');
      }
      
      res.render('contact.ejs', {
          data: results.sort((a, b) => b.id - a.id),
      });
    });
})

app.post("/contact", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const message = req.body.message;
    const insertQuery = 'INSERT INTO contact_table (name, email, password, message) VALUES (?, ?, ?, ?)';

    pool.query(insertQuery, [name, email, password, message], (err, rows) => {
        if (!err) {
            console.log('insert succeed')
            res.status(200).json({ success: true });
        } else {
            console.log("insert failed: " + err)
            res.status(500).send('오류가 발생했습니다.');
        }
    })
})

app.put("/contact", (req, res) => {
    const id = req.body.id
    const message = req.body.message

    const updateQuery = 'UPDATE contact_table SET message = ? WHERE id = ?'
    
    pool.query(updateQuery, [message, id], (err, results) => {
      if (err) {
        console.error('UPDATE 쿼리 실행 중 오류:', err);
        return res.status(500).send('오류');
      }
      res.status(200).json({ success: true });
    });
})

app.delete("/contact", (req, res) => {
    const id = req.body.id
    const deleteQuery = 'DELETE FROM contact_table WHERE id = ?'

    pool.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.log('req.body: ' + req.body);
        console.log('res.body: ' + res.body);
        console.error('DELETE 쿼리 실행 중 오류:', err);
        return res.status(500).send('오류가 발생했습니다.');
      }
      res.status(200).json({ success: true });
    });
})

// app.get("/users", (req, res)=>{
//     pool.getConnection((err, conn) =>{
//         if(err) throw err

//         const exec = conn.query('Select * from users', (err, rows) => {
//             conn.release()
//             console.log('SQL', exec.sql)
//             if(err) {
//                 res.status(500).send('Error retreiving the data')
//             }
//             else {
//                 res.render('users', {data: rows})
//             }
//         })
//     })
// })

// app.get('/contact', (req, res) => {
//     const query = 'SELECT id, name, message FROM contact_table';
    
//     db.query(query, (err, results) => {
//       if (err) {
//         console.error('SELECT 쿼리 실행 중 오류:', err);
//         return res.status(500).send('오류');
//       }
  
//       res.render('contact_table.ejs', { data: results });
//     });
// });


// app.get("/showusers", (req, res) => {
//     /**
//      * 
//      */

//     pool.getConnection((err, conn) => {
//         const exec = conn.query('SELECT * FROM users', (err, rows) => {
//             conn.release()
//             console.log('SQL', exec.sql)
//             if(!err) {
//                 res.json({rows})
//             }
//             else {
//                 console.log(`The data from the user table are:11 \n`, rows)
//             }
//         })
//     })
// })


// app.get("/users/:id/delete", (req, res) => {
//     /**
//      * 
//      */

//     const id = req.params.id

//     pool.getConnection((err, conn) => {
//         const exec = conn.query('DELETE from users WHERE id = ?', [id], (err, rows) => {
            
//             console.log('SQL', exec.sql)
//             if(err) {
//                 res.json({"status":"Error"})
//             }
//             else {
//                 conn.release()
//                 res.json({"status":"Success", "message":"User deleted"})
               
    
                
//             }
//         })
//     })
    

    
// })



// app.post("/process/signup", (req, res) => {
    
//     pool.getConnection((err, conn) => {
//         if(err) throw err
//         const params = req.body
//         const username = params.username
//         const pwd = params.pwd
//         const email = params.email
//         const gender = params.gender

//         console.log("before query!!", username,pwd,email,gender)
        
        
//         const exec = conn.query('INSERT INTO users (username, pwd, email, gender) VALUES (?, password(?), ?, ?)', [username, pwd, email, gender,'',''], (err, rows) => {
//             conn.release()
//             console.log('SQL', exec.sql)
//             if(!err) {
//                 res.send(`User with record ID has been added`)
//             }
//             else {
//                 console.log(`The data from the user table are:11 \n`, rows)
//             }
//         })

        
//     })
// })

// app.get("/delete/:id", (req, res)=>{
//     const id = req.params.id
//     console.log(id)
//     pool.getConnection((err, conn) =>{
//         if(err) throw err

//         const exec = conn.query('DELETE from users WHERE id = ?', [id], (err, rows) => {
            
//             console.log('SQL', exec.sql)
//             if(err) {
//                 res.status(500).send('Error Deleting the data')
//             }
//             else {
//                 conn.release()
//                 res.redirect('/users')

               

                
//             }
//         })
//     })
    
    
// })




// /**
//  * Creating Backend API 
//  */

// app.get("/api/users", (req, res)=>{
//     pool.getConnection((err, conn) =>{
//         if(err) throw err

//         const exec = conn.query('Select * from users', (err, rows) => {
//             conn.release()
//             console.log('SQL', exec.sql)
//             if(err) {
//                 res.status(500).send('Error retreiving the data')
//             }
//             else {
//                 res.json({rows})
//             }
//         })
//     })
    
    
// })


// /** Project Management */

// /** Insert Project */

// app.get("/addproject", (req, res)=>{
//     res.render('project')
// })

// app.post("/process/project", (req, res) => {
    
//     pool.getConnection((err, conn) => {
//         if(err) throw err
//         const params = req.body
//         const title = params.title
//         const desc = params.desc
//         const type = params.type
        

        
        
//         const exec = conn.query('INSERT INTO projects (title, description, type) VALUES (?, ?, ?)', [title, desc, type], (err, rows) => {
//             conn.release()
//             console.log('SQL', exec.sql)
//             if(!err) {
//                 res.redirect('/projects')
//             }
//             else {
//                 console.log(`The data from the user table are:11 \n`, rows)
//             }
//         })

        
//     })
// })

// app.get("/projects", (req, res)=>{
//     pool.getConnection((err, conn) =>{
//         if(err) throw err

//         const exec = conn.query('Select * from projects', (err, rows) => {
//             conn.release()
//             console.log('SQL', exec.sql)
//             if(err) {
//                 res.status(500).send('Error retreiving the data')
//             }
//             else {
//                 res.render('projects', {data: rows})
//             }
//         })
//     })
    
    
// })

// app.get("/project/:id/delete", (req, res)=>{
//     const id = req.params.id
//     console.log(id)
//     pool.getConnection((err, conn) =>{
//         if(err) throw err

//         const exec = conn.query('DELETE from projects WHERE id = ?', [id], (err, rows) => {
            
//             console.log('SQL', exec.sql)
//             if(err) {
//                 res.status(500).send('Error Deleting the data')
//             }
//             else {
//                 conn.release()
//                 res.redirect('/projects')

               

                
//             }
//         })
//     })
    
    
// })
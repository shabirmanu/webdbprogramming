const express = require('express');
const session = require('express-session');
const app = express()
const router = express.Router(); // Create an instance of the router
const pool = require('./database')

const isEmpty = (input) => {
    if (
         typeof input === "undefined" ||
         input === null ||
         input === "" ||
         input === "null" ||
         input.length === 0 ||
         (typeof input === "object" && !Object.keys(input).length)
        )
    {
        return true;
    }
    else return false;
}

app.use(
    session({
        secret: 'loginSession',
        resave: true,
        saveUninitialized: true,
    })
);

router.post('/signin', (req, res) => {
    const id = req.body.id
    const password = req.body.password

    console.log('post')
    const selectQuery = 'SELECT name, id, password FROM index_table WHERE id = ? AND password = ?'
    
    pool.query(selectQuery, [id, password], (err, results) => {
      if (err) {
        console.error('SELECT 쿼리 실행 중 오류:', err);
        return res.status(500).send('오류');
      }
      console.log('results: ' + results[0])

      if (!isEmpty(results)) {
        for (i = 0; i < results.length; i++) {
          console.log(results[i].name + ', ' + results[i].id + ', ' + results[i].password)
        }
        req.session.user = { id: results[0].id, password: results[0].password, name: results[0].name };
        res.status(200).json({ success: true, userName: results[0].name });
      } else {
        res.status(404).send('회원 정보가 존재하지 않습니다.');
      }
    });
});

router.post('/signup', (req, res) => {
    const name = req.body.name
    const id = req.body.id
    const password = req.body.password

    console.log('name: ' + name + ', id: ' + id + ', password: ' + password)
    const selectQuery = 'SELECT id FROM index_table WHERE id = ?'

    pool.query(selectQuery, [id], (err, results) => {
        if (err) {
          console.log('req.body: ' + req.body);
          console.log('res.body: ' + res.body);
          console.error('SELECT 쿼리 실행 중 오류:', err);
          return res.status(500).send('오류가 발생했습니다.');
        }
        
        if (isEmpty(results)) {
            const insertQuery = 'INSERT INTO index_table (name, id, password) VALUES (?, ?, ?)'
    
            pool.query(insertQuery, [name, id, password], (err, results) => {
              if (err) {
                console.error('INSERT 쿼리 실행 중 오류:', err);
                return res.status(500).send('오류가 발생했습니다.');
              }
              res.status(200).json({ success: true });
            });
        } else {
          res.status(409).send('이미 존재하는 아이디입니다.')
        }
      });
});

router.delete('/logout', (req, res) => {
  delete req.session.user
  res.status(200).json({ success: true })
})

module.exports = router;
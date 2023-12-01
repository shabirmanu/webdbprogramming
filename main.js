/* 공유 일기 웹 사이트 */

/* 사용 모듈 */
const express = require('express')
const session = require('express-session')
const app = express()
const mysql = require('mysql')
const multer = require('multer');
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')

/* express */
app.use('/scripts', express.static(__dirname+'/scripts'))
app.use('/assets', express.static(__dirname+'/assets/'))
app.use('/webdbprogramming/assets/img/', express.static('/webdbprogramming/assets/img/'))
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true }
}))
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

/* 사용 DB: mysql */
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'diary',
  connectionLimit: 10,
})

/* 업로드된 사진을 DB에 저장하기 위한 multer */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 파일이 저장될 경로
    cb(null, 'webdbprogramming/assets/img/');
  },
  filename: function (req, file, cb) {
    // 파일명 (여기서는 원본 파일명에 업로드 시간을 추가함)
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.listen(3000, ()=> {
    console.log('웹 서버 연결 성공')
})

/* 기본 페이지 */
app.get('/', (req, res) => {// index.ejs 렌더링
  const query = `SELECT photos.*, users.username FROM photos
                 JOIN users ON photos.user_id = users.id`;

  pool.query(query, (error, results) => {
    if (error) {
      res.status(500).send('Error retrieving photos from database');
    } else {
      res.render('index', { loggedIn: req.session.loggedIn, loggedInUserId: req.session.userId , photos: results });
    }
  });
});

/* 로그인/로그아웃 페이지 */
app.get('/login', (req, res) => {// login.ejs 렌더링
  const message = req.query.message;
  res.render('login', { message: message });
});

app.post('/login', (req, res) => {// 로그인 요청 처리 라우트
  const { username, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database Connection Error');
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    connection.query(query, [username], (err, results) => {
      connection.release();
      if (err) {
        console.error(err);
        return res.status(500).send('Error Retrieving User From Database');
      }

      if (results.length === 0) {
        return res.status(401).send('No such user found');
      }
            
      const user = results[0];

      if (password === user.password) {
        req.session.userId = user.id; 
        req.session.loggedIn = true;
        const redirectTo = req.session.redirectAfterLogin || '/';
        delete req.session.redirectAfterLogin; // 세션에서 리다이렉트 경로 삭제
        res.redirect(redirectTo);
      } else {
        res.status(401).send('Password does not match');
      }              
    });
  });
});

app.get('/logout', (req, res) => {// 로그아웃 처리
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

/* 회원가입 페이지 */
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error while getting database connection');
    }

    // Check if the username or email already exists
    const checkQuery = `SELECT * FROM users WHERE username = ? OR email = ?`;
    connection.query(checkQuery, [username, email], (err, results) => {
      if (err) {
        connection.release();
        console.error(err);
        return res.status(500).send('Error while checking user data');
      }

      if (results.length > 0) {
        // Username or email already exists
        connection.release();
        return res.status(400).send('Username or email already exists');
      } else {
        // Insert new user
        const insertQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        connection.query(insertQuery, [username, email, password], (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
            return res.status(500).send('Error while inserting user data');
          }
          res.redirect('/login');
        });
      }
    });
  });
});

/* 글 목록 페이지 */
app.get('/post', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    const postsQuery = `SELECT posts.*, users.username FROM posts
                           JOIN users ON posts.user_id = users.id`;  // 글 작성자와 사용자 정보
    connection.query(postsQuery, (err, postsResults) => {
      if (err) {
        connection.release();
        throw err;
      }
      
      const commentsQuery = `SELECT comments.*, users.username AS commenter_username FROM comments
                             JOIN users ON comments.user_id = users.id`; // 댓글 작성자와 사용자 정보
      connection.query(commentsQuery, (err, commentsResults) => {
        connection.release();
        if (err) throw err;

        const posts = postsResults.map(post => { // 글과 댓글 매핑
          return {
            ...post,
            comments: commentsResults.filter(comment => comment.post_id === post.id)
          };
        });
        
        res.render('post', {
          posts: posts, loggedIn: req.session.loggedIn ,loggedInUserId: req.session.userId
        });
      });
    });
  });
});

/* 글 작성 페이지 */
app.get('/upload', (req, res) => { // post.ejs 렌더링
  if (!req.session.loggedIn) { // 로그인 한 사용자가 아닐 시 로그인 페이지로 이동
    req.session.redirectAfterLogin = '/upload'; // 현재 페이지 경로 저장
    res.redirect('/login');
  } else {
    res.render('upload');
  }
});

app.post('/save', (req, res) => {// 작성 글 저장 요청 라우트
  const { title, contents } = req.body;
  const userId = req.session.userId;

  pool.getConnection((err, connection) => {
      if (err) throw err;
      const query = `INSERT INTO posts (user_id, title, contents) VALUES (?, ?, ?)`;
      connection.query(query, [userId, title, contents], (err) => {
          connection.release();
          if (err) throw err;
          res.redirect('/post'); // 글 목록 페이지로 이동
      });
  });
});

app.delete('/delete_post/:id', function(req, res) { // 글 삭제 요청 라우트
  const postId = req.params.id;
  const userId = req.session.userId;

  pool.getConnection((err, connection) => {
      if (err) {
          console.error(err);
          return res.json({ success: false });
      }

      const checkQuery = `SELECT user_id FROM posts WHERE id = ?`;
      connection.query(checkQuery, [postId], (err, results) => {
          if (err || results.length === 0) {
              connection.release();
              return res.json({ success: false, message: "post not found or you don't have permission to delete this post." });
          }

          if (results[0].user_id !== userId) {
              connection.release();
              return res.json({ success: false, message: "You don't have permission to delete this post." });
          }

          const deleteQuery = `DELETE FROM posts WHERE id = ?`;
          connection.query(deleteQuery, [postId], (err, results) => {
              connection.release();
              if (err) {
                  console.error(err);
                  return res.json({ success: false });
              }
              res.json({ success: true });
          });
      });
  });
});

/* 글 수정 페이지 */
app.get('/edit_post/:id', (req, res) => {
  const postId = req.params.id;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    const query = `SELECT * FROM posts WHERE id = ?`;
    connection.query(query, [postId], (err, results) => {
      connection.release();
      if (err) throw err;
      if(results.length > 0) {
        res.render('edit', { post: results[0] });
      } else {
        res.send('post not found');
      }
    });
  });
});

app.post('/update_post/:id', (req, res) => { // 글 수정 요청 라우트
  const postId = req.params.id;
  const { title, contents } = req.body;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    const query = `UPDATE posts SET title = ?, contents = ? WHERE id = ?`;
    connection.query(query, [title, contents, postId], (err, results) => {
      connection.release();
      if (err) throw err;
      res.redirect('/post');
    });
  });
});

app.post('/add_comment', (req, res) => { // 댓글 작성 요청 라우트
  const { post_id, comment } = req.body;
  const user_id = req.session.userId;
  
  const query = `INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)`;
  pool.query(query, [post_id, user_id, comment], (error, results) => {
      if (error) {
          console.error(error);
          return res.redirect('/post');
      }
      res.redirect('/post');
  });
});

app.delete('/delete_comment/:commentId', (req, res) => { // 댓글 삭제 요청 라우트
  const { commentId } = req.params;
  const userId = req.session.userId;

  const checkQuery = `SELECT user_id FROM comments WHERE id = ? AND user_id = ?`;
  pool.query(checkQuery, [commentId, userId], (error, results) => {
    if (error || results.length === 0) {
      return res.status(404).json({ success: false, message: "Comment not found or you don't have permission." });
    }

    const deleteQuery = `DELETE FROM comments WHERE id = ?`;
    pool.query(deleteQuery, [commentId], (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: "Error deleting comment." });
      }
      res.json({ success: true, message: "Comment deleted successfully." });
    });
  });
});

/* 사진 업로드 페이지 */
app.get('/upload_photo', (req, res) => {
  if (!req.session.loggedIn) {
    req.session.redirectAfterLogin = '/upload_photo'; // 현재 페이지 경로 저장
    res.redirect('/login');
  } else {
    res.render('upload_photo');
  }
});

app.post('/save_photo', upload.single('photo'), (req, res) => { // 사진 업로드 요청 라우트
  const title = req.body.title;
  const userId = req.session.userId;
  const filepath = req.file.path;

  pool.getConnection((err, connection) => {
      if (err) throw err;
      const query = `INSERT INTO photos (user_id, title, filepath) VALUES (?, ?, ?)`;
      connection.query(query, [userId, title, filepath], (err) => {
          connection.release();
          if (err) {
              console.error(err);
              res.status(500).send('Error while saving the photo');
          } else {
              res.redirect('/');
          }
      });
  });
});

app.delete('/delete_photo/:id', (req, res) => { // 사진 삭제 요청 라우트
  const photoId = req.params.id;
  const userId = req.session.userId;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error connecting to database.' });
    }

    const checkQuery = `SELECT * FROM photos WHERE id = ? AND user_id = ?`;
    connection.query(checkQuery, [photoId, userId], (err, results) => {
      if (err || results.length === 0) {
        connection.release();
        return res.status(404).json({ success: false, message: "Photo not found or you don't have permission." });
      }

      const filepath = results[0].filepath;

      fs.unlink(filepath, (err) => {
        if (err) {
          connection.release();
          console.error(err);
          return res.status(500).json({ success: false, message: "Error deleting photo file." });
        }

        const deleteQuery = `DELETE FROM photos WHERE id = ?`;
        connection.query(deleteQuery, [photoId], (err, results) => {
          connection.release();
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
          }
          res.json({ success: true, message: "Photo deleted successfully." });
        });
      });
    });
  });
});
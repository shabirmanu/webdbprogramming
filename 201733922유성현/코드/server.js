const express = require("express")
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const mysql = require("mysql")
const ejs = require('ejs');
const app = express()

const session = require('express-session')

/*
 Session configuration
*/

app.use(cookieParser())
app.use(flash())

// 세션을 사용하기 위한 미들웨어( 아래 use 붙은 것들 다 미들웨어임 ) ( 세션사용하려면 반드시 해야함 )
// resave -> 변경없어도 저장 ( 긍까 true면 저장한다는거 )-> 일반적으로 false
//saveUninitialize -> 뭔가 값이 들어오기 전까지 세션을 만들지 않음( 긍까 true면 만든다는거 ) -> 일반적으로 false
app.use(session({
    resave:false,
    saveUninitialize : false,
    secret: 'keyboard cat'
}))

app.use((req, res, next) => {
  res.locals.username = req.session.username || null;
  if(req.session.username) {
      res.locals.role = req.session.role
      console.log("role")
      console.log(res.locals.role)
  }
  next()
})

app.use("/js", express.static(__dirname+"/webdb_html/js"))
app.use("/css", express.static(__dirname+"/webdb_html/css"))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.set("view engine", "ejs")
app.set("views", "./webdb_html/views")

const pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"cparters",
    connectionLimit:10
})

app.listen(8081,()=>{
    console.log("연결 완료")
})

app.get("/",(req,res)=>{


    const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
    const page_limit = 12; // NOTE: 페이지에서 보여줄 컨텐츠 수.
    const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
    const skipSize = (pageNum - 1) * page_limit; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.

    const search = req.query.search || null; // 검색어 - 없으면 null

  
    pool.getConnection((err, conn)=>{
        if(err){
            throw err
        }

    if (search == null){
      conn.query('SELECT count(*) as `count` FROM `goods`', (err, rows) => {
        if (err) throw err;
        const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
        const pnTotal = Math.ceil(totalCount / page_limit); // NOTE: 페이지네이션의 전체 카운트
        const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
        let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.

        exec = conn.query('SELECT * FROM `goods` ORDER BY id ASC LIMIT ?, ?', [skipSize, page_limit], (err, rows) => {
            conn.release()
          if (err) throw err;
          if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
          const result = {
            pageNum,
            pnStart,
            pnEnd,
            pnTotal,
            contents: rows,
            category: null
          };
          //console.log(result)
          res.render('index', {
            data: result,
          });
        });
      });
    }else{
      conn.query("SELECT count(*) as `count` FROM `goods` WHERE goods_name LIKE '%"+search+"%'", (err, rows) => {
        if (err) throw err;
        const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
        const pnTotal = Math.ceil(totalCount / page_limit); // NOTE: 페이지네이션의 전체 카운트
        const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
        let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.

        exec = conn.query("SELECT * FROM `goods` WHERE goods_name LIKE '%"+search+"%' ORDER BY id ASC LIMIT ?, ?", [skipSize, page_limit], (err, rows) => {
            conn.release()
          if (err) throw err;
          if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
          const result = {
            pageNum,
            pnStart,
            pnEnd,
            pnTotal,
            contents: rows,
            category: null
          };
          //console.log(result)
          res.render('index', {
            data: result,
          });
        });
      });

    }
  });

});

    app.get("/category/:category",(req,res)=>{

      const { category } = req.params;
      
      const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
      const page_limit = 12; // NOTE: 페이지에서 보여줄 컨텐츠 수.
      const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
      const skipSize = (pageNum - 1) * page_limit; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.

      const search = req.query.search || null; // 검색어 - 없으면 null
      //console.log(search)
  
      pool.getConnection((err, conn)=>{
          if(err){
              throw err
          }
          
        if (search == null){ 
      conn.query('SELECT count(*) as `count` FROM `goods` WHERE category = ?',[category], (err, rows) => {
          if (err) throw err;
          
          const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
          const pnTotal = Math.ceil(totalCount / page_limit); // NOTE: 페이지네이션의 전체 카운트
          const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
          let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
          //console.log(category)
          
          exec = conn.query('SELECT * FROM `goods` WHERE category = ? ORDER BY id ASC LIMIT ?, ?', [category ,skipSize, page_limit], (err, rows) => {
              conn.release()
            if (err) throw err;
            if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
            const result = {
              pageNum,
              pnStart,
              pnEnd,
              pnTotal,
              contents: rows,
              category: category
            };
            //console.log(result)
            
            res.render('index', {
              data: result
            });
          });
        });
      }else{
        conn.query("SELECT count(*) as `count` FROM `goods` WHERE category = ? AND goods_name LIKE '%"+search+"%'",[category], (err, rows) => {
          if (err) throw err;
          
          const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
          const pnTotal = Math.ceil(totalCount / page_limit); // NOTE: 페이지네이션의 전체 카운트
          const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
          let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
          //console.log(category)


          exec = conn.query("SELECT * FROM `goods` WHERE category = ? AND goods_name LIKE '%"+search+"%' ORDER BY id ASC LIMIT ?, ?", [category,skipSize, page_limit], (err, rows) => {
              conn.release()
            if (err) throw err;
            if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
            const result = {
              pageNum,
              pnStart,
              pnEnd,
              pnTotal,
              contents: rows,
              category: category
            };
            //console.log(result)
            
            res.render('index', {
              data: result
            });
          });
        });
      }
      });
    });



    app.get('/view/:id', (req, res) => {
        const { id } = req.params;
        pool.getConnection((err, conn)=>{
            if(err){
                throw err
            }
        conn.query('SELECT * FROM `goods` WHERE id = ?', [id], (err, results) => {
          if (err) throw err;
          res.render('view', {
            data: results[0],
          });
        });
      });
    });

app.get("/signup", (req,res)=>{

  res.render('signup',{
    'message':""
  })
})

app.post("/signup", (req,res)=>{
  //console.log(req.body);
  pool.getConnection((err,conn)=>{
    if (err) throw err
    const params = req.body
    //console.log(params)
    const id = params.id
    const pw = params.password
    const email = params.email

    // 해당 아이디 있는지 확인 ( 중복확인 )
    conn.query("SELECT * FROM users WHERE user_id = ?",[id],(err,rows)=>{
      conn.release
      //console.log(rows)
      
      if (!err) {
        if (rows.length > 0){

          res.render("signup",{
            'message':"해당 ID가 이미 존재합니다."
          })
          
          }else{
            const exec = conn.query("INSERT INTO users (user_id, user_pw, user_email, role) VALUES (?,password(?),?,?)",[id,pw,email,3],(err,rows)=>{

              conn.release
              
              if (!err) {
                  res.redirect("/")
              }else{
                  console.log(`The data from the user table are:11 \n`, rows)
              }
          })
          }
      }else{
          console.log(`The data from the user table are:10 \n`, rows)
      }
  })



})
})

app.get("/login", noLogin,(req,res)=>{
  res.render('login',{
    'message':""
  })
})

app.post("/login",noLogin,(req,res)=>{
  //console.log(req.body);
  pool.getConnection((err,conn)=>{
    if (err) throw err
    const params = req.body
    //console.log(params)
    const id = params.id
    const pw = params.password


    const exec = conn.query("SELECT * FROM users WHERE user_id = ? AND user_pw = password(?)",[id,pw],(err,rows)=>{
        conn.release
        console.log(err)
        
        if(!err) {
          // 데이터가 있는지 없는지 확인
          if (rows.length > 0){
              // 로그인 성공 -> session에 username 데이터 저장
              req.session.username = rows[0].user_id
              req.session.role = rows[0].role
              console.log("session info")
              console.log(req.session.username)

              // session이 있으면 자동으로 사용자에게 cookie가 보내진다.
              // 신경 안써도됨
              res.redirect("/")
          }else{
            res.render("login",{
              'message':"ID 혹은 PW를 확인해주세요"
            })
          
          }
          
      }
      else {
        console.log(`The data from the user table are:10 \n`, rows)
      }
    })
})
})

app.get("/logout",(req, res) => {
  req.session.destroy()
  res.redirect("/")
})

app.get("/admin",requireAdminLogin,(req,res)=>{


  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  const page_limit = 12; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * page_limit; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.

  const search = req.query.search || null; // 검색어 - 없으면 null


  pool.getConnection((err, conn)=>{
      if(err){
          throw err
      }


    conn.query('SELECT count(*) as `count` FROM `goods`', (err, rows) => {
      if (err) throw err;
      const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
      const pnTotal = Math.ceil(totalCount / page_limit); // NOTE: 페이지네이션의 전체 카운트
      const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
      let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.

      exec = conn.query('SELECT * FROM `goods` ORDER BY id ASC LIMIT ?, ?', [skipSize, page_limit], (err, rows) => {
          conn.release()
        if (err) throw err;
        if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
        const result = {
          pageNum,
          pnStart,
          pnEnd,
          pnTotal,
          contents: rows,
          category: null
        };
        //console.log(result)
        res.render('admin', {
          data: result,
        });
      });
    });
});
});

app.get("/admin/delete/:id",requireAdminLogin,(req,res)=>{

  const { id } = req.params;
  pool.getConnection((err, conn)=>{
      if(err){
          throw err
      }
  conn.query('DELETE FROM `goods` WHERE id = ?', [id], (err, result) => {
    conn.release()

    if (err) throw err;
    res.redirect('/admin')

  });
});
});

app.get("/admin/edit/:id",requireAdminLogin,(req,res)=>{

  const { id } = req.params;

  pool.getConnection((err, conn)=>{
      if(err){
          throw err
      }
  conn.query('SELECT * FROM `goods` WHERE id = ?', [id], (err, result) => {
    conn.release()

    if (err) throw err;
    res.render("admin_edit", {
      data: result[0],
    })

  });
});
});

app.post("/admin/edit",requireAdminLogin,(req,res)=>{
  
  const params = req.body

  const id = params.id;
  const name = params.name;
  const Url = params.Url;
  const imageUrl = params.imageUrl;
  const category = params.category;
  const goods_price = params.goods_price;
  const goods_discount_price = params.goods_discount_price;

  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  const page_limit = 12; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * page_limit; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.



  pool.getConnection((err, conn)=>{
      if(err){
          throw err
      }
  conn.query('UPDATE `goods` SET goods_name=? , goods_url=? , goods_image=? , category=? , goods_price=? , goods_discount_price=?  WHERE id = ?', [name,Url,imageUrl,category,goods_price,goods_discount_price,id], (err, result) => {
    conn.release()

    if (err) throw err;

  });
});

pool.getConnection((err, conn)=>{
  if(err){
      throw err
  }


conn.query('SELECT count(*) as `count` FROM `goods`', (err, rows) => {
  if (err) throw err;
  const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
  const pnTotal = Math.ceil(totalCount / page_limit); // NOTE: 페이지네이션의 전체 카운트
  const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
  let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.

  exec = conn.query('SELECT * FROM `goods` ORDER BY id ASC LIMIT ?, ?', [skipSize, page_limit], (err, rows) => {
      conn.release()
    if (err) throw err;
    if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
    const result = {
      pageNum,
      pnStart,
      pnEnd,
      pnTotal,
      contents: rows,
      category: null
    };
    //console.log(result)
    res.render('admin', {
      data: result,
    });
  });
});
});

});



app.get("/admin/input",requireAdminLogin,(req,res)=>{
  res.render("admin_input")
});


app.post("/admin/input",requireAdminLogin,(req,res)=>{

  pool.getConnection((err,conn)=>{
    if (err) throw err
    const params = req.body

    const name = params.name
    const imageUrl = params.imageUrl
    const category = params.category
    const goods_price = params.goods_price
    const url = params.Url
    const goods_discount_price = params.goods_discount_price

    const exec = conn.query("INSERT INTO `goods` (goods_name, goods_url, goods_image, category,goods_price,goods_discount_price) VALUES (?,?,?,?,?,?)",[name,url,imageUrl,category,goods_price,goods_discount_price],(err,rows)=>{
        conn.release
        console.log(err)
        
        if(!err) {
          res.redirect("/admin")

      }
      else {
        console.log(`The data from the user table are:10 \n`, rows)
      }
    })
})
});




function requireLogin(req,res,next){
  if (req.session.username){
      next()

  }else{
  req.flash("error","로그인이 필요합니다.")
  res.redirect("/login")
  }
}

function requireAdminLogin(req,res,next){
  if (req.session.username && req.session.role < 1){
      next()

  }else{
  req.flash("error","관리자 로그인이 필요합니다.")
  res.redirect("/")
  }
}

function noLogin(req,res,next){
  if(req.session.username){
    req.flash("error","로그인이 이미 되어 있습니다.")
    res.redirect("/")
  }else{
    next()
  }
}

// 세션 및 역할에 따른 처리

// 역할에 따른 처리
// 관리자페이지
// 관리자 페이지 -> DB 제어
// 번역 기능 추가
// 가능하면 RSS까지


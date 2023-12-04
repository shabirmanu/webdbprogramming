express = require('express')
const mysql = require('mysql')
const cookieParser = require('cookie-parser')
const ejs = require('ejs')
const i18n = require('i18n')
const flash = require('connect-flash')
const app = express();
//session은 서버에 저장, cookie는 클라이언트 웹 브라우저 저장
const multer = require('multer');
//이미지 동영상 등 여러 가지 파일들을 멀티파트 형식으로 업로드할때 사용함
const path = require("path");
//라우트를 생성해 경로 문자열에 콜론을 이용해 변수나 경로변수 지정



//미들웨어 app.use() 란 결국 응답과 요청을 처리해줌 
var session = require('express-session')
app.use(cookieParser())
app.use(flash())
app.use('/css', express.static('assignment/css'));
app.use("/js", express.static(__dirname+"/assignment/js"))
//__dirname은 현재 실행 중인 파일의 디렉터리 이름을 나타냄
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/assignment/upload', express.static(path.join(__dirname, 'assignment/upload')));
app.set("view engine","ejs")
app.set("views",__dirname+"/assignment/views")

/*
현재는 username을 기본값으로 주고 기본값으로 사용하고 있음
but username 중 하나인 role == 1 인 park이 중복될 수 있음
중복? username이 park 다른 사람이 존재하는 경우
이를 해결하기 위해 username을 구별하는 식별자가 아닌
email을 사용하면 해결할 수 있음
저번 기말고사 프로젝트 발표 때 username이 park이 중복될 경우 해결방법?
username이 아닌 email을 식별자로 기본키를 주어 email을 통해 role 값 부여
*/


//주석

i18n.configure({
    locales:['en','ko'],
    directory: __dirname+'/locales',
    defaultLocale:'en',
    cookie:'lang',
    objectNotation:true,
})

app.use(i18n.init)

app.use(session({
    resave: false, 
    saveUninitialized: false, 
    secret: 'keyboard cat'
  }));


function requireLogin(req, res, next){
    if(req.session.username) {
        next()
    }
    else {
        req.flash('error', 'You have to login first!');
        res.redirect("/login")
    }
}

function requireLogin2(req, res, next){
    if(req.session.username && req.session.role ==1) {
        next();
    } else{
        req.flash('error', 'You have to login first!');
        res.redirect("/shologin")
    }
}

app.use("/", (req, res, next) => {
    res.locals.username = req.session.username || null;
    //locals 로컬 변수 , 서버 측에서 클라이언트로 데이터 전달할 때 사용
    if(req.session.username) {
        res.locals.role = req.session.role
        console.log("role:", res.locals.role)
        console.log("username :", res.locals.username)
    }
    next()
})
// 이미지
const storage = multer.diskStorage({
    //storage 라는 저장 공간을 만듬 
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, 'assignment','upload'))
    },
    // path.join이란 경로랑 파일이름 결합
    //destination에서 이미지를 저장할 공간 정의
    filename: function (req, file, cb){
        const PostUsername = req.body.username;
        cb(null, PostUsername + path.extname(file.originalname))
    }
    //filename에서 저장될 이미지 파일 이름을 지정 
    //path.extname(file.originalname) 확장자 .jpg 역할
});

const upload = multer({ storage: storage });
//upload 객체에 multer stroage 저장하는 메소드를 지정

app.post('/upload', upload.single('image'),(req,res)=>{
    res.send('File uploaded!');
})
// /upload 경로에 요청을 보내면 이미지 업로드(하나의 파일)

const pool = mysql.createPool({
    host: 'localhost',
    user:  'root',
    password: '',
    database: 'ums',
})
app.use((req, res, next) => {
    const locale = req.cookies.lang || 'en'; 
    // 쿠키가 설정되지 않았을 경우 'en'을 기본값으로 설정합니다.
    console.log(`Current locale: ${locale}`);
    req.setLocale(locale);
    //setLocale 언어 환경 설정하는 데 사용
    next();
});

app.listen(8080, ()=> {
    console.log("8080포트로 연결되었습니다");
});

app.get('/lang/:locale', (req, res) => {
    const locales = req.params.locale;
    console.log('local ='+locales)
    res.cookie('lang', locales);
    res.redirect('back'); 
  });
  //:local은 동적인 부분 언어 코드
  //언어 코드 쿠기에 저장, 클라이언트 측 저장 -> 다음 요청 서버 전송

const fs = require('fs')
//fs는 파일 시스템과 상호 작용하기 위한 모듈

function deleteImage(imagePath){
    fs.unlink(imagePath, (err) => {
        if(err){
            console.log(err);
        }else{
            console.log("success");
        }
    })
}
// 이미지를 삭제하는 함수(imagePath) 매개로 이미지의 경로를 받음


app.get("/", (req, res)=>{
    console.log(__dirname)
    res.render('index', {
        intro: res.__('intro'),
        introduce: res.__('introduce'),
        introduce2: res.__('introduce2'),
        vcontent: res.__('vcontent'),
        vmember : res.__("vmember"),
        content : res.__("content"),
        login : res.__("login"),
        signup : res.__("signup"),
        Login : res.__("Login"),
        Logout : res.__("Logout")
    })
})


app.get("/login", (req, res) => {
    res.render("login");
})


app.get("/content", (req, res) => {
    res.render("content");
})

app.get("/signup", (req, res) => {
    res.render("signup");
})
//render : 서버에서 렌더링해 클라이언트에게 보여줌
//redirect : 클라이언트를 다른 경로로 이동

app.post("/process/signup", (req, res) => {
    console.log(req.body)
    //sql 연동
    pool.getConnection((err, conn) => {
        if(err) {throw err}
        const params = req.body
        const username = params.username
        const email = params.email
        const password = params.password
        const gender = params.gender
        const role = params.role

        const exec =conn.query("INSERT INTO projects (username, email, password, gender,role ) VALUES(?,?,?,?,?)", [username, email, password, gender,role], (err, rows) => {
            console.log(exec.sql)
            //release 하는 이유? conn.pool에 다시 반납하기 위해
            if(err){
                
                conn.release()
                res.send("error saving the data" + err.message);
            }
            else{
                conn.release()
                res.redirect("/login")
            }
        })
    });
});

app.post("/process/login", (req, res) => {
    console.log(req.body);

    pool.getConnection((err, conn) => {
        if (err) {
            throw err;
        }

        const params = req.body;
        const username = params.username;
        const password = params.password;

        const query = "SELECT * FROM projects WHERE username = ? AND password = ?";
        const values = [username, password];

        const exec = conn.query(query, values, (err, rows) => {
            console.log(exec.sql);

            conn.release();

            if (err) {
                return res.send("Error: " + err.message);
            }

            if (rows.length > 0) {
                // 로그인 성공
                req.session.username = rows[0].username
                req.session.role = rows[0].role
                res.redirect("/")
            } else {
                // 일치하는 사용자 정보가 없음
                res.send("오류!")
            }
        });
    });
});

app.get("/showlogin",requireLogin2, (req, res) => {
    // 데이터베이스 연결
    pool.getConnection((err, conn) => {
        if (err) {
            // 오류 처리
            console.error(err);
        } else {
            const query = "SELECT * FROM projects";
            conn.query(query, (err, rows) => {
                conn.release(); // 연결 해제

                if (err) {
                    // 오류 처리
                    console.error(err);
                    res.render("showlogin", { data: [] }); // 빈 데이터로 페이지 렌더링
                } else {
                    // 데이터를 가져와서 data 변수로 설정 후 페이지 렌더링
                    res.render("showlogin", { data: rows });
                }
            });
        }
    });
});

app.get("/showlogin/:username/delete", (req, res)=>{
    const username = req.params.username;

        pool.getConnection((err, conn) =>{
            if(err) throw err;

            const exec = conn.query('DELETE from projects WHERE username = ?', [username], (err, rows) => {
                console.log(exec.sql)
                if(err) {
                    res.json({"status":"Error"})
            }   else {
                    conn.release();
                    res.redirect('/showlogin');
            }
        });
    });
});


app.post("/process/content", upload.single('image'), (req, res) => {
    const params = req.body;
    const username = params.username;
    const title = params.title;
    const content = params.content;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            res.send("Error connecting to the database");
        } else {
            const query = "INSERT INTO content (username,title,content) VALUES (?,?,?)";
            conn.query(query, [username,title,content], (err, result) => {
                conn.release();
                if (err) {
                    console.error(err);
                    res.redirect("/showcontent");
                } else {
                    res.locals.role = req.session.role
                    console.log("role:", res.locals.role)
                    res.redirect("/showcontent")
                }
            });
        }
    });
});

app.get("/showcontent",requireLogin, (req, res) => {
    // 데이터베이스 연결
    pool.getConnection((err, conn) => {
        if (err) {
            // 오류 처리
            console.error(err);
            res.render("showcontent", { data: [], role : req.session.role}); // 빈 데이터로 페이지 렌더링
        } else {
            const query = "SELECT * FROM content";
            conn.query(query, (err, rows) => {
                conn.release(); // 연결 해제

                if (err) {
                    // 오류 처리
                    console.error(err);
                    
                } else {
                    // 데이터를 가져와서 data 변수로 설정 후 페이지 렌더링
                    res.render("showcontent", { data: rows});
                }
            });
        }
    });
});

app.get("/showcontent/:username/delete", (req, res)=>{
    const username = req.params.username;

        pool.getConnection((err, conn) =>{
            if(err) throw err;

            const exec = conn.query('DELETE from content WHERE username = ?', [username], (err, rows) => {
                console.log(exec.sql)
                if(err) {
                    res.json({"status":"Error"})
            }   else {
                    const imagePath = 
                    path.join(__dirname,'assignment','upload', username + '.jpg');

                    deleteImage(imagePath);

                    conn.release();
                    res.redirect('/content');
            }
        });
    });
});

app.get("/showcontent/:username/edit", (req, res) => {
    res.redirect("/content");
});

app.get("/logout",(req, res) => {
    req.session.destroy()
    res.redirect("/")
})



//quiz 부분!!!!!!!!
app.get("/signup2", (req, res)=>{
    res.render('signup2')
})

app.post("/process/signup2", (req, res) => {
    console.log(req.body)
    //sql 연동
    pool.getConnection((err, conn) => {
        if(err) {throw err}
        const params = req.body
        const username = params.username
        const email = params.email
        const password = params.password

        const exec =conn.query("INSERT INTO quiz (username, email, password) VALUES(?,?,?)", [username, email, password], (err, rows) => {
            console.log(exec.sql)
            //release 하는 이유? conn.pool에 다시 반납하기 위해
            if(err){
                
                conn.release()
                res.send("error saving the data" + err.message);
            }
            else{
                conn.release()
                res.redirect("/signup2")
            }
        })
    });
});
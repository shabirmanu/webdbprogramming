const express = require('express')
const mysql = require('mysql')
const app = express();
const ejs = require("ejs");
var session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const PORT = 65000;

app.use(express.json())
app.use(express.urlencoded({extended: true}))

i18n.configure({
    locales:['en', 'ko'],
    directory: __dirname+"/locales",
    defaultLocale: 'ko',
    cookie: 'lang',
    objectNotation: true,
})

app.use(cookieParser())
app.use(i18n.init)

app.use(session({
    resave: false,	//don't save session if unmodified
    saveUninitialized: false,	//don't create session until sth stored
    secret: 'keyboard cat'
    }))

app.use((req, res, next) => {
	res.locals.id = req.session.userid || null;
	if(req.session.userid){
		res.locals.role = req.session.role;
	}else{
        res.locals.role = 3;
    }
	next()
})

app.use("/css", express.static(__dirname+"/views/css"))
app.use("/js", express.static(__dirname+"/views/js"))
app.use("/fonts", express.static(__dirname+"/views/fonts"))
app.use("/images", express.static(__dirname+"/views/images"))

app.set("view engine", "ejs")
app.set("views", "./views")

app.use(flash())


// mysql database 연결
const pool = mysql.createPool({
    host: 'localhost',
    user:  'root',
    password: '',
    database: 'hoteldb'
})

// localhost:PORT로 접속
app.listen(PORT, ()=>{
    console.log("연결 완료! link -> http://localhost:" + PORT);
});



const loginRequire = (req, res, next) => {
    if(req.session.userid){
        next()
    } else {
        res.redirect("/login");
    }
}   

const logoutRequire = (req, res, next) => {
    if(req.session.userid){
        res.redirect("/");
    } else {
        next()
    }
}  

const adminRequire = (req, res, next) => {
    if(req.session.role === 1){
        next()
    } else {
        res.redirect("/");
    }
}  

/**
 * Language Routes
 */
app.get('/lang/:locale', (req, res) => {
    const locale = req.params.locale;
    console.log('local ='+locale)
    res.cookie('lang', locale);
    res.redirect('back'); // Redirect back to the previous page or use a specific URL
  });

/* home */
app.get("/", (req, res)=>{
    res.render('index', {
        pageTitle: 'Home',
    });
});

/* sign up */
app.get("/sign-up", logoutRequire, (req, res)=>{
    res.render('sign-up', {
        pageTitle: res.__('signup'),
    });
});

// id 중복 확인
app.get("/checkid/:id", (req, res) => {
    const id = req.params.id
    pool.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return;
        }
        // userid와 동일한 id가 users 안에 존재하는지 검색
        conn.query('SELECT userid FROM users WHERE userid = ?', [id], function (err, results, fields) {
            conn.release();
            if (err) {
                console.error(err);
                return;
            }else{
                // 중복되는 경우
                if (results.length === 1) {
                    res.render('notice', {
                        pageTitle: 'WARNING!',
                        detail: '이미 존재하는 ID입니다.',
                    });
                // 사용 가능한 경우
                } else {
                    res.render('notice', {
                        pageTitle: 'OK!',
                        detail: '사용 가능한 ID입니다.',
                    });
                }
            }
        });
    });
});

// 비밀번호와 비밀번호 확인이 일치하는지를 출력
app.get("/checkpw/:flag", (req, res) => {
    const flag = req.params.flag
    //비밀번호가 일치하는 경우
    if(flag === '1'){
        res.render('notice', {
            pageTitle: 'OK!',
            detail: '비밀번호가 일치합니다.',
        });
    }
    //비밀번호가 일치하지 않는 경우
    else{
        res.render('notice', {
            pageTitle: 'WARNING!',
            detail: '비밀번호가 일치하지 않습니다.',
        });
    }
});

// 회원가입(insert)
app.post("/process/sign-up", logoutRequire, (req, res)=>{
    pool.getConnection((err, conn) => {
        if(err) throw err
        const params = req.body
        const userid = params.userid
        const userpw = params.userpw
        const userpw2 = params.userpw2
        const username = params.username
        const useremail = params.useremail
        const userphone = params.userphone

        //비밀번호 미일치 시
        if(userpw !== userpw2){ 
            console.log(`비밀번호가 일치하지 않습니다.`);
            res.render('notice', {
                pageTitle: 'WARNING!',
                detail: '비밀번호가 일치하지 않습니다.',
            });
        } else {
            // 동일한 id가 이미 존재하는지 검색
            conn.query('select userid from users where userid = ?', [userid], function(err, results, fields){
                if(err){throw err}
    
                if(results.length === 1){
                    console.log(`이미 존재하는 ID입니다.`);
                    res.render('notice', {
                        pageTitle: 'WARNING!',
                        detail: '이미 존재하는 ID입니다.',
                    });
                // 사용 가능한 ID일 경우 users에 insert
                }else{
                    conn.query('INSERT INTO users (userid, userpw, username, useremail, userphone) VALUES (?, ?, ?, ?, ?)', [userid, userpw, username, useremail, userphone], (err, rows) => {
                        if(err) {
                            res.status(500).send('Error retreiving the data')  
                        }
                        else {
                            res.render('notice', {
                                pageTitle: 'OK!',
                                detail: '회원가입이 완료되었습니다.',
                            });
                        }
                    })
                }
            })
        }
        conn.release()
    })
});


/* login */
app.get("/login", logoutRequire, (req, res)=>{
    res.render('login', {
        pageTitle: res.__('login'),
    });
});

// login 과정
app.get("/process/log-in", (req, res)=>{
    pool.getConnection((err, conn) => {
        if(err) throw err
        const params = req.query
        const userid = params.userid
        const userpw = params.userpw
        // 입력한 id와 비밀번호가 일치하는지 확인
        exec = conn.query('select userpw, roleid from users where userid = ?', [userid], function(err, results, fields){
            conn.release()
            console.log('SQL', exec.sql)
            if(err){
                console.log(err)
                res.status(500).send('Error retreiving the data')  
            }else{
                if(results.length === 1){
                    if(results[0].userpw === userpw){
                        req.session.userid = userid;
                        req.session.role = results[0].roleid;
                        res.redirect('back');
                    }else{
                        res.render('notice', {
                            pageTitle: 'WARNING!',
                            detail: '비밀번호가 일치하지 않습니다.',
                        });
                    }
                // 존재하지 않는 id로 form을 제출한 경우
                }else{
                    res.render('notice', {
                        pageTitle: 'WARNING!',
                        detail: '존재하지 않는 ID입니다.',
                    });
                }
            }
        })
    })
});

/* logout */
app.get("/logout", (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    });
})

/* about */
app.get("/about-us", (req, res)=>{
    res.render('about-us', {
        pageTitle: res.__('about'),
    });
});

/* room */
app.get("/room", (req, res)=>{
    pool.getConnection((err, conn) =>{
        if(err) throw err

        // rooms table에서 정보를 받아 출력함
        const exec = conn.query('Select * from rooms', (err, rows) => {
            conn.release()
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.render('room', {pageTitle: res.__('room'), data: rows})
            }
        })
    })
});

app.post("/process/room/:roomid", adminRequire, (req, res)=>{
    const roomid = req.params.roomid;
    const num = req.body.roomcnt;

    pool.getConnection((err, conn) => {
        if(err) throw err
        conn.query('update rooms set roomnum = ? where roomid = ?', [num, roomid], (err, rows)=>{
            if(err) throw err;
            else{
                res.redirect('/room')
            }
        conn.release()
        })
    })
})


/* mypage */
app.get("/mypage", loginRequire, (req, res)=>{
    const userid = req.session.userid
    pool.getConnection((err, conn) =>{
        if(err) throw err
    // userid에 해당하는 user의 예약 기록 출력을 위해 reservation table 검색
    if(req.session.role === 1){
        res.render('mypage', {
            pageTitle: res.__('mypage'),
            data: null
        });
    } else {
        const exec = conn.query('select * FROM reservation where userid = ?', [userid], (err, rows) => {
            console.log(rows)
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.render('mypage', {
                    pageTitle: res.__('mypage'),
                    data: rows
                });
            }
        })
    }
    conn.release()
    })
})

// 비밀번호 변경(update)을 위한 새 비밀번호 입력 페이지
app.get("/update/pw", loginRequire, (req, res)=>{
    res.render('updatepw', {
        pageTitle: res.__('mypage'),
    });
})

// 비밀번호 변경(update)
app.post("/process/update/pw", loginRequire, (req, res)=>{
    const userid = req.session.userid
    const params = req.body
    const nowpw = params.nowpw
    const newpw = params.newpw
    const newpw2 = params.newpw2

    //(새) 비밀번호 확인이 일치하지 않을 경우
    if(newpw !== newpw2){
        res.render('notice', {
            pageTitle: 'WARNING!',
            detail: '비밀번호 변경에 실패했습니다.',
            id: userid
        });
    }else{
        pool.getConnection((err, conn) => {
            if(err) throw err
            
            // 현재 비밀번호 검색
            conn.query('select userpw from users where userid = ?', [userid], (err, rows)=>{
                if(err){
                    console.log(err);
                    res.status(500).send('Error retreiving the data') 
                } else{
                    //현재 비밀번호를 정확하게 입력한 경우 password 변경(update)
                    if(rows[0].userpw === nowpw){
                        conn.query('update users set userpw = ? where userid = ?', [newpw, userid], (err, rows)=>{
                            if(err) throw err;
                            else{
                                res.render('notice', {
                                    pageTitle: 'OK!',
                                    detail: '비밀번호 변경에 성공했습니다.',
                                });
                            }
                        })
                    // 현재 비밀번호를 틀리게 입력한 경우
                    }else{
                        res.render('notice', {
                            pageTitle: 'WARNING!',
                            detail: '비밀번호 변경에 실패했습니다.',
                        });
                    }
                }
            })
            conn.release()
        })
    }
    
})

// 예약, 예약 확인 및 취소
app.get("/reservation", loginRequire, (req, res)=>{
    res.render('reservation', {
        pageTitle: res.__('reservation')
    });
})

app.get("/book/list", loginRequire, (req, res)=>{
    const userid = req.session.userid
    const params = req.query
    const checkin = params.checkin
    const checkout = params.checkout
    const num = params.num
    console.log(checkin)

    if(checkin > checkout){
        res.render('notice', {
            pageTitle: 'WARNING!',
            detail: `접근 불가능한 날짜입니다. checkin: ${checkin}, checkout: ${checkout}`,
        });
    }else{
    pool.getConnection((err, conn) =>{
        if(err) throw err
    if(req.session.role === 1){
        const exec = conn.query('select * FROM reservation where (checkindate between ? and ?) or (checkoutdate between ? and ?)', [checkin, checkout, checkin,checkout], (err, rows) => {
        
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.render('booklist', {
                    pageTitle: res.__('reservation'),
                    checkin: checkin,
                    checkout:checkout,
                    data: rows
                });
            }
        })
    } else {
        const exec = conn.query('select C.roomid, C.roomname, C.roomdesc, roomnum - cnt as availcnt from rooms as C inner join (select A.roomid, ifnull(B.cnt, 0) as cnt from rooms as A left outer join (select roomid, count(*) as cnt from reservation where ((checkindate between ? and ?) or (checkoutdate between ? and ?)) group by roomid) as B on A.roomid = B.roomid)as D on C.roomid = D.roomid where roomnum > cnt and numofperson >= ?'
        , [checkin, checkout, checkin, checkout, num], (err, rows) => {
            console.log(rows)
            console.log('SQL', exec.sql)
            if(err) {
                res.status(500).send('Error retreiving the data')
            }
            else {
                res.render('booklist', {
                    pageTitle: res.__('reservation'),
                    checkin: checkin,
                    checkout:checkout,
                    data: rows
                });
            }
        })
    }
    conn.release()
    })
}
})

/* book a room */
app.post("/book", loginRequire, (req, res)=>{
    const userid = req.session.userid
    const params = req.body
    const checkin = params.checkin
    const checkout = params.checkout
    const roomid = params.roomid
    console.log(params)

    //올바른 날짜를 입력하였는지 확인(checkout 날짜가 checkin 날짜보다 빠를 수 없음)
    if(checkin > checkout){
        res.render('notice', {
            pageTitle: 'WARNING!',
            detail: `접근 불가능한 날짜입니다. checkin: ${checkin}, checkout: ${checkout}`,
        });
    }else{

        pool.getConnection((err, conn) => {
            if (err) {
                console.error(err);
                return;
            }
            conn.query('INSERT INTO reservation (userid, roomid, checkindate, checkoutdate) VALUES (?, ?, ?, ?)', [userid, roomid, checkin, checkout], (err, rows) => {
                        if(err) {
                            console.log(err);
                            res.status(500).send('Error retreiving the data')  
                        }
                        else {
                            res.redirect("/mypage")
                        }
                    })
                    conn.release();
            });

        }
});

// 예약 취소(delete)
app.get("/delete/reservation/:rid", loginRequire, (req, res)=>{
    const reservationid = req.params.rid;
    const userid = req.session.userid
    pool.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retreiving the data')
        }
        
        conn.query('select * from reservation where userid = ? and reservationid = ?', [userid, reservationid], function(err, results, fields){
            if(err){throw err}

            if(results.length === 1 || req.session.role === 1){
        // 예약 취소(delete)
                conn.query('delete from reservation where reservationid = ?', [reservationid], function (err, results, fields) {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error retreiving the data')
                    }else{
                        res.redirect("back")
                    }
                });
            }else{
                res.render('notice', {
                    pageTitle: 'WARNING!',
                    detail: '유효하지 않은 접근입니다.',
                });
            }
        });
        conn.release();
    });
})

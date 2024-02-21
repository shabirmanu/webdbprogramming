const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const ejs = require("ejs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const dbConfig = require("../../dbconfig");
const router = express.Router();

//--------------------------------------------------
const db = mysql.createConnection(dbConfig);

router.use(bodyParser.urlencoded({ extended: false }));
//  -----------------------------------  회원가입기능 -----------------------------------------
// 회원가입 입력양식을 브라우져로 출력합니다.
const PrintRegistrationForm = (req, res) => {
  let htmlstream = "";

  htmlstream = fs.readFileSync(
    __dirname + "/../../views/common/header.ejs",
    "utf8"
  );
  htmlstream =
    htmlstream +
    fs.readFileSync(__dirname + "/../../views/common/navbar.ejs", "utf8");
  htmlstream =
    htmlstream +
    fs.readFileSync(__dirname + "/../../views/user/reg_form.ejs", "utf8");
  htmlstream =
    htmlstream +
    fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });

  if (req.session.auth) {
    // true :로그인된 상태,  false : 로그인안된 상태
    res.end(
      ejs.render(htmlstream, {
        title: "쇼핑몰site",
        logurl: "/users/logout",
        loglabel: "로그아웃",
        regurl: "/users/profile",
        reglabel: req.session.who,
      })
    );
  } else {
    res.end(
      ejs.render(htmlstream, {
        title: "쇼핑몰site",
        logurl: "/users/auth",
        loglabel: "로그인",
        regurl: "/users/reg",
        reglabel: "가입",
      })
    );
  }
};

// 회원가입 양식에서 입력된 회원정보를 신규등록(DB에 저장)합니다.
const HandleRegistration = (req, res) => {
  // 회원가입
  let body = req.body;
  let htmlstream = "";
  let salt = 10;
  let datestr, y, m, d, regdate;

  console.log(body.uid); // 임시로 확인하기 위해 콘솔에 출력해봅니다.
  console.log(body.pw1);
  console.log(body.pw2);
  console.log(body.uname);

  if (
    body.uid == "" ||
    body.pw1 == "" ||
    body.pw2 == "" ||
    body.uname == "" ||
    body.uphone == "" ||
    body.uaddress == ""
  ) {
    console.log("데이터입력이 되지 않아 DB에 저장할 수 없습니다.");
    res
      .status(600)
      .send(
        "<script>alert('모든 항목을 입력해주세요.'); window.location.replace('/users/reg');</script>"
      );
  } else if (body.pw1 !== body.pw2) {
    console.log("비밀번호와 비밀번호 확인 입력값이 다릅니다.");
    res
      .status(600)
      .send(
        "<script>alert('비밀번호와 비밀번호 확인 입력값이 다릅니다.'); window.location.replace('/users/reg');</script>"
      );
  } else if (body.uid.length > 20) {
    res
      .status(600)
      .send(
        "<script>alert('아이디는 20자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
      );
  } else if (body.uname.length > 20) {
    res
      .status(600)
      .send(
        "<script>alert('이름은 20자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
      );
  } else if (body.uphone.length > 15) {
    res
      .status(600)
      .send(
        "<script>alert('전화번호는 15자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
      );
  } else if (body.uaddress.length > 100) {
    res
      .status(600)
      .send(
        "<script>alert('주소는 100자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
      );
  } else {
    regdate = new Date();
    let inputPassword = body.pw1;
    let hashPassword = crypto
      .createHash("sha512")
      .update(inputPassword + salt)
      .digest("hex");

    db.query(
      "INSERT INTO u0_users (uid, pass, name, phone, address, point, rdate) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        body.uid,
        hashPassword,
        body.uname,
        body.uphone,
        body.uaddress,
        100000,
        regdate,
      ],
      (error, results, fields) => {
        if (error) {
          htmlstream = fs.readFileSync(
            __dirname + "/../../views/common/alert.ejs",
            "utf8"
          );
          res.status(600).end(
            ejs.render(htmlstream, {
              title: "알리미",
              warn_title: "회원가입 오류",
              warn_message:
                "이미 회원으로 등록되어 있습니다. 바로 로그인을 하시기 바랍니다.",
              return_url: "/",
            })
          );
        } else {
          console.log(
            "회원가입에 성공하였으며, DB에 신규회원으로 등록하였습니다.!"
          );
          htmlstream = fs.readFileSync(
            __dirname + "/../../views/common/alert.ejs",
            "utf8"
          );
          res.status(200).end(
            ejs.render(htmlstream, {
              title: "알리미",
              warn_title: "회원가입 성공",
              warn_message:
                "회원 가입에 성공했습니다! 100,000 포인트가 지급되었습니다.",
              return_url: "/",
            })
          );
        }
      }
    );
  }
};

// REST API의 URI와 핸들러를 매핑합니다.
router.get("/reg", PrintRegistrationForm); // 회원가입화면을 출력처리
router.post("/reg", HandleRegistration); // 회원가입내용을 DB에 등록처리
router.get("/", function (req, res) {
  res.send("respond with a resource 111");
});

// ------------------------------------  로그인기능 --------------------------------------

// 로그인 화면을 웹브라우져로 출력합니다.
const PrintLoginForm = (req, res) => {
  let htmlstream = "";

  htmlstream = fs.readFileSync(
    __dirname + "/../../views/common/header.ejs",
    "utf8"
  );
  htmlstream =
    htmlstream +
    fs.readFileSync(__dirname + "/../../views/common/navbar.ejs", "utf8");
  htmlstream =
    htmlstream +
    fs.readFileSync(__dirname + "/../../views/user/login_form.ejs", "utf8");
  htmlstream =
    htmlstream +
    fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });

  if (req.session.auth) {
    // true :로그인된 상태,  false : 로그인안된 상태
    res.end(
      ejs.render(htmlstream, {
        title: "쇼핑몰site",
        logurl: "/users/logout",
        loglabel: "로그아웃",
        regurl: "/users/profile",
        reglabel: req.session.who,
      })
    );
  } else {
    res.end(
      ejs.render(htmlstream, {
        title: "쇼핑몰site",
        logurl: "/users/auth",
        loglabel: "로그인",
        regurl: "/users/reg",
        reglabel: "가입",
      })
    );
  }
};

// 로그인을 수행합니다. (사용자인증처리)
const HandleLogin = (req, res) => {
  let body = req.body;
  let userid, userpass, username;
  let sql_str;
  let htmlstream = "";
  let salt = 10;

  console.log(body.uid);
  console.log(body.pass);
  if (body.uid == "") {
    console.log("아이디가 입력되지 않아서 로그인할 수 없습니다.");
    res
      .status(600)
      .send(
        "<script>alert('아이디를 입력해주세요.'); window.location.replace('/users/auth');</script>"
      );
  } else if (body.pass == "") {
    console.log("비밀번호가 입력되지 않아서 로그인할 수 없습니다.");
    res
      .status(600)
      .send(
        "<script>alert('비밀번호를 입력해주세요.'); window.location.replace('/users/auth');</script>"
      );
  } else {
    //  let dbPassword = res.dataValues.pass;
    let inputPassword = body.pass;
    //  let salt = res.dataValues.salt;
    let hashPassword = crypto
      .createHash("sha512")
      .update(inputPassword + salt)
      .digest("hex");

    sql_str =
      "SELECT uid, pass, name from u0_users where uid ='" +
      body.uid +
      "' and pass='" +
      hashPassword +
      "';";
    console.log("SQL: " + sql_str);
    db.query(sql_str, (error, results, fields) => {
      if (error) {
        res.status(601).end("Login Fail as No id in DB!");
      } else {
        if (results.length <= 0) {
          // select 조회결과가 없는 경우 (즉, 등록계정이 없는 경우)
          htmlstream = fs.readFileSync(
            __dirname + "/../../views/common/alert.ejs",
            "utf8"
          );
          res.status(601).end(
            ejs.render(htmlstream, {
              title: "알리미",
              warn_title: "로그인 오류",
              warn_message: "등록된 계정이나 암호가 틀립니다.",
              return_url: "/users/auth",
            })
          );
        } else {
          // select 조회결과가 있는 경우 (즉, 등록사용자인 경우)
          results.forEach((item, index) => {
            userid = item.uid;
            userpass = item.pass;
            username = item.name;
            console.log("DB에서 로그인성공한 ID/암호:%s/%s", userid, userpass);
            if (body.uid == userid && hashPassword == userpass) {
              req.session.auth = 99; // 임의로 수(99)로 로그인성공했다는 것을 설정함
              req.session.who = username; // 인증된 사용자명 확보 (로그인후 이름출력용)
              if (body.uid == "admin@gachon.ac.kr") {
                req.session.admin = true;
              } // 만약, 인증된 사용자가 관리자(admin)라면 이를 표시
              res.redirect("/");
            }
          }); /* foreach */
        } // else
      } // else
    });
  }
};

// ------------------------------  로그아웃기능 --------------------------------------
const HandleLogout = (req, res) => {
  req.session.destroy(); // 세션을 제거하여 인증오작동 문제를 해결
  res.redirect("/"); // 로그아웃후 메인화면으로 재접속
};

// --------------- 정보변경 기능 --------------------
const PrintProfile = (req, res) => {
  let htmlstream = "";

  htmlstream = fs.readFileSync(
    __dirname + "/../../views/common/alert.ejs",
    "utf8"
  );
  res.status(562).end(
    ejs.render(htmlstream, {
      title: "알리미",
      warn_title: "계정정보 준비중",
      warn_message:
        "계정정보(예, 암호변경, 주소변경, 전화번호변경 등)변경기능을 추후에 개발할 예정입니다",
      return_url: "/",
    })
  );
};

// REST API의 URI와 핸들러를 매핑합니다.
router.get("/logout", HandleLogout); // 로그아웃 기능
router.get("/auth", PrintLoginForm); // 로그인 입력화면을 출력
router.post("/auth", HandleLogin); // 로그인 정보로 인증처리
router.get("/profile", PrintProfile); // 정보변경화면을 출력

module.exports = router;

// ----------------------------------------------------------
// 쇼핑몰서비스를 위한 샘플코드로, 웹DB프로그래밍 강의용입니다
// 1) node/express 프레임워크 기반
// 2) 2가지 사용자(구매자, 관리자)를 위한 서비스
// 3) MVC모델의 구현
//    - routes/admin
//      routes/user
//      routes/common
//    - views/admin
//      views/user
//      views/common
//-----------------------------------------------------------
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const createError = require("http-errors");
const path = require("path");
const ip = require("ip");
const methodeOverride = require("method-override");

// 쇼핑몰 개발소스 모듈
const mainui = require("./routes/common/mainui");
const users = require("./routes/user/users");
const product = require("./routes/user/product");
const adminprod = require("./routes/admin/adminprod");

// 쇼핑몰전용 PORT주소 설정
const PORT = 65020; // 개인 전용포트로 변경할 것!!!

// 실행환경 설정부분
app.set("views", path.join(__dirname, "views")); // views경로 설정
app.set("view engine", "ejs"); // view엔진 지정

app.use(express.static(path.join(__dirname, "public"))); // public설정
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    key: "sid",
    secret: "secret key", // 세션id 암호화할때 사용
    resave: false, // 접속할때마다 id부여금지
    saveUninitialized: true,
  })
); // 세션id사용전에는 발급금지
app.use(methodeOverride("_method"));

// URI와 핸들러를 매핑
app.use("/", mainui); // URI (/) 접속하면 mainui로 라우팅
app.use("/users", users); // URI('/users') 접속하면 users로 라우팅
app.use("/adminprod", adminprod); // URI('/adminprod') 접속하면 adminprod로 라우팅
app.use("/product", product); // URI('/product') 접속하면 product로 라우팅

// 서버를 실행합니다.
app.listen(PORT, () => {
  console.log("서버실행: localhost:" + PORT);
  console.log(`서버실행: http://${ip.address()}:` + PORT);
});

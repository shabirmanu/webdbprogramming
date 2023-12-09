const express = require("express");
const session = require("express-session");

const mysql = require("mysql");
const ejs = require("ejs");

const app = express();

app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/styles", express.static(__dirname + "/styles"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./views");

// 세션 설정
app.use(
  session({
    secret: "my_secret_key", // 이 키를 통해 세션을 암호화하여 관리합니다.
    resave: false, // 세션이 변경되지 않으면 저장소에 다시 저장하지 않음
    saveUninitialized: true, // 초기화되지 않은 세션을 저장소에 저장
    cookie: { secure: false }, // true는 https 환경에서만 쿠키가 전송됩니다.
  })
);

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "products",
  connectionLimit: 10,
});

app.listen(8080, () => {
  console.log("연결되었습니다.");
});

app.get("/", (req, res) => {
  res.render("index", {
    isAuthenticated: req.session.isAuthenticated || false,
  });
});
app.get("/about", (req, res) => {
  res.render("about", {
    isAuthenticated: req.session.isAuthenticated || false,
  });
});
app.get("/login", (req, res) => {
  res.render("login", {
    isAuthenticated: req.session.isAuthenticated || false,
  });
});
app.get("/signup", (req, res) => {
  res.render("signup", {
    isAuthenticated: req.session.isAuthenticated || false,
  });
});

app.get("/popular", (req, res) => {
  res.render("popular", {
    isAuthenticated: req.session.isAuthenticated || false,
  });
});

app.get("/sale", (req, res) => {
  res.render("sale", {
    isAuthenticated: req.session.isAuthenticated || false,
  });
});

app.get("/cart", (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;

    const exec = conn.query("Select * from cart", (err, rows) => {
      conn.release();
      console.log("SQL", exec.sql);
      if (err) {
        res.status(500).send("Error retreiving the data");
      } else {
        res.render("cart", {
          data: rows,
          isAuthenticated: req.session.isAuthenticated || false,
        });
      }
    });
  });
});

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;

  pool.getConnection((err, conn) => {
    const exec = conn.query(
      "DELETE from cart WHERE id = ?",
      [id],
      (err, rows) => {
        console.log("SQL", exec.sql);
        if (err) {
          res.json({ status: "Error" });
        } else {
          conn.release();
          res.redirect("/cart");
        }
      }
    );
  });
});

//post메서드('경로', (req, res) => {})
//경로로 post요청이 온다면 pool.getConnection
app.post("/process/cart", (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const params = req.body;
    const productname = params.productname;
    const price = params.price;

    console.log("before query!!", productname, price);

    const exec = conn.query(
      "INSERT INTO cart (productname, price) VALUES (?, ?)",
      [productname, price],
      (err, rows) => {
        conn.release();
        console.log("SQL", exec.sql);
        if (!err) {
          res.redirect("/cart");
          console.log(rows);
        } else {
          console.log("SQL Error:", err);
          res.status(500).json({ error: "An error occurred" });
        }
      }
    );
  });
});

// 회원가입 라우트
app.post("/process/signup", (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;

    const params = req.body;
    const userData = {
      username: params.username,
      password: params.password,
      email: params.email,
      gender: params.gender,
    };

    console.log(
      "before query!!",
      userData.username,
      userData.password,
      userData.email,
      userData.gender
    );

    const exec = conn.query(
      "INSERT INTO users (username, password, email, gender) VALUES (?, password(?), ?, ?)",
      [userData.username, userData.password, userData.email, userData.gender],
      (err, rows) => {
        conn.release();
        console.log("SQL", exec.sql);
        if (!err) {
          res.redirect("/login");
        } else {
          res.send("Error!");
        }
      }
    );
  });
});

app.post("/process/login", (req, res) => {
  pool.getConnection((err, conn) => {
    if (err) throw err;

    const params = req.body;
    const inputValue = params.username; // username or email
    const password = params.password;

    // 사용자 검증 쿼리 (email 또는 username과 password를 사용하여 검증)
    const exec = conn.query(
      "SELECT * FROM users WHERE (username = ?) AND password = password(?)",
      [inputValue, password],

      (err, rows) => {
        conn.release();

        if (err) {
          res.status(500).send("Database error");
          return;
        }

        if (rows.length === 0) {
          res.status(401).send("Invalid username or password");
        } else {
          req.session.isAuthenticated = true;
          res.redirect("/");
        }
      }
    );
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

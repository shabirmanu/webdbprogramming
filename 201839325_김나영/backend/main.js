const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// sql
const connection = mysql.createConnection({
  host: "localhost",
  user: "newuser",
  password: "kny080825^^",
  database: "my_db",
});

connection.connect();

connection.query("SELECT * from TODOS", (error, rows, fields) => {
  if (error) throw error;
  console.log("TODOS: ", rows);
});

// connection.end();

//apis
app.listen(8080, () => {
  console.log("8080 port 연결 성공");
});

//todos 전체조회
app.get("/posts", (req, res) => {
  const query = "SELECT * FROM TODOS";

  connection.query(query, (error, results, fields) => {
    if (error) {
      res.status(500).send("Error retrieving todos");
      console.error(error);
    } else {
      res.status(200).json(results);
    }
  });
});

//todo 상세조회
app.get(`/posts/detail/:id`, (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM TODOS WHERE id = ?";

  connection.query(query, [id], (error, results, fields) => {
    if (error) {
      res.status(500).send("Error retrieving todo");
      console.error(error);
    } else {
      if (results.length === 0) {
        res.status(404).send("Todo not found");
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

// TODOS를 날짜별로 조회
app.get("/posts/date/:date", (req, res) => {
  const date = req.params.date;
  const query = "SELECT * FROM TODOS WHERE DATE(date) = ?";

  connection.query(query, [date], (error, results, fields) => {
    if (error) {
      res.status(500).send("Error retrieving todos by date");
      console.error(error);
    } else {
      res.status(200).json(results);
    }
  });
});

//todo 추가
app.post("/posts", (req, res) => {
  const { id, title, text, date, done } = req.body;
  const query =
    "INSERT INTO TODOS (id, title, text, date, done) VALUES (?, ?, ?, ?, ?)";

  connection.query(
    query,
    [id, title, text, date, done],
    (error, results, fields) => {
      if (error) {
        res.status(500).send("Error adding new todo");
        console.error(error);
      } else {
        res.status(201).send({
          message: "Successfully added!",
          insertedId: results.insertId,
        });
      }
    },
  );
});

//todo 수정
app.put(`/posts/:id`, (req, res) => {
  const id = req.params.id;
  const { done } = req.body;

  const query = "UPDATE TODOS SET done = ? WHERE id = ?";

  connection.query(query, [done, id], (error, results, fields) => {
    if (error) {
      res.status(500).send("Error updating todo");
      console.error(error);
    } else {
      res.status(200).send("Successfully updated!");
    }
  });
});

//todo 삭제
app.delete(`/posts/:id`, (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM TODOS WHERE id = ?";

  connection.query(query, [id], (error, results, fields) => {
    if (error) {
      res.status(500).send("Error deleting todo");
      console.error(error);
    } else {
      res.status(200).send("Successfully deleted!");
    }
  });
});

//로그인
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  connection.query(query, [username, password], (error, results, fields) => {
    if (error) {
      res.status(500).send("Error retrieving user");
      console.error(error);
    } else {
      if (results.length === 1) {
        req.session.user = results[0];

        res.status(200).json({ message: "Login successful", user: results[0] });
      } else {
        // 로그인 실패
        res.status(401).json({ message: "Invalid credentials" });
      }
    }
  });
});

// 로그아웃
app.get("/logout", (req, res) => {
  req.session.destroy();

  res.status(200).json({ message: "Logout successful" });
});

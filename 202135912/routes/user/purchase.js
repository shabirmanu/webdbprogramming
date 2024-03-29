const fs = require("fs");
const express = require("express");
const ejs = require("ejs");
const url = require("url");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const dbConfig = require("../../dbconfig");
// 업로드 디렉터리를 설정한다.
// const  upload = multer({dest: __dirname + '/../uploads/products'});
const router = express.Router();

const db = mysql.createConnection(dbConfig);

//  -----------------------------------  상품 구매 리스트 기능 -----------------------------------------
// 선택한 상품 내역을 브라우져로 출력합니다.
const PrintPurchaseProd = (req, res) => {
  let htmlstream = "";
  let htmlstream2 = "";
  let sql_str, search_cat;
  console.log(req.params);
  const itemid = String(req.params.itemid);
  const query = url.parse(req.url, true).query;

  console.log(query.category);

  if (req.session.auth) {
    // 로그인된 경우에만 처리한다

    switch (query.category) {
      case "fan":
        search_cat = "선풍기";
        break;
      case "aircon":
        search_cat = "에어컨";
        break;
      case "aircool":
        search_cat = "냉풍기";
        break;
      case "fridge":
        search_cat = "냉장고";
        break;
      case "minisun":
        search_cat = "미니선풍기";
        break;
      default:
        search_cat = "선풍기";
        break;
    }

    htmlstream = fs.readFileSync(
      __dirname + "/../../views/common/header.ejs",
      "utf8"
    ); // 헤더부분
    htmlstream =
      htmlstream +
      fs.readFileSync(__dirname + "/../../views/common/navbar.ejs", "utf8"); // 사용자메뉴
    htmlstream =
      htmlstream +
      fs.readFileSync(__dirname + "/../../views/user/product.ejs", "utf8"); // 카테고리별 제품리스트
    htmlstream =
      htmlstream +
      fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8"); // Footer
    sql_str =
      "SELECT maker, pname, modelnum, rdate, price, pic from u0_products where category='" +
      search_cat +
      "' order by rdate desc;"; // 상품조회SQL

    res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });

    db.query(sql_str, (error, results, fields) => {
      // 상품조회 SQL실행
      if (error) {
        res.status(562).end("AdminPrintProd: DB query is failed");
      } else if (results.length <= 0) {
        // 조회된 상품이 없다면, 오류메시지 출력
        htmlstream2 = fs.readFileSync(
          __dirname + "/../../views/common/alert.ejs",
          "utf8"
        );
        res
          .status(562)
          .end(
            ejs.render(htmlstream2, {
              title: "알리미",
              warn_title: "상품조회 오류",
              warn_message: "조회된 상품이 없습니다.",
              return_url: "/",
            })
          );
      } else {
        // 조회된 상품이 있다면, 상품리스트를 출력
        res.end(
          ejs.render(htmlstream, {
            title: "쇼핑몰site",
            logurl: "/users/logout",
            loglabel: "로그아웃",
            regurl: "/users/profile",
            reglabel: req.session.who,
            category: search_cat,
            prodata: results,
          })
        ); // 조회된 상품정보
      } // else
    }); // db.query()
  } else {
    // (로그인하지 않고) 본 페이지를 참조하면 오류를 출력
    htmlstream = fs.readFileSync(
      __dirname + "/../../views/common/alert.ejs",
      "utf8"
    );
    res
      .status(562)
      .end(
        ejs.render(htmlstream, {
          title: "알리미",
          warn_title: "로그인 필요",
          warn_message: "상품검색을 하려면, 로그인이 필요합니다.",
          return_url: "/",
        })
      );
  }
};

// REST API의 URI와 핸들러를 매핑합니다.
router.get("/purchase", PrintPurchaseProd); // 구매할 상품리스트를 화면에 출력

module.exports = router;

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

//  -----------------------------------  상품리스트 기능 -----------------------------------------
// (관리자용) 등록된 상품리스트를 브라우져로 출력합니다.
const PrintCategoryProd = (req, res) => {
  let htmlstream = "";
  let htmlstream2 = "";
  const itemsPerPage = 10; // 한 페이지에 표시할 항목 수
  const pagesPerGroup = 5; // 한 그룹에 표시할 페이지 번호 수
  let currentPage = parseInt(req.query.page) || 1; // 현재 페이지 번호
  const countQuery = "SELECT COUNT(*) AS count FROM u0_products";
  let sql_str, search_cat, sql_count;
  const query = url.parse(req.url, true).query;
  db.query(countQuery, (error, results) => {
    if (error) {
      res.status(500).send("상품 개수 조회 오류");
      return;
    }

    const totalCount = results[0].count; // 전체 상품 개수
    const totalPage = Math.ceil(totalCount / itemsPerPage); // 전체 페이지 수

    // 현재 그룹 번호 계산
    const currentGroup = Math.ceil(currentPage / pagesPerGroup);

    // 현재 그룹의 시작 페이지 번호
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;

    // 현재 그룹의 끝 페이지 번호
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPage);

    // 현재 페이지에 해당하는 상품 목록 조회 쿼리
    const offset = (currentPage - 1) * itemsPerPage;

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
        `SELECT maker, pname, modelnum, rdate, price, pic from u0_products where category='` +
        search_cat +
        `' order by rdate desc LIMIT ${offset}, ${itemsPerPage};`; // 상품조회SQL
      sql_count = "SELECT COUNT(*) AS count FROM u0_products"; // 전체 상품 개수 조회 SQL

      db.query(sql_count, (e, r) => {
        if (e) {
          res.status(562).end("AdminPrintProd: DB query is failed1");
          console.log(e);
        }

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
                totalCount,
                totalPage,
                currentPage,
                startPage,
                endPage,
                itemsPerPage,
                pagesPerGroup,
              })
            ); // 조회된 상품정보
          } // else
        }); // db.query()
      }); //db.query(sql_count)
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
  });
};

// REST API의 URI와 핸들러를 매핑합니다.
router.get("/list", PrintCategoryProd); // 상품리스트를 화면에 출력

module.exports = router;

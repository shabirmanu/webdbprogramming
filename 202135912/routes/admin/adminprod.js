const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const app = express();
const ejs = require("ejs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const upload = multer({
  dest: __dirname + "/../../public/images/uploads/products",
}); // 업로드 디렉터리를 설정한다.
const router = express.Router();
const path = require("path");
const { error } = require("console");
const dbConfig = require("../../dbconfig");

const db = mysql.createConnection(dbConfig);

app.set("view engine", "ejs");
app.use(express.static("public"));

//  -----------------------------------  상품리스트 기능 -----------------------------------------
// (관리자용) 등록된 상품리스트를 브라우져로 출력합니다.
const AdminPrintProd = (req, res) => {
  let htmlstream = "";
  let htmlstream2 = "";
  const itemsPerPage = 10; // 한 페이지에 표시할 항목 수
  const pagesPerGroup = 5; // 한 그룹에 표시할 페이지 번호 수
  let currentPage = parseInt(req.query.page) || 1; // 현재 페이지 번호

  const countQuery = "SELECT COUNT(*) AS count FROM u0_products";
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

    let sql_str;

    if (req.session.auth && req.session.admin) {
      // 관리자로 로그인된 경우에만 처리한다
      htmlstream = fs.readFileSync(
        __dirname + "/../../views/common/header.ejs",
        "utf8"
      ); // 헤더부분
      htmlstream =
        htmlstream +
        fs.readFileSync(__dirname + "/../../views/admin/adminbar.ejs", "utf8"); // 관리자메뉴
      htmlstream =
        htmlstream +
        fs.readFileSync(
          __dirname + "/../../views/admin/adminproduct.ejs",
          "utf8"
        ); // 관리자메인화면
      htmlstream =
        htmlstream +
        fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8"); // Footer

      res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });

      const sql_str = `SELECT itemid, category, maker, pname, modelnum, rdate, price, amount from u0_products order by rdate DESC LIMIT ${offset}, ${itemsPerPage}`; // 상품조회SQL
      const sql_count = "SELECT COUNT(*) AS count FROM u0_products"; // 전체 상품 개수 조회 SQL

      db.query(sql_count, (e, r) => {
        if (e) {
          res.status(562).end("AdminPrintProd: DB query is failed1");
          console.log(e);
        }

        db.query(sql_str, (error, results, fields) => {
          // 상품조회 SQL실행
          if (error) {
            res.status(562).end("AdminPrintProd: DB query is failed2");
          } else if (results.length <= 0) {
            // 조회된 상품이 없다면, 오류메시지 출력
            htmlstream2 = fs.readFileSync(
              __dirname + "/../../views/common/alert.ejs",
              "utf8"
            );
            res.status(562).end(
              ejs.render(htmlstream2, {
                title: "알리미",
                warn_title: "상품조회 오류",
                warn_message:
                  "조회된 상품이 없습니다. 아래버튼을 누르면 상품등록으로 이동합니다",
                return_url: "/adminprod/form",
              })
            );
          } else {
            // 조회된 상품이 있다면, 상품리스트를 출력
            res.end(
              ejs.render(htmlstream, {
                title: "쇼핑몰site",
                logurl: "/users/logout",
                loglabel: "로그아웃",
                regurl: "/users/aprofile",
                reglabel: req.session.who,
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
        }); // db.query(sql_str)
      }); // db.query(sql_count)
    } // 관리자로 로그인 한 경우
    else {
      // (관리자로 로그인하지 않고) 본 페이지를 참조하면 오류를 출력
      htmlstream = fs.readFileSync(
        __dirname + "/../../views/common/alert.ejs",
        "utf8"
      );
      res.status(562).end(
        ejs.render(htmlstream, {
          title: "알리미",
          warn_title: "상품등록기능 오류",
          warn_message:
            "관리자로 로그인되어 있지 않아서, 상품등록 기능을 사용할 수 없습니다.",
          return_url: "/",
        })
      );
    }
  });
};

//  -----------------------------------  상품등록기능 -----------------------------------------
// 상품등록 입력양식을 브라우져로 출력합니다.
const PrintAddProductForm = (req, res) => {
  let htmlstream = "";

  if (req.session.auth && req.session.admin) {
    // 관리자로 로그인된 경우에만 처리한다
    htmlstream = fs.readFileSync(
      __dirname + "/../../views/common/header.ejs",
      "utf8"
    ); // 헤더부분
    htmlstream =
      htmlstream +
      fs.readFileSync(__dirname + "/../../views/admin/adminbar.ejs", "utf8"); // 관리자메뉴
    htmlstream =
      htmlstream +
      fs.readFileSync(
        __dirname + "/../../views/admin/product_form.ejs",
        "utf8"
      ); // 상품정보입력
    htmlstream =
      htmlstream +
      fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8"); // Footer

    res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
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
    htmlstream = fs.readFileSync(
      __dirname + "/../../views/common/alert.ejs",
      "utf8"
    );
    res.status(563).end(
      ejs.render(htmlstream, {
        title: "알리미",
        warn_title: "상품등록기능 오류",
        warn_message:
          "관리자로 로그인되어 있지 않아서, 상품등록 기능을 사용할 수 없습니다.",
        return_url: "/",
      })
    );
  }
};

// 상품등록 양식에서 입력된 상품정보를 신규로 등록(DB에 저장)합니다.
const HanldleAddProduct = (req, res) => {
  // 상품등록
  let body = req.body;
  let htmlstream = "";
  let datestr, y, m, d, regdate;
  let prodimage = "/images/uploads/products/"; // 상품이미지 저장디렉터리
  let picfile = req.file;
  let result = { originalName: picfile.originalname, size: picfile.size };

  console.log(body);

  if (req.session.auth && req.session.admin) {
    if (
      body.itemid == "" ||
      datestr == "" ||
      body.category == "" ||
      body.maker == "" ||
      body.pname == "" ||
      body.modelnum == "" ||
      regdate == "" ||
      body.price == "" ||
      body.dcrate == "" ||
      body.amount == "" ||
      body.event == "" ||
      prodimage
    ) {
      console.log("상품번호가 입력되지 않아 DB에 저장할 수 없습니다.");
      res
        .status(563)
        .send(
          "<script>alert('모든 항목을 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else if (body.itemid.length > 20) {
      res
        .status(563)
        .send(
          "<script>alert('상품번호는 20자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else if (body.category.length > 20) {
      res
        .status(563)
        .send(
          "<script>alert('제품분류는 20자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else if (body.maker.length > 20) {
      res
        .status(563)
        .send(
          "<script>alert('제조사명은 20자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else if (body.pname.length > 30) {
      res
        .status(563)
        .send(
          "<script>alert('상품명은 30자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else if (body.modelnum.length > 20) {
      res
        .status(563)
        .send(
          "<script>alert('모델명은 20자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else if (body.amount.length > 11) {
      res
        .status(563)
        .send(
          "<script>alert('판매가는 11자 이내로 입력해주세요.'); window.location.replace('/users/reg');</script>"
        );
    } else {
      if (body.dcrate >= 100 || body.dcrate < 0) {
        console.log("할인율은 0 ~ 99 사이의 값이어야 합니다");
        res
          .status(563)
          .send(
            "<script>alert('할인율은 0~99 사이의 값이어야 합니다.'); window.location.replace('/adminprod/list');</script>"
          );
        //res.send("<script>alert('할인율은 0~99 사이의 값이어야 합니다.');");
      } else if (body.amount >= 1000000000 || body.amount < 0) {
        console.log("수량은 0 ~ 99,999,999 사이의 값이어야 합니다.");
        res
          .status(563)
          .send(
            "<script>alert('수량은 0 ~ 99,999,999 사이의 값이어야 합니다.'); window.location.replace('/adminprod/list');</script>"
          );
        //res.send("<script>alert('수량은 0 ~ 99,999,999 사이의 값이어야 합니다.');");
      } else if (body.price >= 10000000000 || body.price < 0) {
        console.log("가격은 0 ~ 999,999,999 사이의 값이어야 합니다.");
        res
          .status(563)
          .send(
            "<script>alert('가격은 0 ~ 999,999,999 사이의 값이어야 합니다.); window.location.replace('/adminprod/list');</script>"
          );
        //res.send("<script>alert('가격은 0 ~ 999,999,999 사이의 값이어야 합니다.);");
      } else {
        prodimage = prodimage + picfile.filename;
        regdate = new Date();
        db.query(
          "INSERT INTO u0_products (itemid, category, maker, pname, modelnum,rdate,price,dcrate,amount,event,pic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
          [
            body.itemid,
            body.category,
            body.maker,
            body.pname,
            body.modelnum,
            regdate,
            body.price,
            body.dcrate,
            body.amount,
            body.event,
            prodimage,
          ],
          (error, results, fields) => {
            if (error) {
              htmlstream = fs.readFileSync(
                __dirname + "/../../views/common/alert.ejs",
                "utf8"
              );
              res.status(562).end(
                ejs.render(htmlstream, {
                  title: "알리미",
                  warn_title: "상품등록 오류",
                  warn_message:
                    "상품으로 등록할때 DB저장 오류가 발생하였습니다. 원인을 파악하여 재시도 바랍니다",
                  return_url: "/",
                })
              );
            } else {
              console.log(
                "상품등록에 성공하였으며, DB에 신규상품으로 등록하였습니다.!"
              );
              res.redirect("/adminprod/list");
            }
          }
        );
      }
    }
  } else {
    htmlstream = fs.readFileSync(
      __dirname + "/../../views/common/alert.ejs",
      "utf8"
    );
    res.status(562).end(
      ejs.render(htmlstream, {
        title: "알리미",
        warn_title: "상품등록기능 오류",
        warn_message:
          "관리자로 로그인되어 있지 않아서, 상품등록 기능을 사용할 수 없습니다.",
        return_url: "/",
      })
    );
  }
};

//  -----------------------------------  상품수정기능 -----------------------------------------
const UpdateProduct = (req, res) => {
  let body = req.body;
  let htmlstream = "";
  let picfile = req.file;
  // let    result = { originalName  : picfile.originalname,
  // size : picfile.size     }

  console.log(body);

  if (req.session.auth && req.session.admin) {
    if (
      body.itemid == "" ||
      body.category == "" ||
      body.maker == "" ||
      body.pname == "" ||
      body.modelnum == "" ||
      regdate == "" ||
      body.price == "" ||
      body.dcrate == "" ||
      body.amount == "" ||
      body.event == ""
    ) {
      console.log("상품번호가 입력되지 않아 DB에 저장할 수 없습니다.");
      res
        .status(563)
        .send(
          "<script>alert('모든 항목을 입력해주세요.'); history.back();</script>"
        );
    }
    // else if (typeof body.price != 'number' || typeof body.amount != 'number' || typeof body.dcrate != 'number') {
    //   res.status(563).send("<script>alert('판매가, 수량, 할인율은 숫자값으로 입력해주세요.'); history.back();</script>");
    // }
    else {
      // 하드코딩 X
      if (body.itemid.length > 20) {
        res
          .status(563)
          .send(
            "<script>alert('상품번호는 20자 이내로 입력해주세요.'); history.back();</script>"
          );
      } else if (body.category.length > 20) {
        res
          .status(563)
          .send(
            "<script>alert('제품분류는 20자 이내로 입력해주세요.'); history.back();</script>"
          );
      } else if (body.maker.length > 20) {
        res
          .status(563)
          .send(
            "<script>alert('제조사명은 20자 이내로 입력해주세요.'); history.back();</script>"
          );
      } else if (body.pname.length > 30) {
        res
          .status(563)
          .send(
            "<script>alert('상품명은 30자 이내로 입력해주세요.'); history.back();</script>"
          );
      } else if (body.modelnum.length > 20) {
        res
          .status(563)
          .send(
            "<script>alert('모델명은 20자 이내로 입력해주세요.'); history.back();</script>"
          );
      } else if (body.amount.length > 11) {
        res
          .status(563)
          .send(
            "<script>alert('판매가는 11자 이내로 입력해주세요.'); history.back();</script>"
          );
      } else {
        if (body.dcrate >= 100 || body.dcrate < 0) {
          console.log("할인율은 0 ~ 99 사이의 값이어야 합니다");
          res
            .status(563)
            .send(
              "<script>alert('할인율은 0~99 사이의 값이어야 합니다.'); window.location.replace('/adminprod/list');</script>"
            );
          //res.send("<script>alert('할인율은 0~99 사이의 값이어야 합니다.');");
        } else if (body.amount >= 1000000000 || body.amount < 0) {
          console.log("수량은 0 ~ 99,999,999 사이의 값이어야 합니다.");
          res
            .status(563)
            .send(
              "<script>alert('수량은 0 ~ 99,999,999 사이의 값이어야 합니다.'); window.location.replace('/adminprod/list');</script>"
            );
          //res.send("<script>alert('수량은 0 ~ 99,999,999 사이의 값이어야 합니다.');");
        } else if (body.price >= 10000000000 || body.price < 0) {
          console.log("가격은 0 ~ 999,999,999 사이의 값이어야 합니다.");
          res
            .status(563)
            .send(
              "<script>alert('가격은 0 ~ 999,999,999 사이의 값이어야 합니다.); window.location.replace('/adminprod/list');</script>"
            );
          //res.send("<script>alert('가격은 0 ~ 999,999,999 사이의 값이어야 합니다.);");
        } else {
          // prodimage = prodimage + picfile.filename;
          // regdate = new Date();
          db.query(
            "UPDATE u0_products SET category =?, maker=?, pname=?, modelnum=?, price=?, dcrate=?, amount=?, event=? WHERE itemid=? ;",
            [
              body.category,
              body.maker,
              body.pname,
              body.modelnum,
              body.price,
              body.dcrate,
              body.amount,
              body.event,
              body.itemid,
            ],
            (error, results, fields) => {
              if (error) {
                console.log(error);
                htmlstream = fs.readFileSync(
                  __dirname + "/../../views/common/alert.ejs",
                  "utf8"
                );
                return res.status(562).end(
                  ejs.render(htmlstream, {
                    title: "알리미",
                    warn_title: "상품수정 오류",
                    warn_message:
                      "상품을 수정할 때 DB저장 오류가 발생하였습니다. 원인을 파악하여 재시도 바랍니다",
                    return_url: "/adminprod/list",
                  })
                );
              } else {
                console.log(
                  "상품수정에 성공하였으며, DB에 변경된 정보를 수정하였습니다.!"
                );
                return res.send(
                  "<script>alert('수정되었습니다.'); window.location.replace('/adminprod/list');</script>"
                );
                // return res.redirect('/adminprod/list');
              }
            }
          );
        }
      }
    }
  }
};

// 상품수정 입력양식을 브라우져로 출력합니다.
const PrintUpdateProductForm = (req, res) => {
  let htmlstream = "";
  console.log(req.params);
  const itemid = String(req.params.itemid);
  db.query(
    "SELECT * FROM u0_products WHERE itemid = ?",
    [itemid],
    (error, result) => {
      if (error) {
        htmlstream = fs.readFileSync(
          __dirname + "/../../views/common/alert.ejs",
          "utf8"
        );
        res.status(562).end(
          ejs.render(htmlstream, {
            title: "알리미",
            warn_title: "상품수정화면 출력 오류",
            warn_message:
              "상품수정화면 출력에 오류가 발생하였습니다. 원인을 파악하여 재시도 바랍니다",
            return_url: "/adminprod/list",
          })
        );
      } else {
        htmlstream = fs.readFileSync(
          __dirname + "/../../views/common/header.ejs",
          "utf8"
        ); // 헤더부분
        htmlstream =
          htmlstream +
          fs.readFileSync(
            __dirname + "/../../views/admin/adminbar.ejs",
            "utf8"
          ); // 관리자메뉴
        htmlstream =
          htmlstream +
          fs.readFileSync(
            __dirname + "/../../views/admin/update_form.ejs",
            "utf8"
          ); // 상품정보입력
        htmlstream =
          htmlstream +
          fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8"); // Footer

        console.log(result);

        // res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});
        res.end(
          ejs.render(htmlstream, {
            title: "쇼핑몰site",
            logurl: "/users/logout",
            loglabel: "로그아웃",
            regurl: "/users/profile",
            reglabel: req.session.who,
            item: result[0],
          })
        );
      }
    }
  );
};

//  -----------------------------------  상품삭제기능 -----------------------------------------
const DeleteProduct = (req, res) => {
  const prodStr = req.body.checkedArr.join("', '");
  const sql_delete = "DELETE FROM u0_products WHERE itemid IN ('"; // 상품삭제SQL
  // console.log(sql_delete + prodStr + "');");
  // 서버 내의 사진까지 삭제하는 기능 필요 (추후 개발 요망)

  db.query(sql_delete + prodStr + "');", (error, results, fields) => {
    console.log(results);
    console.log(results.affectedRows);
    if (error) {
      return res.status(564).end("AdminPrintUsers: DB Query is failed");
    }
    // affectedRows === 0 일 경우 result: false
    if (results.affectedRows === 0) {
      return res.json({
        result: false,
      });
    } else {
      return res.json({
        result: true,
      });
    }
  });
};

//  -----------------------------------  회원리스트 기능 -----------------------------------------
// (관리자용) 등록된 회원리스트를 브라우져로 출력합니다.
const AdminPrintUsers = (req, res) => {
  let htmlstream = "";
  let htmlstream2 = "";
  const itemsPerPage = 10; // 한 페이지에 표시할 항목 수
  const pagesPerGroup = 5; // 한 그룹에 표시할 페이지 번호 수
  let currentPage = parseInt(req.query.page) || 1; // 현재 페이지 번호

  const countQuery = "SELECT COUNT(*) AS count FROM u0_users";
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

    if (req.session.auth && req.session.admin) {
      // 관리자로 로그인된 경우에만 처리한다
      htmlstream = fs.readFileSync(
        __dirname + "/../../views/common/header.ejs",
        "utf8"
      ); // 헤더부분
      htmlstream =
        htmlstream +
        fs.readFileSync(__dirname + "/../../views/admin/adminbar.ejs", "utf8"); // 관리자메뉴
      htmlstream =
        htmlstream +
        fs.readFileSync(
          __dirname + "/../../views/admin/adminuserlist.ejs",
          "utf8"
        ); // 관리자회원리스트메뉴
      htmlstream =
        htmlstream +
        fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8"); // Footer

      const sql_str = `SELECT uid, pass, name, phone, address, point from u0_users order by rdate desc LIMIT ${offset}, ${itemsPerPage};`; // 상품조회SQL
      const sql_count = "SELECT COUNT(*) AS count FROM u0_users"; // 전체 상품 개수 조회 SQL

      res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });

      db.query(sql_count, (e, r) => {
        if (e) {
          res.status(562).end("AdminPrintProd: DB query is failed1");
          console.log(e);
        }

        db.query(sql_str, (error, results, fields) => {
          // 회원조회 SQL실행
          if (error) {
            res.status(564).end("AdminPrintUsers: DB query is failed");
          } else if (results.length <= 0) {
            htmlstream2 = fs.readFileSync(
              __dirname + "/../../views/common/alert.ejs",
              "utf8"
            );
            res.status(564).end(
              ejs.render(htmlstream2, {
                title: "알리미",
                warn_title: "사용자조회 오류",
                warn_message: "조회된 사용자가 없습니다.",
                return_url: "/",
              })
            );
          } else {
            res.end(
              ejs.render(htmlstream, {
                title: "쇼핑몰site",
                logurl: "/users/logout",
                loglabel: "로그아웃",
                regurl: "/users/profile",
                reglabel: req.session.who,
                prodata: results,
                totalCount,
                totalPage,
                currentPage,
                startPage,
                endPage,
                itemsPerPage,
                pagesPerGroup,
              })
            );
          }
        });
      });
    } else {
      // (관리자로 로그인하지 않고) 본 페이지를 참조하면 오류를 출력
      htmlstream = fs.readFileSync(
        __dirname + "/../../views/common/alert.ejs",
        "utf8"
      );
      res.status(562).end(
        ejs.render(htmlstream, {
          title: "알리미",
          warn_title: "상품등록기능 오류",
          warn_message:
            "관리자로 로그인되어 있지 않아서, 리스트 기능을 사용할 수 없습니다.",
          return_url: "/",
        })
      );
    }
  });
};

//  -----------------------------------  회원수정기능 -----------------------------------------
const UpdateUser = (req, res) => {
  let body = req.body;
  let htmlstream = "";

  console.log(body);

  if (req.session.auth && req.session.admin) {
    // if (body.dcrate >= 100 || body.dcrate < 0) {
    //   console.log("할인율은 0 ~ 99 사이의 값이어야 합니다");
    //   res.status(563).send("<script>alert('할인율은 0~99 사이의 값이어야 합니다.'); window.location.replace('/adminprod/list');</script>");
    // }
    // let salt = 10;
    // let inputPassword = body.pass;
    // let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");
    if (
      body.uid == "" ||
      body.uname == "" ||
      body.uphone == "" ||
      body.uaddress == "" ||
      body.upoint == ""
    ) {
      console.log("데이터입력이 되지 않아 DB에 저장할 수 없습니다.");
      res
        .status(600)
        .send(
          "<script>alert('항목이 입력되지 않았습니다.'); window.location.replace('/adminprod/ulist');</script>"
        );
    } else if (body.uid.length > 20) {
      res
        .status(600)
        .send(
          "<script>alert('아이디는 20자 이내로 입력해주세요.'); window.location.replace('/adminprod/ulist');</script>"
        );
    } else if (body.uname.length > 20) {
      res
        .status(600)
        .send(
          "<script>alert('이름은 20자 이내로 입력해주세요.'); window.location.replace('/adminprod/ulist');</script>"
        );
    } else if (body.uphone.length > 15) {
      res
        .status(600)
        .send(
          "<script>alert('전화번호는 15자 이내로 입력해주세요.'); window.location.replace('/adminprod/ulist');</script>"
        );
    } else if (body.uaddress.length > 100) {
      res
        .status(600)
        .send(
          "<script>alert('주소는 100자 이내로 입력해주세요.'); window.location.replace('/adminprod/ulist');</script>"
        );
    } else if (body.upoint.length > 11) {
      res
        .status(600)
        .send(
          "<script>alert('보유 포인트는 11자 이내로 입력해주세요.'); window.location.replace('/adminprod/ulist');</script>"
        );
    } else {
      db.query(
        "UPDATE u0_users SET name=?, phone=?, address=?, point=? WHERE uid=? ;",
        [body.uname, body.uphone, body.uaddress, body.upoint, body.uid],
        (error, results, fields) => {
          if (error) {
            console.log(error);
            htmlstream = fs.readFileSync(
              __dirname + "/../../views/common/alert.ejs",
              "utf8"
            );
            return res.status(562).end(
              ejs.render(htmlstream, {
                title: "알리미",
                warn_title: "회원수정 오류",
                warn_message:
                  "회원을 수정할 때 DB저장 오류가 발생하였습니다. 원인을 파악하여 재시도 바랍니다",
                return_url: "/adminprod/ulist",
              })
            );
          } else {
            console.log(
              "회원수정에 성공하였으며, DB에 변경된 정보를 수정하였습니다.!"
            );
            return res.send(
              "<script>alert('수정되었습니다.'); window.location.replace('/adminprod/ulist');</script>"
            );
          }
        }
      );
    }
  }
};

// 회원수정 입력양식을 브라우져로 출력합니다.
const PrintUpdateUserForm = (req, res) => {
  let htmlstream = "";
  console.log(req.params);
  const uid = String(req.params.uid);
  db.query("SELECT * FROM u0_users WHERE uid = ?", [uid], (error, result) => {
    if (error) {
      htmlstream = fs.readFileSync(
        __dirname + "/../../views/common/alert.ejs",
        "utf8"
      );
      res.status(562).end(
        ejs.render(htmlstream, {
          title: "알리미",
          warn_title: "회원수정화면 출력 오류",
          warn_message:
            "회원수정화면 출력에 오류가 발생하였습니다. 원인을 파악하여 재시도 바랍니다",
          return_url: "/",
        })
      );
    } else {
      htmlstream = fs.readFileSync(
        __dirname + "/../../views/common/header.ejs",
        "utf8"
      ); // 헤더부분
      htmlstream =
        htmlstream +
        fs.readFileSync(__dirname + "/../../views/admin/adminbar.ejs", "utf8"); // 관리자메뉴
      htmlstream =
        htmlstream +
        fs.readFileSync(
          __dirname + "/../../views/admin/update_user.ejs",
          "utf8"
        ); // 회원정보입력
      htmlstream =
        htmlstream +
        fs.readFileSync(__dirname + "/../../views/common/footer.ejs", "utf8"); // Footer

      console.log(result);

      // res.writeHead(200, {'Content-Type':'text/html; charset=utf8'});
      res.end(
        ejs.render(htmlstream, {
          title: "쇼핑몰site",
          logurl: "/users/logout",
          loglabel: "로그아웃",
          regurl: "/users/profile",
          reglabel: req.session.who,
          user: result[0],
        })
      );
    }
  });
};

//  -----------------------------------  회원삭제기능 -----------------------------------------
const DeleteUser = (req, res) => {
  const prodStr = req.body.checkedArr.join("', '");
  const sql_delete = "DELETE FROM u0_users WHERE uid IN ('"; // 상품삭제SQL
  // console.log(sql_delete + prodStr + "');");
  // 서버 내의 사진까지 삭제하는 기능 필요 (추후 개발 요망)

  db.query(sql_delete + prodStr + "');", (error, results, fields) => {
    console.log(results);
    console.log(results.affectedRows);
    if (error) {
      return res.status(564).end("AdminPrintUsers: DB Query is failed");
    }
    // affectedRows === 0 일 경우 result: false
    if (results.affectedRows === 0) {
      return res.json({
        result: false,
      });
    } else {
      return res.json({
        result: true,
      });
    }
  });
};

// --------------- 정보변경 기능 --------------------
const PrintAdminProfile = (req, res) => {
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

//목록 출력 페이징

// REST API의 URI와 핸들러를 매핑합니다.
router.get("/list", AdminPrintProd); // 상품리스트를 화면에 출력
router.get("/form", PrintAddProductForm); // 상품등록화면을 출력처리
router.post("/product", upload.single("photo"), HanldleAddProduct); // 상품등록내용을 DB에 저장처리
router.delete("/product", DeleteProduct); // 상품을 DB에서 삭제
router.get("/ulist", AdminPrintUsers); // 회원리스트를 화면에 출력
router.post("/productForm", UpdateProduct); // 상품을 DB에서 수정
router.get("/updateForm/:itemid", PrintUpdateProductForm); // 상품 수정 페이지를 불러옴
router.delete("/user", DeleteUser); // 회원을 DB에서 삭제
router.get("/updateUser/:uid", PrintUpdateUserForm); // 회원 수정 페이지를 불러옴
router.post("/updateForm", UpdateUser); // 회원을 DB에서 수정

module.exports = router;

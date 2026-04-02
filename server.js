let express = require("express");

let app = express();


app.set("view engine", "ejs");


app.use(express.static("public"));

app.get("/", function (req, res) {

  return res.render("homepage");
});


app.get("/sale", function (req, res) {

  return res.render("sale");
});

app.get("/men", function (req, res) {

  return res.render("men");
});

app.get("/women", function (req, res) {

  return res.render("women");
});

app.get("/kids", function (req, res) {

  return res.render("kids");
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
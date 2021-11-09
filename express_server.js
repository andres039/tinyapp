const express = require("express");
const app = express();
const PORT = 3005;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// app.use(express.urlencoded());
app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  const str = "0123456789abcdefghijklmnopqrstuvwxyz";
  let randomArray = [];
  for (let i = 0; i < 6; i++) {
    randomArray.push(str[Math.floor(Math.random() * 35)]);
  }
  return randomArray.join("");
}

app.get("/urls", (req, res) => {
  console.log('URL:', urlDatabase)
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL
  res.redirect(`/urls/${randomString}`);
});   

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]  
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const express = require("express");
const app = express();
const PORT = 3004;
app.use(express.urlencoded());
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", { urlDatabase });
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL
  console.log(req.body); // Log the POST request body to the console
  console.log(urlDatabase)
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

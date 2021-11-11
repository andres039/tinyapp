const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(express.urlencoded());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};
const lookUpEmail = (objectOfObjects, email) => {  
  
  for (const user in objectOfObjects) {
    if (Object.values(objectOfObjects[user]).includes(email)) {
      return true
    } 
  }
}
app.post("/register", (req, res) => {

    if (lookUpEmail(users, req.body.email)) {
      return res.status(404).send("404 \n That email is already in use");
    }
  if (req.body.email) {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res
      .status(404)
      .send(
        "404 \n You know what you did!... \n if you do not, how about we enter an email address?"
      );
  }
});
app.get("/login", (req, res) => {

  res.render('user_login')
});
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});
//post only posts to back end get displays things send template bars check browser
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updateURL;
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("user-registration", templateVars);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { lookUpByEmail, lookUpEmail } = require("./helpers.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
    password: bcrypt.hashSync("123", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10),
  },
};

const urlsForUser = function (database, id) {
  let usersUrls = {};
  for (let urls in database) {
    if (database[urls]["userID"] === id) {
      usersUrls[urls] = database[urls];
    }
  }
  return usersUrls;
};

app.post("/register", (req, res) => {
  if (lookUpEmail(users, req.body.email)) {
    return res.status(404).send("404 \n That email is already in use");
  }
  if (req.body.email) {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: req.body.email,
      //hash the password
      password: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = userId;
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
  const templateVars = { user: req.session.user_id };
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  if (!lookUpEmail(users, req.body.email)) {
    return res
      .status(403)
      .send("403 \n That email address is not registered. 🔕");
  }
  let id = lookUpByEmail(users, req.body.email);
  if (!bcrypt.compareSync(req.body.password, users[id].password)) {
    return res
      .status(403)
      .send("403 \n That password doesn't correspond, please try again. 🔕");
  }

  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const usersUrls = urlsForUser(urlDatabase, req.session.user_id);
    const templateVars = { urls: usersUrls, user: users[req.session.user_id] };
    return res.render("urls_index", templateVars);
  } else {
    res.render("welcome", { user: undefined });
  }
});

app.get("/urls/new", (req, res) => {
  const usersUrls = urlsForUser(urlDatabase, req.session.user_id);
  const templateVars = { urls: usersUrls, user: users[req.session.user_id] };
  console.log("users urls:", usersUrls);
  req.session.user_id !== undefined
    ? res.render("urls_new", templateVars)
    : res.redirect("/register");
});

//edit endpoint
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.updateURL;
    return res.redirect("/urls");
  } else res.send("Please log in to make any changes");
});

//add new urls
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  if (req.session.user_id !== undefined) {
    urlDatabase[randomString] = {};
    urlDatabase[randomString]["longURL"] = req.body.longURL;
    urlDatabase[randomString]["userID"] = req.session.user_id;
    console.log("from /urls urlDatabase :", urlDatabase);
    return res.redirect(`/urls/${randomString}`);
  }
  res.send("You must be logged in to add URLs");
});

//delete URLs

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("urlDatabase:", urlDatabase);
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  } else {
    res.send("Please log in to make any changes");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]["longURL"].includes("https://")
    ? urlDatabase[shortURL]["longURL"]
    : "https://" + urlDatabase[shortURL]["longURL"];

  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render("user-registration", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

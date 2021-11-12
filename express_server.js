const express = require("express");
const app = express();
const PORT = 8081;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {
  lookUpByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers.js");
const { urlDatabase, users } = require("./generalData");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.set("view engine", "ejs");

//endpoints:

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (lookUpByEmail(users, email)) {
    return res.status(404).send("<h2>404 \n That email is already in use</h2>");
  }

  if (email && password) {
    const userId = generateRandomString();
    users[userId] = {
      id: userId,
      email: email,
      //hash the password
      password: bcrypt.hashSync(password, 10),
    };
    req.session.user_id = userId;
    res.redirect("/urls");
  } else {
    res
      .status(404)
      .send(
        "<h1>404 \n You know what you did!... \n if you do not, how about we enter an email address or password? 🔕</h1>"
      );
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render("user_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;

  if (!lookUpByEmail(users, email)) {
    return res
      .status(403)
      .send("<h2>403 \n That email address is not registered. 🔕</h2>");
  }
  let id = lookUpByEmail(users, email);
  //verifies hashed password
  if (!bcrypt.compareSync(req.body.password, users[id].password)) {
    return res
      .status(403)
      .send("<h2>403 \n The password doesn't match 🔥, please try again. 🔕</h2>");
  }

  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    const usersUrls = urlsForUser(urlDatabase, userID);
    const templateVars = { urls: usersUrls, user: users[userID] };

    return res.render("urls_index", templateVars);
  } else {
    res.render("welcome", { user: undefined });
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const usersUrls = urlsForUser(urlDatabase, userID);
  const templateVars = { urls: usersUrls, user: users[userID] };

  userID ? res.render("urls_new", templateVars) : res.redirect("/register");
});

//edit endpoint
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL]["longURL"] = req.body.updateURL;
    return res.redirect("/urls");
  }  res.send("<h2>Please log in to make any changes</h2>");
});

//add new urls
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const userID = req.session.user_id;

  if (userID) {
    urlDatabase[randomString] = {};
    urlDatabase[randomString]["longURL"] = req.body.longURL;
    urlDatabase[randomString]["userID"] = userID;

    return res.redirect(`/urls/${randomString}`);
  }

  res.send("</h2>You must be logged in to add URLs</h2>");
});

//delete URLs

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  } else {
    res.send("<h2>Please log in to make any changes</h2>");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.send("<h2>Please log in to make any changes</h2>");
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.send('Invalid short URL')
  }
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("<h1>That short URL is not real... yet</h1>");
  }
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

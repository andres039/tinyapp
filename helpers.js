// 

const lookUpByEmail = function (objectOfObjects, e_mail) {
  let userId;
  for (const user in objectOfObjects) {
    if (objectOfObjects[user].email === e_mail) {
      userId = user;
    }
  }
  return userId;
};


function generateRandomString() {
  const str = "0123456789abcdefghijklmnopqrstuvwxyz";
  let randomArray = [];
  for (let i = 0; i < 6; i++) {
    randomArray.push(str[Math.floor(Math.random() * 35)]);
  }
  return randomArray.join("");
}

//allocates the specific urls for the current user
const urlsForUser = function (database, id) {
  let usersUrls = {};
  for (let urls in database) {
    if (database[urls]["userID"] === id) {
      usersUrls[urls] = database[urls];
    }
  }
  return usersUrls;
};

module.exports = { lookUpByEmail, generateRandomString, urlsForUser };

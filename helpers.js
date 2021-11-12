const lookUpByEmail = function (objectOfObjects, themail) {
  let userId;
  for (const user in objectOfObjects) {
    if (objectOfObjects[user].email === themail) {
      userId = user;
    }
  }
  return userId;
};

const lookUpEmail = (objectOfObjects, email) => {
  for (const user in objectOfObjects) {
    if (Object.values(objectOfObjects[user]).includes(email)) {
      return true;
    }
  }
};

module.exports = { lookUpEmail, lookUpByEmail };

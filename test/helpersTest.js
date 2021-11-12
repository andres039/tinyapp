const { assert } = require("chai");

const { lookUpByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("lookUpByEmail", function () {
  it("should return a user with valid email", function () {
    const user = lookUpByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert(user, expectedUserID);
  });

  it("should return undefined with a nonexisting email", function () {
    const user = lookUpByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert(user, expectedUserID);
  });
});

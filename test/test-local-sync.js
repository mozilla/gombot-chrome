var GombotModules = require("./modules");
var Gombot;
var initDone = false;

function init(callback) {
  Gombot = require("./gombot")(GombotModules);
  Gombot.init({ storeName: STORE_NAME, callback: function() { callback(); }});
}

var LocalStorage = GombotModules.LocalStorage();
var _ = GombotModules._;

function generateTestEmail() {
  return "test+"+Math.floor((1+Math.random())*1000000)+"@test.com";
}

function getTestCollector(num, callback) {
  return _.after(num, function(test, passed) {
    callback(test, passed);
  });
}

function getStorageKeyForUser(model) {
  return STORE_NAME+"-"+model.id;
}

function validateUserAgainstLocalStorage(test, user, callback) {
  var passed = true;
  var cb = getTestCollector(2, callback);
  // Check that user was written to list of records
  LocalStorage.getItem(STORE_NAME, function(store) {
    var records = (store && store.split(",")) || [];
    passed = passed && (records.indexOf(user.id) >= 0);
    cb(test, passed);
  });
  LocalStorage.getItem(getStorageKeyForUser(user), function(json) {
    var attrs = JSON.parse(json);
    passed = passed && (user.get("email").length > 0) && (user.get("email") === attrs.email);
    passed = passed && (user.get("version").length > 0) && (user.get("version") === attrs.version)
    passed = passed && (user.id.length > 0) && (user.id === attrs.id);
    passed = passed && (attrs.ciphertext.length > 0);
    passed = passed && (typeof attrs.pin === "undefined"); // pin should be missing
    cb(test, passed);
  });
}

function asyncTestChecker(test, passed) {
  if (passed) test.pass();
  else test.fail();
  test.done();
}

function createUser(options) {
  options = options || {};
  var email = generateTestEmail();
  var user = new Gombot.User({ email: email, pin: TEST_PIN });
  // TODO: throw in one login entry here
  var o = _.clone(options);
  user.save(null, _.extend(o, { success: function() {
    if (options.success) options.success(user)
    if (options.callback) options.callback(user);
  }}));
}

STORE_NAME = "testUsers";
TEST_PASSWORD = "pässwörd";
TEST_PIN = "1234";

exports.testCreate = function(test) {
  init(function() {
    createUser({
      success: function(user) {
        validateUserAgainstLocalStorage(test, user, asyncTestChecker);
      },
      error: function(err) {
        console.log("error:", err);
        test.fail();
        test.done();
      },
      password: TEST_PASSWORD
    });
  });
  test.waitUntilDone();
};

exports.testCreateThenFetch = function(test) {
  init(function() {
    createUser({
      callback: function(user) {
        var u = new Gombot.User({ id: user.id });
        u.fetch({
          password: TEST_PASSWORD,
          success: function() {
            test.pass();
            test.done();
          },
          error: function(err) {
            console.log("error:", err);
            test.fail();
            test.done();
          }
        });
      },
      password: TEST_PASSWORD
    });
  });
  test.waitUntilDone();
};

exports.testUpdateThenFetch = function(test) {
  test.pass();
  test.done();
};

exports.testCreateThenDestroy = function(test) {
  test.pass();
  test.done();
};
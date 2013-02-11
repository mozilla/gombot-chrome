var SpecHelpers = function(Gombot) {
  var LocalStorage = Gombot.LocalStorage;
  var User = Gombot.User;
  var self = {
    STORE_NAME: "usersTest",
    TEST_PASSWORD: "pässwörd",
    TEST_PIN: "1234",

    generateTestEmail: function() {
      return "test+"+Math.floor((1+Math.random())*1000000)+"@test.com";
    },

    getLocalStorageKeyForUser: function(model) {
      return this.STORE_NAME+"-"+model.id;
    },

    getLocalStorageItem: function(name) {
      var dfd = Q.defer();
      console.log(LocalStorage, name);
      LocalStorage.getItem(name, function(value) {
        console.log("LS", value);
        dfd.resolve(value);
      });
      return dfd.promise;
    },

    validateUserAgainstLocalStorage: function(user) {
      describe("User model matches data in LocalStorage", function() {
        it("should have created a record for the User", function() {
          var indexOfUserRecord = -1;
          runs(function() {
            LocalStorage.getItem(self.STORE_NAME, function(store) {
              var records = (store && store.split(",")) || [];
              indexOfUserRecord = records.indexOf(user.id) >= 0
            });
          });
          waitsFor(function() { return indexOfUserRecord >=0; },
                   "Could not find User record",
                   100);
        });
      });
      // LocalStorage.getItem(getStorageKeyForUser(user), function(json) {
      //   var attrs = JSON.parse(json);
      //   passed = passed && (user.get("email").length > 0) && (user.get("email") === attrs.email);
      //   passed = passed && (user.get("version").length > 0) && (user.get("version") === attrs.version)
      //   passed = passed && (user.id.length > 0) && (user.id === attrs.id);
      //   passed = passed && (attrs.ciphertext.length > 0);
      //   passed = passed && (typeof attrs.pin === "undefined"); // pin should be missing
      //   cb(test, passed);
      // });
    },

    createUser: function(options) {
      var dfd = Q.defer();
      options = options || {};
      var email = options.email || self.generateTestEmail();
      var user = new User({ email: email, pin: self.TEST_PIN });
      // TODO: throw in one login entry here
      var o = _.clone(options);
      user.save(null, _.extend(o, { success: function() {
        dfd.resolve(user);
      }, error: function(err) {
        dfd.reject(err);
      }}));
      return dfd.promise;
    }
  };
  return self;
};
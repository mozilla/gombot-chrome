var SpecHelpers = function(Gombot) {
  var LocalStorage = Gombot.LocalStorage;
  var User = Gombot.User;
  var self = {
    LOCAL_STORAGE_STORE_NAME: "usersTest",
    TEST_PASSWORD: "pässwörd",
    TEST_PIN: "1234",

    generateTestEmail: function() {
      return "test+"+Math.floor((1+Math.random())*1000000)+"@test.com";
    },

    // returns promise for parsed user data
    getUserDataFromStore: function(storeType, model) {
      if (storeType === 'localStorage') {
        return Q.all([
          self.getLocalStorageItem(self.LOCAL_STORAGE_STORE_NAME),
          self.getLocalStorageItem(self.getLocalStorageKeyForUser(model))
        ]).
        then(function(values) {
          var store = values[0];
          var records = (store && store.split(",")) || [];
          if (records.indexOf(model.id) >= 0) {
            // return promise for parsed user data
            return Q.when(JSON.parse(values[1]));
          } else {
            throw new Error("Can't find user record in store");
          }
        });
      }
    },

    getLocalStorageKeyForUser: function(model) {
      return this.LOCAL_STORAGE_STORE_NAME+"-"+model.id;
    },

    getLocalStorageItem: function(name) {
      var dfd = Q.defer();
      LocalStorage.getItem(name, function(value) {
        dfd.resolve(value);
      });
      return dfd.promise;
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
var SpecHelpers = function(Gombot) {
  var LocalStorage = Gombot.LocalStorage;
  var User = Gombot.User;
  var LoginCredential = Gombot.LoginCredential;
  var self = {
    LOCAL_STORAGE_STORE_NAME: "usersTest",
    FIREBASE_STORE_NAME: "usersTest",
    TEST_PASSWORD: "pässwörd",
    TEST_PIN: "1234",
    TEST_LOGIN_CRED: { username: "gombot.test", password: "foobar", title: "Example", loginurl: "https://www.example.com/login" },
    TEST_LOGIN_CRED2: { username: "gömbottest", password: "pässwörd2", title: "AnotherExample", loginurl: "https://www.anotherexample.co.uk/login" },

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
      delete options.email;
      var user = new User({ email: email, pin: self.TEST_PIN });
      user.get("logins").
        add(new LoginCredential(self.TEST_LOGIN_CRED));
      var o = _.clone(options);
      user.save(null, _.extend(o, { success: function() {
        dfd.resolve(user);
      }, error: function(model, err, options) {
        dfd.reject(err);
      }}));
      return dfd.promise;
    },

    fetchUser: function(options) {
      var dfd = Q.defer();
      var user = options.user || new User({ id: options.id, email: options.email });
      delete options.user;
      var o = _.clone(options);
      user.fetch(_.extend(o, { success: function() {
        dfd.resolve(user);
      }, error: function(model, err, options) {
        dfd.reject(err);
      }}));
      return dfd.promise;
    },

    saveUser: function(options) {
      var dfd = Q.defer();
      var user = options.user;
      delete options.user;
      var o = _.clone(options);
      user.save(null, _.extend(o, { success: function() {
        dfd.resolve(user);
      }, error: function(model, err, options) {
        dfd.reject(err);
      }}));
      return dfd.promise;
    },

    deleteUser: function(options) {
      var dfd = Q.defer();
      var user = options.user;
      delete options.user;
      var o = _.clone(options);
      user.destroy(_.extend(o, { success: function() {
        dfd.resolve(user);
      }, error: function(model, err, options) {
        dfd.reject(err);
      }}));
      return dfd.promise;
    },

    newLoginCredential: function(attrs) {
      attrs = attrs || {};
      return new LoginCredential(attrs);
    }

  };
  return self;
};
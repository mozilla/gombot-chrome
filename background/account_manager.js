var AccountManager = function(Gombot, _) {

  function createAccount(details, cb) {
    var userCollection = Gombot.users;

    var user = new Gombot.User({
      'email': details.email,
      'pin': details.pin
    });

    user.save(null, {
      success: function() {
        Gombot.setCurrentUser(user);
        userCollection.add(user);
        cb(null);
      },
      error: function(args) {
        cb(args);
      },
      password: details.password,
      newsletter: details.newsletter
    });
  }

  function signIn(details, cb) {
    var userCollection = Gombot.users;
    var user = userCollection.find(function(obj) {
                return obj.get('email') === details.email;
              }) || new Gombot.User({ email: details.email });

    user.fetch({
      success: function() {
        Gombot.setCurrentUser(user);
        userCollection.add(user);
        cb(null);
      },
      error: function(args) {
        var err = args;
        if (err === "Record not found") {
          details.pin = "1111"; // hack a pin for now
          return createAccount(details, cb);
        }
        else {
          cb(err);
        }
      },
      password: details.password
    });
  }

  return {
    createAccount: createAccount,
    signIn: signIn
  };
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = AccountManager;
}
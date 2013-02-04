exports.testCreate = function(test) {
  var GombotModules = require("./modules");
  var Gombot = require("./gombot")(GombotModules);

  Gombot.init({ storeName: "testUsers", callback: function() {
    var email = "test+"+Math.floor((1+Math.random())*10000)+"@test.com";
    var u = new Gombot.User({ email: email });
    u.save(null, { success: function() {
                    console.log("user saved", u);
                    test.pass();
                    test.done();
                   },
                   error: function(err) {
                     console.log("error:", err);
                     test.fail();
                     test.done();
                   },
                   password: "foobar"
                 });
  }});
  test.waitUntilDone();
}
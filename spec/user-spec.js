function runUserSpec() {
  describe("User", function() {
    describe("#create", function() {
      var userPromise = null,
          testEmail = SH.generateTestEmail();
      before(function() {
        userPromise = SH.createUser({ password: SH.TEST_PASSWORD, email: testEmail });
      });

      it("should create a model with the attributes used to create it", function() {
        return Q.all([
          userPromise.should.eventually.be.an("object"),
          userPromise.should.eventually.have.property("id"),
          userPromise.should.eventually.have.deep.property("attributes.email", testEmail),
          userPromise.should.eventually.have.deep.property("attributes.pin", SH.TEST_PIN)
        ]);
      });

      it("should create a record for the model in persistent storage that contains the user's data", function() {
        return userPromise.then(function(u) {
          return SH.getUserDataFromStore('localStorage', u);
        })
        .then(function(attrs) {
          var user = userPromise.valueOf();
          console.log(attrs, user); // check user.get("email is not null")
          return attrs.should.have.property("email", user.get("email"))
          // Q.all([
          // attrsPromise.should.eventually.have.property("email", userPromise.valueOf().get("emailf")),
          // attrsPromise.should.eventually.have.property("version", userPromise.valueOf().get("version")),
          // attrsPromise.should.eventually.have.property("id", useruser.get("id")),
          // attrsPromise.should.eventually.have.property("ciphertext"),
          // attrsPromise.should.not.eventually.have.property("pin")
          //]);
        });
      });

//      if("the user data in local storage beshould create a ")

    });
  });
}
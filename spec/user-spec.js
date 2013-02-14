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
          return attrs.should.have.property("email").that.eq(testEmail) &&
            attrs.should.have.property("version").that.eq(user.get("version")) &&
            attrs.should.have.property("id").that.eq(user.get("id")) &&
            attrs.should.have.property("ciphertext") &&
            attrs.should.have.not.property("pin");
        });
      });
    }); // #create

    describe("#fetch", function() {
      var userPromise = null,
          testEmail = SH.generateTestEmail();
      before(function() {
        userPromise = SH.createUser({ password: SH.TEST_PASSWORD, email: testEmail });
      });

      it("should be able to fetch data from a previously saved user", function() {
        return userPromise.then(function(u) {
          return SH.fetchUser({ id: u.id, email: testEmail, password: SH.TEST_PASSWORD }).then(function(u) {

          });
          return true;
        });
      });

    }); // #fetch
  });
}
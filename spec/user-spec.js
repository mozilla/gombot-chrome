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
          userPromise.should.eventually.have.deep.property("attributes.pin", SH.TEST_PIN),
          userPromise.should.eventually.have.deep.property("attributes.logins")
        ]);
      });

      it("should create a record for the model in persistent storage that contains the user's data", function() {
        return userPromise.then(function(u) {
          return SH.getUserDataFromStore('localStorage', u);
        })
        .then(function(attrs) {
          var user = userPromise.valueOf();
          attrs.should.have.property("email").that.eq(testEmail);
          attrs.should.have.property("version").that.eq(user.get("version"));
          attrs.should.have.property("id").that.eq(user.get("id"));
          attrs.should.have.property("ciphertext");
          attrs.should.have.not.property("pin");
          return true;
        });
      });
    }); // #create

    describe("#fetch", function() {
      var createdUserPromise = null,
          testEmail = SH.generateTestEmail();
      before(function() {
        createdUserPromise = SH.createUser({ password: SH.TEST_PASSWORD, email: testEmail });
      });

      it("should be able to fetch data from a previously saved user with the user's password", function() {
        return createdUserPromise.then(function(u) {
          return SH.fetchUser({ id: u.id, email: testEmail, password: SH.TEST_PASSWORD })
        }).
        then(function(fetchedUser) {
          expect(fetchedUser).to.have.property("id").that.eq(createdUserPromise.valueOf().id);
          expect(fetchedUser.get("email")).to.eq(testEmail);
          expect(fetchedUser.get("version")).eq(createdUserPromise.valueOf().get("version"));
          expect(fetchedUser.get("pin")).to.eq(SH.TEST_PIN);
          expect(fetchedUser).to.not.have.property("ciphertext");
          expect(fetchedUser.get("logins").size()).to.eq(1);
          var loginCred = fetchedUser.get("logins").at(0);
          expect(loginCred.get("username")).to.eq(SH.TEST_LOGIN_CRED.username);
          expect(loginCred.get("password")).to.eq(SH.TEST_LOGIN_CRED.password);
          expect(loginCred.get("loginurl")).to.eq(SH.TEST_LOGIN_CRED.loginurl);
          expect(loginCred.get("title")).to.eq(SH.TEST_LOGIN_CRED.title);
          return true;
        });
      });

      it("should be able to fetch encrypted data from a previously saved user without the user's password", function() {
        // TODO: I need to update the sync_adapter to handle this case
      });

    }); // #fetch
  });
}
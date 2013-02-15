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

    describe("#read", function() {
      var createdUserPromise = null,
          testEmail = SH.generateTestEmail();
      before(function() {
        createdUserPromise = SH.createUser({ password: SH.TEST_PASSWORD, email: testEmail });
      });

      it("should fetch data from a previously saved user with the user's password", function() {
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
          expect(fetchedUser.cryptoProxy).to.be.an("object");
          var loginCred = fetchedUser.get("logins").at(0);
          expect(loginCred.get("username")).to.eq(SH.TEST_LOGIN_CRED.username);
          expect(loginCred.get("password")).to.eq(SH.TEST_LOGIN_CRED.password);
          expect(loginCred.get("loginurl")).to.eq(SH.TEST_LOGIN_CRED.loginurl);
          expect(loginCred.get("title")).to.eq(SH.TEST_LOGIN_CRED.title);
          return true;
        });
      });

      it("should only fetch metadata from a previously saved user without the user's password", function() {
        return createdUserPromise.then(function(u) {
          return SH.fetchUser({ id: u.id });
        }).
        then(function(fetchedUser) {
          expect(fetchedUser).to.have.property("id").that.eq(createdUserPromise.valueOf().id);
          expect(fetchedUser.get("email")).to.eq(testEmail);
          expect(fetchedUser.get("version")).eq(createdUserPromise.valueOf().get("version"));
          expect(fetchedUser.get("pin")).to.not.exist;
          expect(fetchedUser).to.not.have.property("ciphertext");
          expect(fetchedUser.get("ciphertext")).to.not.exist;
          expect(fetchedUser.cryptoProxy).to.not.exist;
          expect(fetchedUser.get("logins").size()).to.eq(0);
          return true;
        });
      });
    }); // #fetch

    describe("#update", function() {
      var createdUserPromise = null,
          testEmail = SH.generateTestEmail(),
          newPin = "9999";
      before(function() {
        createdUserPromise = SH.createUser({ password: SH.TEST_PASSWORD, email: testEmail });
      });

      it("should save the updated user data to persistent storage", function() {
        return createdUserPromise.then(function(u) {
          var lc = new SH.newLoginCredential(SH.TEST_LOGIN_CRED2);
          u.get("logins").add(lc);
          u.set("pin", newPin);
          return SH.saveUser({ user: u });
        }).
        then(function(savedUser) {
          return SH.fetchUser({ id: savedUser.id, email: testEmail, password: SH.TEST_PASSWORD })
        }).
        then(function(fetchedUser) {
          expect(fetchedUser).to.have.property("id").that.eq(createdUserPromise.valueOf().id);
          expect(fetchedUser.get("email")).to.eq(testEmail);
          expect(fetchedUser.get("version")).eq(createdUserPromise.valueOf().get("version"));
          expect(fetchedUser.get("pin")).to.eq(newPin);
          expect(fetchedUser).to.not.have.property("ciphertext");
          expect(fetchedUser.get("logins").size()).to.eq(2);
          expect(fetchedUser.cryptoProxy).to.be.an("object");
          var loginCred = fetchedUser.get("logins").at(0);
          expect(loginCred.get("username")).to.eq(SH.TEST_LOGIN_CRED.username);
          expect(loginCred.get("password")).to.eq(SH.TEST_LOGIN_CRED.password);
          expect(loginCred.get("loginurl")).to.eq(SH.TEST_LOGIN_CRED.loginurl);
          expect(loginCred.get("title")).to.eq(SH.TEST_LOGIN_CRED.title);
          loginCred = fetchedUser.get("logins").at(1);
          expect(loginCred.get("username")).to.eq(SH.TEST_LOGIN_CRED2.username);
          expect(loginCred.get("password")).to.eq(SH.TEST_LOGIN_CRED2.password);
          expect(loginCred.get("loginurl")).to.eq(SH.TEST_LOGIN_CRED2.loginurl);
          expect(loginCred.get("title")).to.eq(SH.TEST_LOGIN_CRED2.title);
          return true;
        });
      });
    }); // #update

  });
}
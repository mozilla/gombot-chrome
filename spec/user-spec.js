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
          userPromise.should.eventually.have.deep.property("attributes.email", testEmail),
          userPromise.should.eventually.have.deep.property("attributes.pin", SH.TEST_PIN)
        ]);
      });

      it("should create a record for the model in local storage", function() {
        var user;
        var lsAttrs;
        var lsPromise = userPromise.then(function(u) { user = u; return SH.getLocalStorageItem(SH.STORE_NAME); });
        lsPromise.then(function(attrs) { lsAttrs = attrs; });
        lsPromise.should.eventually.satisfy(function (lsAttrs) { console.log(user, lsAttrs); return true; } );
        return lsPromise;
        // userPromise.should.eventually.satisfy(function(user) {
        //   var indexOfUserRecord = -1;
        //   runs(function() {
        //     LocalStorage.getItem(self.STORE_NAME, function(store) {
        //       var records = (store && store.split(",")) || [];
        //       indexOfUserRecord = records.indexOf(user.id) >= 0
        //     });
        //   });
        // });
      });
    });
  });
}
var LoginCredentialCollection = function(Backbone, _, LoginCredential) {

  var LoginCredentialCollection = Backbone.Collection.extend({
    model: LoginCredential,

    initialize: function() {
      this.on("reset", this.decorateWithRealms, this);
      this.on("add", function(model, collection, options) {
        model.decorateWithRealm();
      })
    },

    decorateWithRealms: function() {
      this.each(function(loginCredential) {
        loginCredential.decorateWithRealm();
      }, this);
    }
  });

  return LoginCredentialCollection;
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = LoginCredentialCollection;
}
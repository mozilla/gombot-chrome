var UserCollection = function(Backbone, _, Gombot, LocalStorage) {

  var UserCollection = Backbone.Collection.extend({
    model: Gombot.User,
    localStorage: LocalStorage
  });

  return UserCollection;
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = UserCollection;
}
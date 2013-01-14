var User = function(Backbone, _, LoginCredentialCollection) {

	const USER_DATA_VERSIONS = [
		"identity.mozilla.com/gombot/v1/userData"
	];


	// attributes should be something like:
	// {
	//     "version": "identity.mozilla.com/gombot/v1/userData",
	//     "logins": {
	//             [{
	//             "hostname": "mozilla.com",
	//             "title": <Site Name>,
	//             "url": <full url to login page>,
	//             "password": "grëën",
	//             "pinLocked": false,
	//             "username": "gömbottest",
	//             "supplementalInformation": {
	//                 "ffNumber": "234324"
	//             }}],
	//     "pin": "1234"
	// }
	var User = Backbone.Model.extend({
		defaults: {
  		version: USER_DATA_VERSIONS[USER_DATA_VERSIONS.length-1],
  		pin: null,
  		logins: null
		},

    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);
      this.addSaveListener(this.get("logins"));
      // Add change handler to update listener when login collection changes
      // Note: this won't fire if elements of <logins> are changed, only if
      // the entire collection is replaced with a new one.
      this.listenTo(this, "change:logins", function(model, logins) {
        var prevLogins = model.previous("logins");
        if (prevLogins !== logins) {
          if (prevLogins) model.removeSaveListener(prevLogins);
          model.addSaveListener(logins);
        }
      });
    },

    addSaveListener: function(logins) {
      this.listenTo(logins, "save", this.save);
    },

    removeSaveListener: function(logins) {
      this.stopListening(logins, "save");
    },

    toJSON: function() {
    	var result = Backbone.Model.prototype.toJSON.apply(this, arguments);
    	return _.extend(result, { logins: this.get("logins").toJSON() });
    },

    set: function(attributes, options) {
      var result = false,
          logins;
      if (attributes.logins !== undefined && !(attributes.logins instanceof LoginCredentialCollection)) {
          logins = attributes.logins;
          attributes.logins = this.get("logins") || new LoginCredentialCollection();
      }
      result = Backbone.Model.prototype.set.call(this, attributes, options);
      if (result && logins) {
        this.get("logins").reset(logins);
      }
      return result;
    }
	});
	return User;
}

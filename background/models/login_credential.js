var LoginCredential = function(Backbone, _, Realms) {

	// LoginCredential constructor
	// data is:
  // {
  // "origins": [ "https://www.mozilla.com" ],
  // "title": Mozilla,
  // "url": "https://www.mozilla.com/login",
  // "password": "grëën",
  // "pinLocked": false,
  // "username": "gömbottest",
  // "supplementalInformation": {
  //     "ffNumber": "234324"
  // }
	var LoginCredential = Backbone.Model.extend({
		defaults: {
			//origins: null, // not currently used but in the future this is for user edited origins
			title: "",
			url: "",
			password: "",
			pinLocked: false,
			username: "",
			supplementalInformation: {}
		},

    initialize: function() {
      if (!this.id) {
        this.id = _.guid();
        this.set("id", this.id);
      }
    },

    sync: function(attributes, options) {
      if (this.hasChanged()) this.trigger("sync");
    },

    decorateWithRealm: function() {
      // Enable this line when we start supporting user edited origins
      //this.origins = this.get("origins") || Realms.getRealmForUri(this.get("url"));
      this.origins = Realms.getRealmForUri(this.get("url"));
    }

	});

	return LoginCredential;
};
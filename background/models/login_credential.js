var LoginCredential = function(Backbone, _) {

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
			origins: [],
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
    }

	});

	return LoginCredential;
};
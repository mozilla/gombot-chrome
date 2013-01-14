var LoginCredential = function(Backbone, _) {

	// LoginCredential constructor
	// data is:
  // {
  // "hostname": "www.mozilla.com",
  // "realm": "mozilla.com",
  // "title": Mozilla,
  // "url": <full url to login page>,
  // "password": "grëën",
  // "pinLocked": false,
  // "username": "gömbottest",
  // "supplementalInformation": {
  //     "ffNumber": "234324"
  // }
	var LoginCredential = Backbone.Model.extend({
		defaults: {
			hostname: "",
			realm: "",
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
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

    save: function(attributes, options) {
      this.trigger("save");
      console.log("triggered save");
    }
	});

	return LoginCredential;
};
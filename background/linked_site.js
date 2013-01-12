var LinkedSite = function(Backbone, _) {

	// LinkedSite constructor
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
	var LinkedSite = Backbone.Model.extend({
		defaults: {
			hostname: "",
			realm: "",
			title: "",
			url: "",
			password: "",
			pinLocked: false,
			username: "",
			supplementalInformation: {}
		}
	});

	return LinkedSite;
};
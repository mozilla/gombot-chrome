var User = function(Backbone, _, LinkedSiteCollection) {

	const USER_DATA_VERSIONS = [
		"identity.mozilla.com/gombot/v1/userData"
	];


	// attributes should be something like:
	// {
	//     "version": "identity.mozilla.com/gombot/v1/userData",
	//     "logins": {

	//             "mozilla.com":
	//             [{
	//             "hostname": "mozilla.com",
	//             "title": <Site Name>,
	//             "url": <full url to login page>,
	//             "password": "grëën",
	//             "pinLocked": false,
	//             "username": "gömbottest",
	//             "supplementalInformation": {
	//                 "ffNumber": "234324"
	//             }}]
	//     },
	//     "pin": "1234"
	// }
	var User = Backbone.Model.extend({
		defaults: {
  		version: USER_DATA_VERSIONS[USER_DATA_VERSIONS.length-1],
  		pin: null
		},

  	initialize: function(args) {
  		var logins = args.logins || [];
  		delete args.logins;
  		this.set(args);
  		this.linkedSites = new LinkedSiteCollection();
  		this.linkedSites.initalizeFromLoginMap(logins);
    },

    toJSON: function() {

    }

	},
  {



	});
	return User;
}



// var User = function(Storage, LinkedSite) {

// 	// mapping of user ids -> User objects
// 	var users = {};

// 	const USERS_KEY = "users";


// 	// User object constructor

// 	var User = function(attributes) {
// 		attributes = attributes || {};
// 		attributes.version = attributes.version ||
// 		attributes.logins = attributes.logins || [];
// 		attributes.pin = attributes.pin || "";

// 		this.logins = attributes.logins.forEach(function(loginData))
// 		this.attributes = {  = data;
// 	}

// 	User.prototype.save = function(callback) {
// 		Storage.get(USERS_KEY, function(userDataCollection) {
// 			userDataCollection[this.id] = this.data;
// 			Storage.set(USERS_KEY, userDataCollection, callback);
// 		};
// 	};

// 	User.prototype.delete = function(callback) {
// 		Storage.get(USERS_KEY, function(userDataCollection) {
// 			delete userDataCollection[this.id];
// 			Storage.set(USERS_KEY, userDataCollection, callback);
// 		};
// 	};

// 	User.init = function(callback) {
// 		Storage.get(USERS_KEY, function(userDataCollection) {
// 			var ids;
// 			if (result) {
// 				ids = Object.getOwnPropertyNames(result);
// 				ids.forEach(function(id) {
// 					users[id] = new User(userDataCollection[id]);
// 				});
// 			}
// 			callback();
// 		}
// 	}

// 	User.fetchAll() = function() {
// 		return users;
// 	};

// 	User.fetch(id) = function() {
// 		return users[id];
// 	};

// 	return User;
// }
var User = function(Backbone, _, LoginCredentialCollection) {

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
  		pin: null,
  		logins: {}
		},

    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);
      this.addSaveListener();
      console.log("INIT DONE", this);
    },

    // parse: function(resp) {
    // 	resp.logins = new LoginCredentialCollection(resp.logins, { parse: true });
    // 	return resp;
    // },

    addSaveListener: function() {
      this.listenTo(this.get("logins"), "save", this.save);
    },

    toJSON: function(options) {
    	var result = Backbone.Model.prototype.toJSON.apply(this, arguments);
    	return _.extend(result, { logins: this.get("logins").toJSON(options) });
    },

    // TODO: fix up the cleaning up of save listeners here, esp if prevLogins is null
    set: function(attributes, options) {
      var result = false,
          logins = null,
          prevLogins = null;
      if (attributes.logins !== undefined) {
        if (!(attributes.logins instanceof LoginCredentialCollection)) {
          logins = attributes.logins;
          attributes.logins = this.get("logins") || new LoginCredentialCollection();
        }
        else {
          prevLogins = this.get("logins");
        }
      }
      result = Backbone.Model.prototype.set.call(this, attributes, options);
      if (result) {
        if (logins) this.get("logins").reset(logins);
        if (prevLogins) {
          this.stopListening(prevLogins, "save");
          this.addSaveListener();
        }
      }
      return result;
    },

    save: function() {
      console.log("USER: save");
      Backbone.Model.prototype.save.apply(this, arguments);
    }

	},
  {



	});
	return User;
}



// var User = function(Storage, LoginCredential) {

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
var User = function(Backbone, _, LoginCredentialCollection, GombotSync, LocalStorage) {

	const USER_DATA_VERSIONS = [
		"identity.mozilla.com/gombot/v1/userData"
	];


	// attributes should be something like:
	// {
	//     "version": "identity.mozilla.com/gombot/v1/userData",
	//     "id": "1534a27f-13f3-27bb-15cf-0960aadda2c5",
	//     "email": "awesomeuser@mail.com",
	//     "logins":
	//             [{
	//             "id": "6760ab7f-e8f8-a7a5-e5ca-0960ccdba4c6",
	//             "hostname": "www.mozilla.com",
	//             "realm": "mozilla.com",
	//             "title": "Mozilla",
	//             "loginurl": "https://www.mozilla.com/login",
	//             "username": "gömbottest",
	//             "password": "grëën",
	//             "pinLocked": false,
	//             "supplementalInformation": {
	//                 "ffNumber": "234324"
	//             }
  //             }],
	//     "disabledSites": { "www.google.com": true },
	//     "pin": "1234"
	// }
	var User = Backbone.Model.extend({
		defaults: {
  		version: USER_DATA_VERSIONS[USER_DATA_VERSIONS.length-1],
  		pin: null,
  		logins: null,
  		email: "",
      disabledSites: {}
		},

		localStorage: LocalStorage,

		// derived keys from user's master password
		keys: null,

    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);
      this.addSyncListener(this.get("logins"));
      // Add change handler to update listener when login collection changes
      // Note: this won't fire if elements of <logins> are changed, only if
      // the entire collection is replaced with a new one.
      this.listenTo(this, "change:logins", function(model, logins) {
        var prevLogins = model.previous("logins");
        if (prevLogins !== logins) {
          if (prevLogins) model.removeSyncListener(prevLogins);
          model.addSyncListener(logins);
        }
      });
    },

    addSyncListener: function(logins) {
      this.listenTo(logins, "sync", this.save);
    },

    removeSyncListener: function(logins) {
      this.stopListening(logins, "sync");
    },

    toJSON: function(args) {
    	args = args || {};
    	if (args.encrypted && this.ciphertext) {
    		return { ciphertext: this.ciphertext, updated: this.updated, id: this.id, email: this.get("email") };
    	}
    	else {
    		var result = Backbone.Model.prototype.toJSON.apply(this, arguments);
    		return _.extend(result, { logins: this.get("logins").toJSON() });
    	}
    },

    parse: function(resp) {
    	console.log("PARSE", resp);
    	return resp;
    },
    
    signIn: function(cb) {
      if (!this.password) return;
      const GOMBOT_ENDPOINT = "https://gombot.org/api";
      var that = this;
      var client = new GombotClient(GOMBOT_ENDPOINT);
      client.signIn({
        email: this.get('email'),
        pass: this.password
      }, function(err) {
        if (err) {
          console.log('Couldn\'t sign user into server!');
          cb(err);
          return;
        }
        that.keys = client.keys;
        Gombot.setCurrentUser(that);
        that.fetch();
      });
    },

    sync: function(method, model, options) {
    	var self = this;
    	var success = function(resp) {
    		var s = options.success;
    		options.success = function() {
    			if (s) s(resp.data || {});
    		}
    		if (resp.updated) self.updated = resp.updated;
    		if (resp.ciphertext) {
    			self.ciphertext = resp.ciphertext;
    			Backbone.localSync(method, model, _.extend(options, { encrypted: true }));
    		} else if (options.success) {
    			options.success();
    		}
    	};
    	var error = function(args) {
    		if (options.error) options.error(args);
    	};
    	var o = _.clone(options);
    	GombotSync.sync(method, model, _.extend(o,{ success: success, error: error }));
    },

    set: function(key, val, options) {
      var result = false,
          logins,
          attributes;
      if (_.isObject(key)) {
        attributes = key;
        options = val;
      } else {
        (attributes = {})[key] = val;
      }
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



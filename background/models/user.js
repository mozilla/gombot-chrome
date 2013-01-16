var User = function(Backbone, _, LoginCredentialCollection) {

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
	//             "url": "https://www.mozilla.com/login",
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
	// test string: '{ "version": "identity.mozilla.com/gombot/v1/userData","id": "1534a27f-13f3-27bb-15cf-0960aadda2c5","email": "awesomeuser@mail.com","logins":[{"id": "6760ab7f-e8f8-a7a5-e5ca-0960ccdba4c6","hostname": "www.mozilla.com","realm": "mozilla.com","title": "Mozilla","url": "https://www.mozilla.com/login","username": "gömbottest","password": "grëën","pinLocked": false,"supplementalInformation": {"ffNumber": "234324"}}],"disabledSites": { "www.google.com": true },"pin": "1234"}'
	var User = Backbone.Model.extend({
		defaults: {
  		version: USER_DATA_VERSIONS[USER_DATA_VERSIONS.length-1],
  		pin: null,
  		logins: null,
  		email: "",
      disabledSites: {}
		},

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

    toJSON: function() {
    	var result = Backbone.Model.prototype.toJSON.apply(this, arguments);
    	return _.extend(result, { logins: this.get("logins").toJSON() });
    },

    sync: function(method, model, options) {
      // Need to have sync keys attached to this object (outside of attributes) to sync
      if (method !== "create" && !model.keys) {
        console.log('No keys on user object!');
        return;
      }
      var client = new GombotClient('https://gombot.org/api', {
        keys: model.keys
      });
      if (method === 'update') {
        // TODO: get and store timestamp
        client.createEncryptedPayload({
          payload: model
        }, function(err, cipherText) {
          client.storePayload({
            cipherText: cipherText
          }, function(err) {
            if (!err) {
              model.cipherText = cipherText;
            }
            if (options.success) options.success(model,{},options);
          });
        });
      }
      else if (method === 'read') {
        client.getPayload({}, function(err, result) {
          if (err || !result.success) {
            console.log('Error getting payload!');
            return;
          }
          // TODO: compare timestamps
          model.updated = result.updated;
          if (options.success) options.success(model,result.payload,options);
        });
      }
      else if (method === 'create') {
        console.log("calling create");
        client.account({
          email: model.get('email'),
          pass: model.password,
          newsletter: model.newsletter
        }, function(err, result) {
          console.log("in callback", err, result, options);
          if (err || !result.success) {
           console.log('Error creating account!');
           return;
          }
          model.keys = client.keys;
          if (options.success) options.success(model,{},options);
        });
      }
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



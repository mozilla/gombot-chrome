var User = function(Backbone, _, Gombot) {

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

    isAuthenticated: function() {
      return false;
      return this.client && ((this.client.isAuthenticated && this.client.isAuthenticated()) || (this.client.keys && this.client.user));
    },

    // If you want to creat an "encrypted" JSON representation,
    // call model.toJSON({ encrypted: true, ciphertext: <ciphertext> })
    // Other toJSON() creates a standard plaintext representation of a User object
    toJSON: function(args) {
      var result = Backbone.Model.prototype.toJSON.apply(this, arguments);
      return _.extend(result, { logins: this.get("logins").toJSON() });
    },

    // Returns an object containing key/values of data that will be
    // stored in plaintext with an encrypted copy of this model's data.
    // The metadata should not contain any information that is intended
    // to be stored encrypted at rest.
    getMetadata: function() {
      return {
        id: this.get("id"),
        email: this.get("email"),
        version: this.get("version"),
        updated: this.updated
      }
    },

    parse: function(resp) {
      if (resp.updated) this.updated = resp.updated;
      delete resp.updated;
      return resp;
    },

    sync: function(method, model, options) {
      Gombot.SyncAdapter.sync(method, model, options);
      // var self = this;
      // var success = function(resp) {
      //   var s = options.success;
      //   options.success = function(model, resp, options) {
      //     console.log("User.sync finished method="+method+" resp="+JSON.stringify(resp)+" model="+JSON.stringify(model));
      //     // resp.data is returned by GombotSync calls with plaintext user data
      //     if (s) s(model, resp.data || {}, options);
      //   }
      //   if (resp.updated) self.updated = resp.updated;
      //   // ciphertext in resp indicates we need to write it out to local storage
      //   if (resp.ciphertext) {
      //     if (method === "read") {
      //       self.save(resp.data, _.extend(options, { localOnly: true, ciphertext: resp.ciphertext }));
      //     } else {
      //       console.log("localSync method="+method);
      //       Backbone.localSync(method, model, _.extend(options, { ciphertext: resp.ciphertext }));
      //     }
      //   } else if (options.success) {
      //     options.success(model, resp, options);
      //   }
      // };
      // var error = function(args) {
      //   if (options.error) options.error(args);
      // };
      // var o = _.clone(options);
      // if (options.localOnly) {
      //   Backbone.localSync(method, model, options);
      // } else {
      //   GombotSync.sync(method, model, _.extend(o,{ success: success, error: error }));
      // }
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
      if (attributes.logins !== undefined && !(attributes.logins instanceof Gombot.LoginCredentialCollection)) {
          logins = attributes.logins;
          attributes.logins = this.get("logins") || new Gombot.LoginCredentialCollection();
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

if (typeof module !== "undefined" && module.exports) {
  module.exports = User;
}


var GombotSync = function(GombotClient, Backbone, _, Gombot) {
  const GOMBOT_ENDPOINT = "http://dev.tobmog.org/api";

  function maybeHandleError(handler, err, result) {
    var response;
    if (err || !result.success) {
      result = result || {};
      if (err) {
        result.error = err.error;
        result.status = err.status;
        try {
          response = JSON.parse(err.error.responseText);
        } catch(e) {};
        result.response = response || "";
      }
      console.log("GombotSync error", result);
      if (handler) handler(result);
      return true;
    }
    else return false;
  }

  function getTimestamp(client, model, options) {
    client.getTimestamp({}, function(err, result) {
      if (maybeHandleError(options.error, err, result)) return;
      if (options.success) options.success(result.updated);
    });
  }

  function create(client, model, options) {
    var self = this;
    client.account({
      email: model.get('email'),
      pass: options.password,
      newsletter: options.newsletter
    }, function(err, result) {
      if (maybeHandleError(options.error, err, result)) return;
      update(client, model, options);
    });
  }

  function read(client, model, options) {
    getTimestamp(client, model, { error: options.error, success: function (serverUpdatedTime) {
      var needsUpdate = !model.updated || serverUpdatedTime > model.updated;
      if (!needsUpdate) {
        // A little bit of a workaround here that if model.ciphertext exists, then it doesn't have any model data,
        // so it needs a decryption. We will decrypt it for them, clear model.ciphertext, and return the
        // model data in the callback.
        var success = function(data) {
          if (options.success) options.success({ data: data, updated: serverUpdatedTime });
        };
        if (model.ciphertext) {
          client.decryptPayload(model.ciphertext, function (err, plaintext) {
            if (err) return maybeHandleError(options.error, err);
            delete model.ciphertext;
            success(JSON.parse(plaintext));
          });
        }
        else return success({});
      } else {
        client.getPayload({}, function(err, result) {
          if (maybeHandleError(options.error, err, result)) return;
          if (options.success) options.success({ data: result.payload, ciphertext: result.ciphertext, updated: result.updated });
        });
      }
    }});
  }

  // TODO: client.storePayload needs to return timestamp, otherwise this function is buggy.
  function update(client, model, options) {
    client.createEncryptedPayload(model, function(err, ciphertext) {
      client.storeEncryptedPayload({
        ciphertext: ciphertext
      }, function(err, result) {
        if (maybeHandleError(options.error, err, result)) return;
        getTimestamp(client, model, { error: options.error, success: function(serverUpdatedTime) {
          var needsUpdate = !model.updated || serverUpdatedTime > model.updated;
          // if for some reason, the model has a more recent timestamp then don't give it the updated ciphertext
          if (!needsUpdate) ciphertext = null;
          if (options.success) options.success({ data: {}, ciphertext: ciphertext, updated: serverUpdatedTime });
        }});
      });
    });
  }

  function destroy(client, model, options) {
       maybeHandleError(options.error, "DELETE NOT IMPLEMENTED");
  }

  // options.success(client) must be defined
  function getGombotClient(model, options) {
    var clientOptions = {};
    if (model.client) {
      if (model.client instanceof GombotClient) return options.success(model.client);
      if (model.client.user && model.client.keys) {
        // loading cached login info from localStorage
        clientOptions = model.client;
        delete model.client;
      }
    }
    model.client = new GombotClient(GOMBOT_ENDPOINT, clientOptions);
    model.client.context(function(err, result) {
      if (err) return maybeHandleError(options.error, err);
      options.success(model.client);
    });
  };

  // options.success(client) must be defined
  function login(client, model, options) {
    client.signIn({
      email: model.get('email'),
      pass: options.password
    }, function(err, result) {
      if (err) return maybeHandleError(options.error, err);
      options.success(client);
    });
  }

  // options.success(client) must be defined
  // if client.keys don't exist, then options must contain "password" and model must have an "email" property.
  function maybeLogin(method, model, options) {
    getGombotClient(model, { error: options.error, success: function(client) {
      // if already authenticated then just return
      if (client.isAuthenticated()) return options.success(client);
       // if no keys, check to see if we have email and password on model and if we don't then raise error
       if (!options.password || !model.get("email")) return maybeHandleError(options.error, "Client is unauthenticated; must provide email and password in options");
      // "create" doesn't require user be logged in, so plow ahead
      if (method === "create") return options.success(client);
      login(client, model, options);
    }});
  }

  // sync() only supports syncing Gombot.User models.
  // Success method is called with object of the form:
      // {
      //   data: unencrypted model data,
      //   ciphertext: current encrypted payload of user data,
      //   updated: server timestamp of this data
      // }
  // All methods except for "create" require model.keys to exist and be valid
  function sync(method, model, options) {
    if (!(model instanceof Gombot.User)) return maybeHandleError(options.error, "sync only supports syncing instances of Gombot.User");
    var o = _.clone(options);
    maybeLogin(method, model, _.extend(o, { success: function(client) {
      var args = [client, model, options];
      switch (method) {
        case "read":    read.apply(this, args); break;
        case "create":  create.apply(this, args); break;
        case "update":  update.apply(this, args); break;
        case "delete":  destroy.apply(this, args); break;
      }
    }}));
  }

  if (Backbone) Backbone.gombotSync = sync;

  return {
    sync: sync
  };
}

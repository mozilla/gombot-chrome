var GombotSync = function(GombotClient, Backbone, _, Gombot) {
	const GOMBOT_ENDPOINT = "https://gombot.org/api";


	function maybeHandleError(handler, err, result) {
		if (err || !result.success) {
			if (!err) err = result;
			if (handler) handler(err);
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
  			if (options.success) options.success({ data: {}, updated: serverUpdatedTime });
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
    client.createEncryptedPayload({
      payload: model
    }, function(err, ciphertext) {
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
  	if(model.client) {
  		options.success(model.client);
  		return;
  	}
  	model.client = new GombotClient(GOMBOT_ENDPOINT, {});
    model.client.context(function(err, result) {
    	if (err) {
    		maybeHandleError(options.error, err);
    		return;
    	}
    	options.success(model.client);
    });
  };

  // options.success(client) must be defined
  function login(client, model, options) {
    client.signIn({
      email: model.get('email'),
      pass: options.password
    }, function(err, result) {
      if (err) {
      	maybeHandleError(options.error, err);
      	return;
      }
      options.success(client);
    });
  }

  // options.success(client) must be defined
  // if client.keys don't exist, then options must contain "password" and model must have an "email" property.
  function maybeLogin(method, model, options) {
    getGombotClient(model, { error: options.error, success: function(client) {
    	if (client.isAuthenticated()) {
    		options.success(client);
    		return;
    	}
    	// not authenticated, so signing
 			if (!options.password || !model.get("email")) {
 				// if no keys, check to see if we have email and password on model and if we don't then raise error
    		maybeHandleError(options.error, "Client is unauthenticated; must provide email and password in options");
      	return;
    	}
    	// "create" doesn't require user be logged in, so plow ahead
    	if (method === "create") {
    		options.success(client);
    		return;
    	}
    	login(client, model, options);
    }});
  }

	// sync() only supports syncing Gombot.User models.
	// Success method is called with object of the form:
	    // {
	    // 	data: unencrypted model data,
	    // 	ciphertext: current encrypted payload of user data,
	    // 	updated: server timestamp of this data
	    // }
	// All methods except for "create" require model.keys to exist and be valid
	function sync(method, model, options) {
		if (!(model instanceof Gombot.User)) {
			maybeHandleError(options.error, "sync only supports syncing instances of Gombot.User");
			return;
		}
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
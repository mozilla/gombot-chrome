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
      pass: model.password,
      newsletter: model.newsletter
    }, function(err, result) {
    	console.log(err, result);
    	if (maybeHandleError(options.error, err, result)) return;
      model.keys = client.keys;
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

  function getGombotClient(model, options) {
  	if(model.client) {
  		if (options.success) options.success(model.client);
  		return;
  	}
  	model.client = new GombotClient(GOMBOT_ENDPOINT, {
      keys: model.keys
    });
    model.client.context(function(err, result) {
    	if (err) {
    		maybeHandleError(options.error, err);
    		return;
    	}
    	if (options.success) options.success(model.client);
    });
  };

  function login(method, model, options) {
    // check to see if we have email and password on model and if we don't then raise error
    getGombotClient(model, { error: options.error, success: function(client) {
      // do login and attach keys and then call sync again with method, model, options
      // also make sure this gombot client gets the resulting keys
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
			error(options.error, "sync only supports syncing instances of Gombot.User");
			return;
		}
    // Need to have sync keys attached to this object (outside of attributes) to sync
    if (method !== "create" && !model.keys) {
      //login(method, model, options);
    	error(options.error, "No keys on model!");
      return;
    }
    getGombotClient(model, { error: options.error, success: function(client) {
	    var args = [client, model, options];
		  switch (method) {
		    case "read":    read.apply(this, args); break;
		    case "create":  create.apply(this, args); break;
		    case "update":  update.apply(this, args); break;
		    case "delete":  destroy.apply(this, args); break;
		  }
		}});
	}

	if (Backbone) Backbone.gombotSync = sync;

	return {
		sync: sync
	};
}
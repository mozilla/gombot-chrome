var GombotSync = function(GombotClient, Backbone, Gombot) {
	const GOMBOT_ENDPOINT = "https://gombot.org/api";

	// This only supports syncing User models.
	function sync(method, model, options) {
		if (!(model instanceof Gombot.User)) {
			var errorMsg = "ERROR: GombotSync.sync only supports syncing instances of Gombot.User";
			console.log(errorMsg);
			if (options.error) options.error(errorMsg);
			return;
		}
    // Need to have sync keys attached to this object (outside of attributes) to sync
    if (method !== "create" && !model.keys) {
      console.log('No keys on model!');
      return;
    }
    var client = new GombotClient(GOMBOT_ENDPOINT, {
      keys: model.keys,
      user: model.get('email')
    });
    if (method === 'create') {
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
        if (options.success) options.success({});
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
    else if (method === 'update') {
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


	}

	if (Backbone) Backbone.gombotSync = sync;

	return {
		sync: sync
	};
}
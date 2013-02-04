var SyncAdapter = function(Gombot, GombotCrypto, SyncStrategy, _) {

  // TODO: seed from an actual entropy source
  GombotCrypto.seed("oiqwjeciouqh3c89cnkjasdcnasjf84u9jcuqwiench734fhujhwuqhf73f73fhsdjfhasdf734fhdkcnuf"+(new Date().toString()) ,function(err) {
    if (err) console.log("GombotCrypto.seed error:", err);
  });

  function maybeHandleError(handler, err) {
    if (err) {
      console.log("SyncMediator error", err);
      if (handler) handler(err);
      return true;
    }
    else return false;
  }

  function encryptModel(model, keys, options) {
    GombotCrypto.encrypt(keys, JSON.stringify(model), function(err, ciphertext) {
      if (err) return maybeHandleError(options.error, err);
      options.success(ciphertext);
    });
  }

  function decryptModelData(ciphertext, keys, options) {
    GombotCrypto.decrypt(keys, ciphertext, function(err, json) {
      var modelData;
      try {
        if (!err) {
          modelData = JSON.parse(json);
        }
      } catch (e) {
          err = new Error("Could not parse decrypted JSON:", json);
      }
      if (err) return maybeHandleError(options.error, err);
      options.success(modelData);
    });
  }

  function createCryptoProxyForModel(model, keys) {
    var clone = _.clone(model);
    return _.extend(clone, {
      toJSON: function(options) {
        // missing options means synchronous response to underyling object
        if (!options || !options.success) return model.toJSON();
        var o = _.clone(options);
        encryptModel(model, keys, _.extend(o, { success: function(ciphertext) {
          options.success(_.extend(model.getMetadata(), {
            ciphertext: ciphertext // encrypted plaintext model
          }));
        }}));
      },
      parse: function(resp, options) {
        var o = _.clone(options),
            ciphertext = resp.ciphertext;
        decryptModelData(ciphertext, keys, _.extend(o, { success: function(modelData) {
          delete resp.ciphertext;
          options.success(_.extend(resp, modelData));
        }}));
      }
    });
  }

  function getCryptoProxyForModel(model, options) {
    if (model.cryptoProxy) return options.success(model.cryptoProxy);
    var o = _.clone(options);
    deriveKeysForModel(model, _.extend(o, { success: function(keys) {
      model.cryptoProxy = createCryptoProxyForModel(model, keys);
      options.success(model.cryptoProxy);
    }}));
  }

  var kdf = GombotCrypto.derive;
  // Special kdf derivation function we'll pass to GombotClient to handle FX slowness bug
  if (typeof require !== "undefined") {
    kdf = function (args, callback) {
      console.log("in derive")
      require("gombot-crypto-jetpack").kdf(args.email, args.password).then(function(keys) {
        callback(null, keys);
      });
    }
  }

  // options.password must be present
  function deriveKeysForModel(model, options) {
    kdf({
      email: model.get("email"),
      password: options.password
    }, function(err, keys) {
      if (err) return maybeHandleError(options.error, err);
      options.success(keys);
    });
  }

  function setSyncStrategy(strategy) {
    SyncStrategy = strategy;
  }

  function sync(method, model, options) {
    if (!(model instanceof Gombot.User)) {
      if (options.error) options.error("sync only supports syncing instances of Gombot.User");
      return false;
    }
    var o = _.clone(options);
    getCryptoProxyForModel(model, _.extend(o, { success: function(cryptoProxyForModel) {
      var o = _.clone(options);
      // translate model proxy back to original model
      SyncStrategy.sync(method, cryptoProxyForModel, _.extend(o, { success: function(modelProxy, resp, modifiedOptions) {
        if (options.success) options.success(model, resp, options);
      }}));
    }}));
  }

  return {
    sync: sync,
    setSyncStrategy: setSyncStrategy
  };
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SyncAdapter;
}

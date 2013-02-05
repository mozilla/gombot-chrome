/**
 * Backbone localStorage Adapter
 *
 * https://github.com/jeromegn/Backbone.localStorage
 */
var Storage = function(Backbone, _, LocalStorage, store) {
return (function (root, factory) {
   // if (typeof define === "function" && define.amd) {
   //    // AMD. Register as an anonymous module.
   //    defin(["underscore","backbone"], function(_, Backbone) {
   //      // Use global variables if the locals is undefined.
   //      return factory(_ || root._, Backbone || root.Backbone);
   //    });
   // } else {
      // RequireJS isn't being used. Assume underscore and backbone is loaded in <script> tags
  return factory(_, Backbone);
   //}
}(this, function(_, Backbone) {
// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Hold reference to Underscore.js and Backbone.js in the closure in order
// to make things work even if they are removed from the global namespace

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
// window.Store is deprectated, use Backbone.LocalStorage instead
Backbone.LocalStorage = function(name, callback) {
  this.name = name;
  var cb = function(store) {
    this.records = (store && store.split(",")) || [];
    if (callback) callback(this);
  }
  this.localStorage().getItem(this.name, cb.bind(this));
};

_.extend(Backbone.LocalStorage.prototype, {

  // Save the current state of the **Store** to *localStorage*.
  save: function(callback) {
    this.localStorage().setItem(this.name, this.records.join(","), callback);
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(model, callback, options) {
    if (!model.id) {
        model.id = guid();
        model.set(model.idAttribute, model.id);
    }
    var cb = _.after(2, function() {
      callback(model.toJSON());
    });
    var o = _.clone(options);
    model.toJSON(_.extend(o, { success: (function(jsonObj) {
      this.localStorage().setItem(this.name+"-"+model.id, JSON.stringify(jsonObj), cb);
      this.records.push(model.id.toString());
      this.save(cb);
    }).bind(this)}));
    return;
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model, callback, options) {
    var cb = _.after(2, function() {
      callback(model.toJSON());
    });
    this.localStorage().setItem(this.name+"-"+model.id, JSON.stringify(model.toJSON({ ciphertext: options.ciphertext })), cb);
    if (!_.include(this.records, model.id.toString())) this.records.push(model.id.toString()); this.save(cb);
    return;
  },

  // Retrieve a model from `this.data` by id.
  find: function(model, callback, options) {
    this.localStorage().getItem(this.name+"-"+model.id, (function(resp) {
      var o = _.clone(options);
      model.parse(this.jsonData(resp), _.extend(o, { success: function(parsedResp) {
        callback(parsedResp);
      }}));
    }).bind(this));
    return;
  },

  // Return the array of all models currently in storage.
  findAll: function(callback, options) {
    var result = [],
        allFetched;
    if (this.records.length === 0) { callback(result); return; }
    var allFetched = _.after(this.records.length, function() { callback(_(result).chain().compact().value()); });
    var itemFetched = function(resp) {
      result.push(this.jsonData(resp));
      allFetched();
    }
    _(this.records)
        .map(function(id){return this.localStorage().getItem(this.name+"-"+id, itemFetched.bind(this));}, this);
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model, callback, options) {
    var cb = _.after(2, function() {
      callback(model);
    });
    this.localStorage().removeItem(this.name+"-"+model.id, cb);
    this.records = _.reject(this.records, function(record_id){return record_id == model.id.toString();});
    this.save(cb);
    return;
  },

  localStorage: function() {
      return LocalStorage;
  },

  // fix for "illegal access" error on Android when JSON.parse is passed null
  jsonData: function (data) {
      return data && JSON.parse(data);
  },

  sync: function(method, model, options) {
    var o = _.clone(options);
    o.store = this;
    Backbone.LocalStorage.sync(method, model, o);
  }

});

// localSync delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
// window.Store.sync and Backbone.localSync is deprectated, use Backbone.LocalStorage.sync instead
Backbone.LocalStorage.sync = Backbone.localSync = function(method, model, options) {
  var store = options.store || model.localStorage || model.collection.localStorage;

  var syncDfd = (typeof $ !== "undefined") && $.Deferred && $.Deferred(); //If $ is having Deferred - use it.

  if (typeof options == 'function') {
    options = {
      success: options,
      error: error
    };
  }

  var callback = function(resp) {
    if (resp) {
      if (options && options.success) options.success(model, resp, options);
      if (syncDfd) syncDfd.resolve();
    } else {
      if (options && options.error) options.error(model, "Record not found", options);
      if (syncDfd) syncDfd.reject();
    }

    // add compatibility with $.ajax
    // always execute callback for success and error
    if (options && options.complete) options.complete(resp);
  };

  //console.log("Backbone.LocalStorage.sync", method, model, options);

  switch (method) {
    case "read":    model.id != undefined ? store.find(model, callback, options) : store.findAll(callback, options); break;
    case "create":  store.create(model, callback, options);                            break;
    case "update":  store.update(model, callback, options);                            break;
    case "delete":  store.destroy(model, callback, options);                           break;
  }

  return syncDfd && syncDfd.promise();
};

Backbone.ajaxSync = Backbone.sync;

Backbone.getSyncMethod = function(model) {
  if(model.localStorage || (model.collection && model.collection.localStorage))
  {
    return Backbone.localSync;
  }

  return Backbone.ajaxSync;
};

// Override 'Backbone.sync' to default to localSync,
// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
Backbone.sync = function(method, model, options) {
  return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
};

return Backbone.LocalStorage;
}));
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Storage;
}
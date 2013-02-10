/*
*   main.js
*
*
*   Main file that creates the Gombot namespace.
*
*/

// Gombot and importedModules are optional. (However, importedModules need to be
// provided in Firefox and defined in some other way for other platforms.)
var _Gombot = function(importedModules, Gombot) {

  Gombot = Gombot || {};
  importedModules = importedModules || {};

  function getModule(name) {
    if (typeof window !== "undefined" && typeof window[name] !== "undefined") {
      return window[name];
    }
    else if (typeof importedModules[name] !== "undefined") {
      return importedModules[name];
    }
    else {
      console.log("Error in getModule() can't find: "+name);
      throw "Can't find module: "+name;
    }
  }

  var Backbone = getModule("Backbone")();
  var _ = getModule("_");

  // mixin guid creation into underscore
  _.mixin({
    guid: (function() {
      function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
      };
      // Generate a pseudo-GUID by concatenating random hexadecimal.
      return function() {
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
      };
    })()
  });

  Gombot.Messaging = getModule("Messaging")();
  Gombot.LocalStorage = getModule("LocalStorage")();
  Gombot.TldService = getModule("TldService")(getModule("Tld"), getModule("Uri"));
  Gombot.SiteConfigs = getModule("SiteConfigs");
  Gombot.Realms = getModule("Realms")(Gombot, Gombot.SiteConfigs, getModule("Uri"));
  Gombot.Storage = getModule("Storage")(Backbone, _, Gombot.LocalStorage); // local sync; defined by backbone.localStorage.js
  //Gombot.GombotClient = getModule("GombotClient");
  //Gombot.Sync = getModule("GombotSync")(Gombot, Backbone, _); // original sync using our api
  //Gombot.FirebaseSync = getModule("FirebaseSync")(Gombot); // sync using firebase
  Gombot.LoginCredential = getModule("LoginCredential")(Gombot, Backbone, _);
  Gombot.LoginCredentialCollection = getModule("LoginCredentialCollection")(Backbone, _, Gombot.LoginCredential); // LoginCredential need to be initialized
  Gombot.CapturedCredentialStorage = getModule("CapturedCredentialStorage")(Gombot, getModule("Uri"));
  Gombot.Linker = getModule("Linker")(Gombot);
  Gombot.AccountManager = getModule("AccountManager")(Gombot, _);
  Gombot.Pages = getModule("Pages")(Gombot);
  Gombot.Crypto = getModule("GombotCrypto");
  Gombot.User = getModule("User")(Backbone, _, Gombot);
  if (typeof chrome !== "undefined") {
    Gombot.InfobarManager = getModule("InfobarManager");
    Gombot.Infobars = getModule("Infobars")(Gombot);
  }

  var currentUser = null;
  Gombot.getCurrentUser = function() {
    return currentUser;
  };

  Gombot.setCurrentUser = function(user) {
    currentUser = user;
  };

  Gombot.clearCurrentUser = function(callback) {
    if (!currentUser) { callback(); return; }
    // TODO: revisit this after sync refactor. This has some gross abstractions going on.
    currentUser.destroy({ localOnly: true, success: function() { currentUser = null; callback(); }});
  };

  Gombot.init = function(options) {
    options = options || {};
    options.storeName = options.storeName || "users";
    options.callback = options.callback || checkFirstRun;
    if (!options.testing) {
      Gombot.CommandHandler = getModule("CommandHandler")(Gombot, Gombot.Messaging, _);
    }
    // TODO: refactor this code (maybe using promises?) so the SyncAdapter
    // and UserCollection don't need to be created inside this init function.
    // Also maybe move the storage creation out of here
    new Gombot.Storage(options.storeName, function(store) {
      Gombot.SyncAdapter = getModule("SyncAdapter")(Gombot, Gombot.Crypto, store, _);
      Gombot.UserCollection = getModule("UserCollection")(Backbone, _, Gombot, store);
      options.callback();
    });
  }

  function checkFirstRun() {
    Gombot.LocalStorage.getItem("firstRun", function(firstRun) {
      fetchUsers(firstRun);
    });
  }

  function fetchUsers(firstRun) {
      Gombot.users = new Gombot.UserCollection();
      Gombot.users.fetch({
        success: function() {
          if (!firstRun) {
            Gombot.Pages.navigateTo('create_account');
            Gombot.LocalStorage.setItem("firstRun", true);
          }
          var loggedInUser = Gombot.users.find(function(user) { return user.isAuthenticated() });
          if (loggedInUser) Gombot.setCurrentUser(loggedInUser);
      }});
  }
  return Gombot;
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = _Gombot; // export namespace constructor, for Firefox
} else { // otherwise, just create the global Gombot namespace and init
  var gGombot = _Gombot({});
  gGombot.init();
}

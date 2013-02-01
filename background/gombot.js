/*
*   main.js
*
*
*   Main file that creates the Gombot namespace.
*
*/

// Gombot is optional
var _Gombot = function(importedModules, Gombot) {

  Gombot = Gombot || {};

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
  Gombot.Storage = getModule("Storage")(Backbone, _, Gombot.LocalStorage); // defined by backbone.localStorage.js
  Gombot.GombotClient = getModule("GombotClient");
  Gombot.Sync = getModule("GombotSync")(Gombot, Backbone, _);
  Gombot.LoginCredential = getModule("LoginCredential")(Gombot, Backbone, _);
  Gombot.LoginCredentialCollection = getModule("LoginCredentialCollection")(Backbone, _, Gombot.LoginCredential); // LoginCredential need to be initialized
  Gombot.CapturedCredentialStorage = getModule("CapturedCredentialStorage")(Gombot, getModule("Uri"));
  Gombot.Linker = getModule("Linker")(Gombot);
  Gombot.AccountManager = getModule("AccountManager")(Gombot, _);
  Gombot.CommandHandler = getModule("CommandHandler")(Gombot, Gombot.Messaging, _);
  Gombot.Pages = getModule("Pages")(Gombot);
  // Gombot.InfobarManager = getModule("InfobarManager");
  // Gombot.Infobars = getModule("Infobars")(Gombot);

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

  new Gombot.Storage("users", function(store) {
    Gombot.User = getModule("User")(Backbone, _, Gombot, store);
    Gombot.UserCollection = getModule("UserCollection")(Backbone, _, Gombot, store);
    checkFirstRun();
  });

  function checkFirstRun() {
    Gombot.LocalStorage.getItem("firstRun", function(firstRun) {
      initGombot(firstRun);
    });
  }

  function initGombot(firstRun) {
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
} else { // otherwise, just create the global Gombot namespace
  var Gombot = _Gombot({});
}

/*
*   main.js
*
*
*   Main file that "boots up" the extension with initGombot. Also handles popup notifications.
*
*/


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

var Gombot = {};
Gombot.Messaging = ChromeMessaging();
Gombot.TldService = TldService(Tld, Uri);
Gombot.SiteConfigs = SiteConfigs || {};
Gombot.Realms = Realms(Gombot.SiteConfigs, Uri, Gombot.TldService);
Gombot.LocalStorage = LocalStorage();
Gombot.Storage = Storage(Backbone, _, Gombot.LocalStorage); // defined by backbone.localStorage.js
Gombot.Sync = GombotSync(GombotClient, Backbone, _, Gombot);
Gombot.LoginCredential = LoginCredential(Backbone, _, Gombot.Realms);
Gombot.LoginCredentialCollection = LoginCredentialCollection(Backbone, _, Gombot.LoginCredential, Gombot.Realms);
Gombot.CapturedCredentialStorage = CapturedCredentialStorage(Gombot.Realms, Uri);
Gombot.Linker = Linker(Gombot.Realms, Gombot.LoginCredential);
Gombot.CommandHandler = CommandHandler(Gombot.Messaging,
    Gombot.CapturedCredentialStorage,
    Gombot.Realms,
    Gombot.Linker);


(function(Gombot) {
  var currentUser = null;
  Gombot.getCurrentUser = function() {
    return currentUser;
  };

  Gombot.setCurrentUser = function(user) {
    currentUser = user;
  }
})(Gombot);

new Gombot.Storage("users", function(store) {
  Gombot.User = User(Backbone, _, Gombot.LoginCredentialCollection, Gombot.Sync, store);
  Gombot.UserCollection = UserCollection(Backbone, _, Gombot.User, store);
  initGombot();
});

function initGombot() {
    Gombot.users = new Gombot.UserCollection();
    Gombot.users.fetch({
      success: function() {
        var showSignInPage = Gombot.users.size() > 0;
        startFirstRunFlow(showSignInPage);
      }});
}

//
// Infobar notifications
//

function displayInfobar(notificationObj) {
  var infobarPaths = {
    password_observed: "/infobars/remember_password_infobar.html",
    update_password: "/infobars/update_password_infobar.html",
    signup_nag: "/infobars/signup_nag_infobar.html",
    pin_entry: "/infobars/pin_entry_infobar.html"
  };
  // Make sure we have a HTML infobar for this type of notification
  if (!infobarPaths[notificationObj.notification.type]) return;
  InfobarManager.run({
    path: infobarPaths[notificationObj.notification.type],
    tabId: notificationObj.tabID,
    height: '32px'
  }, genHandlerForNotification(notificationObj));

  function genHandlerForNotification(notificationObj) {
    return function(err,response) {
      if (err) {
        console.log(err);
        return;
      }
      if (!response.type) return;
      if (!infobarHooks[response.type]) {
        console.log('Infobar returned unknown response type!');
        return;
      }
      infobarHooks[response.type].call(infobarHooks,notificationObj,response);
    };
// <<<<<<< HEAD
//     // Make sure we have a HTML infobar for this type of notification
//     if (!infobarPaths[notificationObj.notification.type]) return;
//     InfobarManager.run({
//         path: infobarPaths[notificationObj.notification.type],
//         tabId: notificationObj.tabID,
//         height: '32px'
//     }, genHandlerForNotification(notificationObj));

//     function genHandlerForNotification(notificationObj) {
//         return function(err,response) {
//             if (err) {
//                 console.log(err);
//                 return;
//             }
//             if (!response.type) return;
//             if (!infobarHooks[response.type]) {
//                 console.log('Infobar returned unknown response type!');
//                 return;
//             }
//             infobarHooks[response.type].call(infobarHooks,notificationObj,response);
//         };
//     }
// =======
  }
}

// Test function that spawns an example infobar on the current active tab.
function testInfobarNotification() {
  getActiveTab(function(tab) {
    console.log("tab url: ", tab.url,'  ', tab);
    displayInfobar({
      notify: true,
      tabID: tab.id,
      notification: {
        type: 'pin_entry',
        formEl: {},
        formSubmitURL: "",
        hash: "bc74f4f071a5a33f00ab88a6d6385b5e6638b86c",
        hostname: "t.nm.io",
        httpRealm: null,
        password: "green",
        passwordField: {},
        type: "password_observed",
        username: "gombottest",
        usernameField: {}
      }
    });
  });
}

//
// PIN validation
//

function validatePIN(_pin) {
  // If there's no PIN set, accept. Otherwise, validate.
  var currentUser = Gombot.getCurrentUser();
  return (currentUser.get('pin') === _pin);
}

/*
*   main.js
*
*
*   Main file that "boots up" the extension with initGombot. Also handles popup notifications.
*
*/

//initGombot();

var Gombot = {};
Gombot.Messaging = ChromeMessaging();
Gombot.TldService = TldService(Tld, Uri);
Gombot.SiteConfigs = SiteConfigs || {};
Gombot.Realms = Realms(Gombot.SiteConfigs, Gombot.TldService);
Gombot.CapturedCredentialStorage = CapturedCredentialStorage(Gombot.Realms);
Gombot.CommandHandler = CommandHandler(Gombot.Messaging, Gombot.CapturedCredentialStorage, Gombot.Realms);

Gombot.LocalStorage = LocalStorage();
Gombot.Storage = Storage(Backbone, _, Gombot.LocalStorage);

Gombot.LinkedSite = LinkedSite(Backbone, _);
Gombot.LinkedSiteCollection = LinkedSiteCollection(Backbone, _, Gombot.LinkedSite);
Gombot.User = User(Backbone, _, Gombot.LinkedSiteCollection);

//Gombot.LocalStorage = LocalSync(Backbone, _, Gombot.Storage);


var usersStore = new Gombot.Storage("users", function() {
    Gombot.UserCollection = UserCollection(Backbone, _, Gombot.User, usersStore);
    initGombot();
});


// var Users = new Gombot.UserCollection();
// var currentUser;

function initGombot() {
    var users = new Gombot.UserCollection();
    users.fetch();
    // Users.fetch({ success: function(collection, response, options) {
    //     currentUser = collection
    // }});
    // Load blacklisted sites from localStorage
//    loadNeverSaveOnSites();
    // Load PIN lock state from localStorage
//    loadLoginsLock();
    // if (!User.firstRun.wasCompleted()) {
    //     startFirstRunFlow();
    // }
}

//
// Content-to-chrome message handlers
//


// TODO: merge into command handlers
var messageHandlers = {
  'add_login': function(message,tabID) {
    var notificationObj = message;
    // Check to see if the user disabled password saving on this site
    User.NeverAsk.checkForHostname(notificationObj.hostname, function(shouldAsk) {
      if (!shouldAsk) return;
      notificationObj.type = 'password_observed';
      notificationObj.hash = SHA1(notificationObj.password);
      // Look for passwords in use on the current site
      getLoginsForSite(notificationObj.hostname,function(logins) {
        if (logins === undefined) logins = [];
        var loginsForSameUsername = logins.filter(
          function(l) { return l.username == notificationObj.username; }
        );
        if (loginsForSameUsername.length == 1) {
          // User already has a login saved for this site.
          if (loginsForSameUsername[0].password == notificationObj.password) {
            // We're just logging into a site with an existing login. Bail.
            return;
          }
          else {
            // Prompt user to update password
            notificationObj.type = 'update_password';
            // If the existing login stored for this site was PIN locked,
            // make sure this new one will be also.
            notificationObj.pinLocked = logins[0].pinLocked;
          }
        }
        // Has the user signed up for a Gombot account?
        checkIfDidFirstRun(function(didFirstRun) {
          if (didFirstRun) {
            // Prompt the user to save the login
            displayInfobar({
              notify: true,
              tabID: tabID,
              notification: notificationObj
            });
          }
          else {
            // Browser not associated with Gombot account, offer
            // to create one/log in.
            displayInfobar({
              notify: true,
              tabID: tabID,
              notification: {
                type: 'signup_nag'
              }
            });
          }
        });
      });
    });
  },
  'validate_pin': function(message,tabID,sendResponse) {
    sendResponse({
      'is_valid': validatePIN(message.pin)
    });
  }
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
  return (!Boolean(User.PIN.get())) || User.PIN.validate(_pin);
}

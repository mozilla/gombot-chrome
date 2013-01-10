/*
*   main.js
*
*
*   Main file that "boots up" the extension with initSkyCrane. Also handles popup notifications.
*
*/

initSkyCrane();

function initSkyCrane() {
  if (!User.firstRun.wasCompleted()) {
    startFirstRunFlow();
  }
}

//
// Content-to-chrome message handlers
//

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
        // TODO: Send new login to server
      });
    })
  },
  'observing_page': function(message,tabID) {
    // See if there are login forms on this page. If not, there's nothing to do
    // on the observing_page notification, so bail.
    if (message.num_login_forms == 0) return;
    
    // Search for logins for this particular site
    getLoginsForSite(message.hostname, function(logins) {
      if (logins.length == 0) return;

      if (logins.length == 1) {
        // Is the login for this site PIN locked?
        if (logins[0].pinLocked) {
          // If it is, show the PIN entry infobar.
          displayInfobar({
            notify: true,
            tabID: tabID,
            notification: {
              type: 'pin_entry',
              // Include the tabID in the notification so the infobar handler
              //  can trigger autofill in the correct tab.
              tabID: tabID
            }
          });
        }
        else {
          // If it's not, form fill the page now.
          chrome.tabs.sendMessage(tabID,{
            type: 'fill_form',
            login: logins[0]
          });          
        }
        
        // If there's only a single login form on the page, we're fine. Otherwise,
        // see if we were able to record an id or a name for the form when we observed
        // the login.
        // TODO: Check to see if the id/name is still valid

        // If we remember specifics about a login form, check to see if it's there.
        // If it is, offer to autologin.
        if (logins[0].formEl && (logins[0].formEl.name || logins[0].formEl.id)) {
          chrome.tabs.sendMessage(tabID,{
            type: 'confirm_form_exists',
            login: logins[0]
          });
        }
      }
      else {
        // TODO: Prompt user for choice of logins
      }
    });
  },
  'validate_pin': function(message,tabID,sendResponse) {
    sendResponse({
      'is_valid': validatePIN(message.pin)
    });
  }
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type && messageHandlers[request.type]) {
    messageHandlers[request.type].call(messageHandlers,request.message,sender.tab.id,sendResponse);
  }
});

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

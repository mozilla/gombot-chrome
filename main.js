/*
*   main.js
*
*
*   Main file that "boots up" the extension with initSkyCrane. Also handles popup notifications.
*
*/


// Maps a notificationID to the data extracted from it by an g.
var loginData = {};

// Incrementing counter of last notification ID
var lastNotificationID = 0;

initSkyCrane();

function initSkyCrane() {
    // Load blacklisted sites from local storage
    getNeverSaveOnSites(function(siteNames) { neverSaveOnSites = siteNames; });
    // Check to see if a PIN lock is enabled
    chrome.storage.local.get('logins_lock', function(storageObj) {
        if (storageObj.logins_lock === undefined) storageObj.logins_lock = {type: 'none'};
        loginsLock = storageObj.logins_lock;
    });
	checkIfDidFirstRun(function(didFirstRun) {
		console.log('didFirstRun: ', didFirstRun);
		if (!didFirstRun) {
			startFirstRunFlow();
		}
	})
}

//
// Content-to-chrome message handlers
//

// TODO: Handle "fill_form" message
var messageHandlers = {
    'add_login': function(message,tabID) {
        var notificationObj = message;
        // Check to see if the user disabled password saving on this site
        if (neverSaveOnSites.indexOf(notificationObj.hostname) != -1) return;
        notificationObj.type = 'password_saved';
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
                    notificationObj.type = 'confirm_save';
                }
            }
            // Prompt the user to save the login
            displayNotification({
                notify: true,
                tabId: tabID,
                notification: notificationObj
            });
            // TODO: Send new login to server
            // TODO: Enable SkyCrane page action for all tabs on this domain.
        });   
    },
    'login_success': function(message,tabID) {
        console.log('Successfully logged in with ',JSON.stringify(message));
    },
    'observing_page': function(message,tabID) {
        console.log('got observing_page\n',JSON.stringify(message));
        // See if we can automatically log user into this page. If not, there's nothing to do
        // on the observing_page notification, so bail.
        
        // Search for logins for this particular site
        getLoginsForSite(message.hostname, function(logins) {
            if (logins.length == 0) return;
                        
            if (logins.length == 1) {
                // Check if the login is not PIN locked. If it's not, form fill the page now.
                if (!logins[0].pin_locked) {
                    chrome.tabs.sendMessage(tabID,{
                        type: 'fill_form',
                        login: logins[0]
                    });
                }
                
                // If there's only a single login form on the page, we're fine. Otherwise,
                // see if we were able to record an id or a name for the form when we observed
                // the login.
                // TODO: Check to see if the id/name is still valid

                // If there's only one login form on the page, offer to autologin
                if (message.single_login_form) {
                    offerAutologin(tabID,logins[0]);
                    return;
                }
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
    'ask_for_autologin': function(message,tabID) {
        offerAutologin(tabID,message.login);
    }
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type && messageHandlers[request.type]) {
        messageHandlers[request.type].call(messageHandlers,request.message,sender.tab.id);   
    }
});

//
// Popup notifications
//
  
function offerAutologin(tabID,login) {
    displayNotification({
      notify: true,
      tabId: tabID,
      notification: {
          login: login,
          type: 'ask_for_autologin',
      }
    });
}

function displayNotification(notificationObj) {
  loginData[lastNotificationID] = notificationObj;
  var notif = webkitNotifications.createHTMLNotification('data/notification.html#' + lastNotificationID);
  notif.show();
      
  loginData[lastNotificationID].popupNotifs = [notif];
  lastNotificationID++;
}
  
function getNotificationForID(notifID) {
  return loginData[notifID].notification;
}

//
// PIN creation and validation
//

// Prompts the user to create a new PIN in a popup window. We should be able to
// remove this soon, since PIN creation now happens in the first run flow.
function createPIN() {
  promptUserForPIN("Please enter a 4-digit PIN code to lock your sites.", true, function(newPIN) {
	  setAndSavePIN(newPIN);
  });
}


function validatePIN(_pin) {
    // If there's no PIN set, accept.
    if (!loginsLock || !loginsLock.pin) return true;
    return _pin == loginsLock.pin;
}
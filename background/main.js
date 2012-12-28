/*
*   main.js
*
*
*   Main file that "boots up" the extension with initSkyCrane. Also handles popup notifications.
*
*/

//initSkyCrane();

var Gombot = {};
Gombot.Messaging = ChromeMessaging();
Gombot.TldService = {};
Gombot.CapturedCredentialStorage = CapturedCredentialStorage(Gombot.TldService);
Gombot.CommandHandler = CommandHandler(Gombot.Messaging, Gombot.CapturedCredentialStorage);


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
	});
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

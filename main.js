const SKYCRANE_SERVER  = 'http://localhost:8000';


/*

FOR TOMORROW:

- Replace existing passwords
- Make autofill work
- Integrate watchdog-manager
- Advise on password strength on signup and password change forms
- Get a master password system working, with PBKDF and chrome sync store
- Get auth working on server.js, with bookmarklet
- Super bonus: Facebook automation

Record screencast on friday for identity team?

done: 

- Make the notification button funcs here in main work!
- Get local storage working 

*/

var socket = io.connect(SKYCRANE_SERVER);

console.log('In chrome script');

// Maps a notificationID to the data extracted from it by an observer.
var loginData = {};

var lastNotificationID = 0;

// List of hostnames the user has asked passwords not to be saved on.
// Kept in sync with local storage.
var neverSaveOnSites = [];


initSkyCrane();

function initSkyCrane() {
    // Load blacklisted sites from local storage
    getNeverSaveOnSites(function(siteNames) { neverSaveOnSites = siteNames; });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        url: SKYCRANE_SERVER + "/persona_auth"
    }, function(tab) {
        chrome.tabs.executeScript(tab.id, {file: "data/auth_content_script.js"});
    });
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'add_login') {
        var notificationObj = request.message;
        // Check to see if the user disabled password saving on this site
        if (neverSaveOnSites.indexOf(notificationObj.hostname) != -1) return;
        notificationObj.type = 'password_saved';
        notificationObj.hash = SHA1(notificationObj.password);
        // Look for passwords in use on the current site
        getLoginsForSite(notificationObj.hostname,function(logins) {
            if (logins === undefined) logins = [];
            var loginsForSameUsername = logins.filter(
                function(l) { return l.username == notificationObj.username }
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
                tabId: sender.tab.id,
                notification: notificationObj
            });
        
            // socket.emit('add_login',request.message);
            // chrome.tabs.get(sender.tab.id,function(tab) {
            //         });
        
            console.log("add_login for tab: " + sender.tab.id);
            
        });
    }
    else if (request.type == 'login_success') {
        console.log('Successfully logged in with ',JSON.stringify(request.message));
    }
    else if (request.type == 'observing_page') {
        console.log('got observing_page\n',JSON.stringify(request.message));
        // See if we can automatically log user into this page. If not, there's nothing to do
        // on the observing_page notification, so bail.
        
        // Search for logins for this particular site
        getLoginsForSite(request.message.hostname, function(logins) {
            console.log("logins: ", logins);
            if (logins.length == 0) return;
            if (logins.length == 1) {
                console.log('checking to see if we can autologin');
                // If there's only a single login form on the page, we're fine. Otherwise,
                // see if we were able to record an id or a name for the form when we observed
                // the login.
                // TODO: Check to see if the id/name is still valid

                function offerAutologin() {
                    displayNotification({
                        notify: true,
                        tabId: sender.tab.id,
                        notification: {
                            login: logins[0],
                            type: 'ask_for_autologin',
                        }
                    });
                }

                // If there's only one login form on the page, offer to autologin
                if (request.message.single_login_form) offerAutologin();

                // If we remember specifics about a login form, check to see if it's there.
                // If it is, offer to autologin.
                if (logins[0].formEl && (logins[0].formEl.name || logins[0].formEl.id)) {
                    chrome.tabs.sendMessage(sender.tab.id,{
                        type: 'confirm_form_exists',
                        login: logins[0]
                    });
                }
            }
            else {
                // TODO: Prompt user for choice                
            }
        });
        
    }
    else if (request.type == 'ask_for_autologin') {
        console.log('request: ', request);
        displayNotification({
            notify: true,
            tabId: sender.tab.id,
            notification: {
                login: request.login,
                type: 'ask_for_autologin',
            }
        });
    }
    else if (request.type == 'fill_form') {
        // TODO
    }
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
  });

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
  
  function saveToStorage(newLogin) {      
      console.log('in saveToStorage');
      // TODO: Encrypt data, and send over chrome sync?
      var siteLoginsKey = 'logins_' + newLogin.hostname;
      chrome.storage.local.get(siteLoginsKey, function(storageObj) {
          console.log('recovered storageobj:' , storageObj);
          var storageLogins = storageObj[siteLoginsKey];
          if (storageLogins === undefined) storageLogins = {};
          if (storageLogins.stored_logins === undefined) storageLogins.stored_logins = [];
          storageLogins.stored_logins.push(newLogin);
          storageObj[siteLoginsKey] = storageLogins;
      console.log('newLogin = ', newLogin);
      console.log("storagelogins = ", storageLogins);
      console.log("storageObj = ", storageObj);
          chrome.storage.local.set(storageObj);
      });
  }
  
  function neverSaveOnSite(siteHostname) {
      console.log('neverSaveOnSite: ', siteHostname);
      getNeverSaveOnSites(function(storedSites) {
          storedSites.push(siteHostname);
          chrome.storage.local.set({
              'never_save_on': storedSites
          });
          neverSaveOnSites = storedSites;
      });
  }
  
  function getNeverSaveOnSites(callback) {
      chrome.storage.local.get('never_save_on', function(storageObj) {
          var storedSites = storageObj.never_save_on;
          if (storedSites === undefined) storedSites = [];
          callback(storedSites);
      });
  }
  
  function getLoginsForSite(hostname,callback) {
      var siteLoginsKey = 'logins_' + hostname;
      chrome.storage.local.get(siteLoginsKey, function(storageObj) {
          if (storageObj[siteLoginsKey] == undefined) storageObj[siteLoginsKey] = {};
          var storedLogins = storageObj[siteLoginsKey].stored_logins;
          if (storedLogins === undefined) storedLogins = [];
          callback(storedLogins);
      });
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////
  // Callback functions for a notification window (see data/notification.js)
  ///////////////////////////////////////////////////////////////////////////////////////////
  
  function saveLogin(notifID) {
    console.log('saveLogin for notifID: ', notifID);

    saveToStorage(loginData[notifID].notification);
    closeNotif(notifID);
  }
  
  function notNow(notifID) {
    console.log('notNow for notifID: ', notifID);
    closeNotif(notifID);
  }
  
  function neverForSite(notifID) {
    console.log('neverForSite for notifID: ', notifID);
    neverSaveOnSite(loginData[notifID].notification.hostname);
    closeNotif(notifID);
  }
  
  function closeNotif(notifID) {
      loginData[notifID].popupNotifs[0].close();
      delete loginData[notifID];
  }
  
  function doAutologin(notifID) {      
      console.log('doAutologin');
      
      chrome.tabs.sendMessage(loginData[notifID].tabId,{
          type: 'do_autologin',
          login: loginData[notifID].notification.login
      });
  }
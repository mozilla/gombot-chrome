const SKYCRANE_SERVER  = 'http://localhost:8000';

var socket = io.connect(SKYCRANE_SERVER);

console.log('In chrome script');

// Maps a notificationID to the data extracted from it by an observer.
var loginData = {};

var lastNotificationID = 0;

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({
        url: SKYCRANE_SERVER + "/persona_auth"
    }, function(tab) {
        chrome.tabs.executeScript(tab.id, {file: "data/auth_content_script.js"});
    });
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'add_login') {
        // Prompt the user to save the login
        displayNotification({
            notify: true,
            tabId: sender.tab.id,
            notification: {
                type: 'password_saved',
                hash: SHA1(request.message.password),
                hostname: request.message.hostname,
                username: request.message.username
            }
        });
        
        // socket.emit('add_login',request.message);
        // chrome.tabs.get(sender.tab.id,function(tab) {
        //         });
        
        console.log("add_login for tab: " + sender.tab.id);

    }
    else if (request.type == 'login_success') {
        console.log('Successfully logged in with ',JSON.stringify(request.message));
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
      // TODO: Encrypt data, and send over chrome sync?
      chrome.storage.local.get('logins', function(storageLogins) {
          var siteName = request.message.hostname;
          if (storageLogins.sites === undefined) storageLogins.sites = {};
          if (storageLogins.sites[siteName] === undefined) storageLogins.sites[siteName] = [];
          storageLogins.sites[siteName].push(request.message);
          chrome.storage.local.set({'logins': storageLogins});
         
      });      
  }
  
  function saveLogin(notifID) {
    console.log('saveLogin for notifID: ', notifID);
    closeNotif(notifID);
  }
  
  function notNow(notifID) {
    console.log('notNow for notifID: ', notifID);
    closeNotif(notifID);
  }
  
  function neverForSite(notifID) {
      console.log('neverForSite for notifID: ', notifID);
      closeNotif(notifID);
  }
  
  function closeNotif(notifID) {
      loginData[notifID].popupNotifs[0].close();
      delete loginData[notifID];
  }
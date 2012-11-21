/*
*   notif_hooks.js
*
*
*   Contains the callback functions for the popup notifications on the desktop.
*   (see data/notification.js)
*
*/

function doAutologin(notifID) {      
    console.log('doAutologin');
    function autologin() {
        chrome.tabs.sendMessage(activeNotifications[notifID].tabID,{
            type: 'do_autologin',
            login: activeNotifications[notifID].notification.login
        });
        closeNotif(notifID);
    }
    activeNotifications[notifID].popupNotifs[0].close();
    if (activeNotifications[notifID].notification.login.pin_locked) {
        function promptForLoginPIN(message) {
            message = message ? message : "Please enter your PIN to log into this site.";
            promptUserForPIN(message,false,
                function(enteredPIN) {
                    if (validatePIN(enteredPIN)) {
                        autologin();
                    }
                    else {
                        promptForLoginPIN("Sorry, that was incorrect. Try again. Please enter your PIN to log into this site.");
                    }
            });
        }
        promptForLoginPIN();
        return;
    }
    autologin();
}

function saveLoginAndCloseNotif(notifID) {
  saveToStorage(activeNotifications[notifID].notification);
  closeNotif(notifID);
}

function saveLoginWithPin(notifID) {
    console.log('saveLoginWithPin for notifID: ', notifID);

    activeNotifications[notifID].notification.pin_locked = true;
    console.log('saveLoginWithPin:',activeNotifications[notifID]);
    saveLoginAndCloseNotif(notifID);
    
    if (loginsLock.type != 'pin') {
        createPIN();
    }
}
  
function saveLogin(notifID) {
    console.log('saveLogin for notifID: ', notifID);

    saveLoginAndCloseNotif(notifID);
}
  
function updateLogin(notifID) {
    console.log('updateLogin for notifID: ', notifID);

    saveLoginAndCloseNotif(notifID);
}
  
function notNow(notifID) {
    console.log('notNow for notifID: ', notifID);
    closeNotif(notifID);
}
  
function neverForSite(notifID) {
    console.log('neverForSite for notifID: ', notifID);
    neverSaveOnSite(activeNotifications[notifID].notification.hostname);
    closeNotif(notifID);
}
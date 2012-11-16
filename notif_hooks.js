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
        chrome.tabs.sendMessage(loginData[notifID].tabId,{
            type: 'do_autologin',
            login: loginData[notifID].notification.login
        });
        closeNotif(notifID);
    }
    loginData[notifID].popupNotifs[0].close();
    if (loginData[notifID].notification.login.pin_locked) {
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
  saveToStorage(loginData[notifID].notification);
  closeNotif(notifID);
}

function saveLoginWithPin(notifID) {
    console.log('saveLoginWithPin for notifID: ', notifID);

    loginData[notifID].notification.pin_locked = true;
    console.log('saveLoginWithPin:',loginData[notifID]);
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
    neverSaveOnSite(loginData[notifID].notification.hostname);
    closeNotif(notifID);
}
  
function closeNotif(notifID) {
    loginData[notifID].popupNotifs[0].close();
    delete loginData[notifID];
}
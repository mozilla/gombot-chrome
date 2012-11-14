/*
*   notification.js
*
*
*   This code runs inside of a Chrome desktop notification and prompts users to decide how to have
*   Skycrane use data they entered into a login form.
*
*   For example, this creates the alert dialog that asks you if you would like to ignore, save, or save
*   and PIN lock a new password.
*
*/


var notifID = null;

function init() {
    // Notification ID is stored after the hash ('#') in the URL
    notifID = parseInt(window.location.hash.substr(1));
    
    // Get the notification object from the background script
    var notifObj = chrome.extension.getBackgroundPage().getNotificationForID(notifID);
    
    displayAlert(notifObj);
}
    
function getAlertBody(alertObj) {
    var bPage = chrome.extension.getBackgroundPage();
    var bodyEl = document.createElement('div');
    if (alertObj.type == 'password_saved') {
        bodyEl.appendChild(document.createTextNode("Save this password and lock it with a pin code?"));
            
        // Show save buttons, and wire to events
        document.getElementById('save-login-widget').style.display = 'block';
            
        function wire(func,id) {
            return function() { func(id); };
        }
            
        document.getElementById('btn-save-with-pin').addEventListener('click', wire(bPage.saveLoginWithPin,notifID));
        document.getElementById('btn-save-no-pin').addEventListener('click', wire(bPage.saveLogin,notifID));
        document.getElementById('btn-not-now').addEventListener('click', wire(bPage.notNow,notifID));
        document.getElementById('btn-never-for-site').addEventListener('click', wire(bPage.neverForSite,notifID));
        // document.getElementById('btn-save').addEventListener('click', wire(bPage.saveLogin,notifID));

    }
    else if (alertObj.type == 'confirm_save') {
        bodyEl.appendChild(document.createTextNode("Should SkyCrane update the password for " + alertObj.username + " on " + alertObj.hostname + "?"));
        document.getElementById('confirm-widget').style.display = 'block';
        document.getElementById('btn-confirm-update').addEventListener('click',function() {
            bPage.updateLogin(notifID);
        })
    }
    else if (alertObj.type == 'choose_login') {
        bodyEl.appendChild(document.createTextNode("Which username should SkyCrane use?"));
        var loginSelectWidget = document.getElementById('login-select');
        for (var login in alertObj.logins) {
            var newOption = document.createElement('option');
            newOption.value = alertObj.logins[login].username;
            newOption.appendChild(document.createTextNode(alertObj.logins[login].username));
            loginSelectWidget.appendChild(newOption);
        }
        document.getElementById('choose-login-widget').style.display = 'block';
    }
    else if (alertObj.type == 'ask_for_autologin') {
        bodyEl.appendChild(document.createTextNode("SkyCrane can automatically log you into this site with username " + alertObj.login.username + ". Go ahead?"));
        document.getElementById('autologin-widget').style.display = 'block';
        document.getElementById('btn-confirm-autologin').addEventListener('click',function() {
            bPage.doAutologin(notifID);
        });
    }
    return bodyEl;
}

function displayAlert(alertObj) {
    document.body.insertBefore(getAlertBody(alertObj),document.body.children[0]);
}

function getDataURLForHash(passwordHash,inputWidth,inputHeight,numColorBars) {
    function randomizeHash(passwordHash) {
        // Add a little bit of randomness to each byte
        for (var byteIdx = 0; byteIdx < passwordHash.length/2; byteIdx++) {
            var byte = parseInt(passwordHash.substr(byteIdx*2,2),16);
            // +/- 3, within 0-255
            byte = Math.min(Math.max(byte + parseInt(Math.random()*6)-3,0),255);
            var hexStr = byte.toString(16).length == 2 ? byte.toString(16) : '0' + byte.toString(16);
            passwordHash = passwordHash.substr(0,byteIdx*2) + hexStr + passwordHash.substr(byteIdx*2+2);
        }
        return passwordHash;
    }
        
    if (!(numColorBars = Number(numColorBars)))
        numColorBars = 4;
    
    // Make sure there's enough data for the number of desired colorBars
    numColorBars = Math.min(numColorBars,passwordHash.length/6);
    
    var canvas = document.createElement('canvas');
    canvas.height = inputHeight;
    canvas.width = inputWidth;
    var context = canvas.getContext('2d');
    
    passwordHash = randomizeHash(passwordHash);

    for (var hashBandX = 0; hashBandX < numColorBars; hashBandX++) {
        context.fillStyle='#' + passwordHash.substr(hashBandX*6,6);
        context.fillRect(hashBandX/numColorBars*inputWidth,0,inputWidth/numColorBars,inputHeight);
        
        context.fillStyle='#000000';
        context.fillRect(((hashBandX+1)/numColorBars*inputWidth)-1,0,2,inputHeight);
    }

    context.strokeStyle='#000000';

    return canvas.toDataURL();
}

window.onload = init;
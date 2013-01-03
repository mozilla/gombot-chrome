/*
*   infobar_hooks.js
*
*
*   Contains the callback functions for infobars.
*
*/

var infobarHooks = {
    'password_observed': function (notificationObj,infobarResponse) {
        switch (infobarResponse.user_action) {
            case 'save':
                saveLoginToStorage(notificationObj.notification);
            break;
        
            case 'pin_lock':
                notificationObj.notification.pinLocked = true;
                saveLoginToStorage(notificationObj.notification);
            break;
        
            case 'never_for_this_site':
                neverSaveOnSite(notificationObj.notification.hostname);
            break;
                        
            default:
                console.log("Unknown response from password_observed infobar!");
            break;
        }
    },
    'signup_nag': function (notificationObj,infobarResponse) {
        if (infobarResponse.user_action == 'launch_signup') {
            startFirstRunFlow();
        }
    },
    'pin_entry': function(notificationObj,infobarResponse) {
        if (infobarResponse.pin_valid) {
            console.log(notificationObj)
            chrome.tabs.get(notificationObj.tabID, function(tab) {
                formFillTab(tab);
            });
        }   
    },
    'update_password': function(notificationObj,infobarResponse) {
        saveLoginToStorage(notificationObj.notification);
    }
}

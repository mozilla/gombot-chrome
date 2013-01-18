/*
*   infobar_hooks.js
*
*
*   Contains the callback functions for infobars.
*
*/

var infobarHooks = {
    'password_observed': function (notificationObj,infobarResponse) {
        //console.log(notificationObj);
        var loginInfo = notificationObj.notification;
        var currentUser = Gombot.getCurrentUser();
        switch (infobarResponse.user_action) {
            case 'save':
                Gombot.Linker.link(currentUser, loginInfo);
            break;

            case 'pin_lock':
                loginInfo.pinLocked = true;
                Gombot.Linker.link(currentUser, loginInfo);
            break;

            case 'never_for_this_site':
                Gombot.Linker.disableSite(user, loginInfo);
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
            //console.log(notificationObj)
            if (notificationObj.notification.callback) {
                notificationObj.notification.callback()
            }
            else {
                chrome.tabs.get(notificationObj.tabID, function(tab) {
                    formFillTab(tab);
                });
            }
        }
    },
    'update_password': function(notificationObj,infobarResponse) {
        var loginInfo = notificationObj.notification;
        var currentUser = Gombot.getCurrentUser();
        Gombot.Linker.link(currentUser, loginInfo);
    }
}

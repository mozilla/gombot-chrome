/*
*   infobar_hooks.js
*
*
*   Contains the callback functions for infobars.
*
*/

function formatStoredLogin(login) {
  return {
    username: login.username,
    password: login.password,
    origins: [ login.origin ],

    // Fields that may be missing
    title: login['title'] || '',
    url: login['url'] || '',
    pinLocked: login['pinLocked'] || false,
    supplementalInformation: login['supplementalInformation'] || {}
  };
}

var infobarHooks = {
    'password_observed': function (notificationObj,infobarResponse) {
        console.log(notificationObj);
        var formattedLoginObj = formatStoredLogin(notificationObj.notification);
        var newLogin = new Gombot.LoginCredential(formattedLoginObj);
        var currentUser = Gombot.getCurrentUser();
        switch (infobarResponse.user_action) {
            case 'save':
                currentUser.get('logins').add(newLogin);
                currentUser.save();
            break;

            case 'pin_lock':
                newLogin.set({
                  'pinLocked': true
                });
                currentUser.get('logins').add(newLogin);
                currentUser.save();
            break;

            case 'never_for_this_site':
                var origin = formattedLoginObj.origins[0];
                currentUser.get('disabledSites')[origin] = 'all';
                currentUser.save();
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
    // TODO: fix this
    'update_password': function(notificationObj,infobarResponse) {
        User.Logins.add(notificationObj.notification);
    }
}

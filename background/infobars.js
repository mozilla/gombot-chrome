var Infobars = function(Gombot) {
  var infobarPaths = {
    password_observed: "/infobars/remember_password_infobar.html",
    update_password: "/infobars/update_password_infobar.html",
    signup_nag: "/infobars/signup_nag_infobar.html",
    pin_entry: "/infobars/pin_entry_infobar.html"
  };

  var infobarHooks = {
      'password_observed': function (notificationObj,infobarResponse) {
          //console.log(notificationObj);
          var loginInfo = notificationObj.notification;
          var currentUser = Gombot.getCurrentUser();
          // first delete the captured credentials
          Gombot.CapturedCredentialStorage.deleteCredentials({ id: loginInfo.tabID });
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

              case 'dismissed':
              break;

              default:
                  console.log("Unknown response from password_observed infobar!");
              break;
          }
      },
      'signup_nag': function (notificationObj,infobarResponse) {
          var loginInfo = notificationObj.notification;
          // first delete the captured credentials
          Gombot.CapturedCredentialStorage.deleteCredentials({ id: loginInfo.tabID });
          // if (infobarResponse.user_action == 'launch_signup') {
          //     startFirstRunFlow();
          // }
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
          // first delete the captured credentials
          Gombot.CapturedCredentialStorage.deleteCredentials({ id: loginInfo.tabID });
          if (infobarResponse.user_action === 'do_update') {
            Gombot.Linker.link(currentUser, loginInfo);
          }
      }
  };

  function displayInfobar(notificationObj) {
    // Make sure we have a HTML infobar for this type of notification
    if (!infobarPaths[notificationObj.notification.type]) return;
    Gombot.InfobarManager.run({
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

  return {
    displayInfobar: displayInfobar
  };
}

if (typeof module != 'undefined' && module.exports) {
  module.exports = Infobars;
}


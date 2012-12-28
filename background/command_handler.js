var CommandHandler = function(Messaging, CapturedCredentialStorage) {

  function addLogin(message, sender) {
    var notificationObj = message,
        tabID = sender.tab.id;
    // Check to see if the user disabled password saving on this site
    if (neverSaveOnSites.indexOf(notificationObj.hostname) != -1) return;
    notificationObj.type = 'password_observed';
    notificationObj.hash = SHA1(notificationObj.password);
    // Look for passwords in use on the current site
    getLoginsForSite(notificationObj.hostname,function(logins) {
      if (logins === undefined) logins = [];
      var loginsForSameUsername = logins.filter(
        function(l) { return l.username == notificationObj.username; }
        );
      if (loginsForSameUsername.length == 1) {
        // User already has a login saved for this site.

        if (loginsForSameUsername[0].password == notificationObj.password) {
          // We're just logging into a site with an existing login. Bail.
          return;
        }
        else {
          // Prompt user to update password
                      notificationObj.type = 'update_password';
          // If the existing login stored for this site was PIN locked,
          // make sure this new one will be also.
          notificationObj.pin_locked = logins[0].pin_locked;
        }
      }
      // Has the user signed up for a Gombot account?
      checkIfDidFirstRun(function(didFirstRun) {
        if (didFirstRun) {
          // Prompt the user to save the login
          displayInfobar({
            notify: true,
            tabID: tabID,
            notification: notificationObj
          });
        }
        else {
          // Browser not associated with Gombot account, offer
          // to create one/log in.
          displayInfobar({
            notify: true,
            tabID: tabID,
            notification: {
              type: 'signup_nag'
            }
          });
        }
      });
      // TODO: Send new login to server
    });
  }

  function observingPage(message, sender) {
    var tabID = sender.tab.id;
    // See if there are login forms on this page. If not, there's nothing to do
    // on the observing_page notification, so bail.
    if (message.num_login_forms == 0) return;
    // Search for logins for this particular site
    getLoginsForSite(message.hostname, function(logins) {
      if (logins.length == 0) return;

      if (logins.length == 1) {
        // Is the login for this site PIN locked?
        if (logins[0].pin_locked) {
          // If it is, show the PIN entry infobar.
          displayInfobar({
            notify: true,
            tabID: tabID,
            notification: {
              type: 'pin_entry',
              // Include the tabID in the notification so the infobar handler
              //  can trigger autofill in the correct tab.
              tabID: tabID
            }
          });
        }
        else {
          // If it's not, form fill the page now.
          Messaging.messageToContent(sender,{
            type: 'fill_form',
            login: logins[0]
          });
        }

        // If there's only a single login form on the page, we're fine. Otherwise,
        // see if we were able to record an id or a name for the form when we observed
        // the login.
        // TODO: Check to see if the id/name is still valid

        // If we remember specifics about a login form, check to see if it's there.
        // If it is, offer to autologin.
        if (logins[0].formEl && (logins[0].formEl.name || logins[0].formEl.id)) {
          Messaging.messageToContent(sender, {
            type: 'confirm_form_exists',
            login: logins[0]
          });
        }
      }
      else {
        // TODO: Prompt user for choice of logins
      }
    });
  }

  function validatePin(message, sender, callback) {
    callback({
        'is_valid': validatePIN(args.pin) // TODO: need to port this over
    });
  }

  function setCapturedCredentials(message, sender, callback) {
    CapturedCredentialStorage.setCredentials(message, sender.tab);
  }

  function getCapturedCredentials(message, sender, callback) {
    CapturedCredentialStorage.getCredentials(message, sender.tab, callback);
  }

  function deleteCapturedCredentials(message, sender, callback) {
    CapturedCredentialStorage.deleteCredentials(message, sender.tab);
  }

  var commandHandlers = {
    'add_login': addLogin,
    'observing_page': observingPage,
    'validate_pin': validatePin,
    'set_captured_credentials': setCapturedCredentials,
    'get_captured_credentials': getCapturedCredentials,
    'delete_captured_credentials': deleteCapturedCredentials
  };

  //
  // Content-to-chrome message handlers
  //
  Messaging.addContentMessageListener(function(request, sender, sendResponse) {
    if (request.type && commandHandlers[request.type]) {
      console.log("Msg received", request);
      commandHandlers[request.type].call(commandHandlers,request.message,sender,sendResponse);
    }
  });
};
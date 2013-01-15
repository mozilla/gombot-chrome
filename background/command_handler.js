var CommandHandler = function(Messaging, CapturedCredentialStorage, Realms) {
  function addLogin(message, sender) {
    var currentUser = Gombot.getCurrentUser();
    var notificationObj = message,
        tabID = sender.tab.id,
        username = notificationObj.username;
    // User.NeverAsk.checkForHostname(notificationObj.hostname, function(shouldAsk) {
    // Check to see if the user disabled password saving on this site
    console.log("addLogin:", notificationObj);
    if (currentUser.get('disabledSites')[notificationObj.hostname]) return;
    notificationObj.type = 'password_observed';
    // Look for passwords in use on the current site
    var loginForSameUsername = currentUser.get('logins').find(function(login) {
      return login.get('hostname') === hostname &&
              login.get('username') === username;
    });
    if (loginForSameUsername) {
      if (loginForSameUsername.get("password") === password) {
        // We're just logging into a site with an existing login. Bail.
        return;
      }
      else {
        // Prompt user to update password
        notificationObj.type = 'update_password';
        // If the existing login stored for this site was PIN locked,
        // make sure this new one will be also.
        notificationObj.pinLocked = loginForSameUsername.get("pinLocked");
      }
    }
    if (currentUser && currentUser.keys) {
      // Prompt the user to save the login
      displayInfobar({
        notify: true,
        tabID: tabID,
        notification: notificationObj
      });
    } else {
      displayInfobar({
        notify: true,
        tabID: tabID,
        notification: {
          type: 'signup_nag'
        }
      });
    }
  }

  function validatePin(message, sender, callback) {
    callback({
        'is_valid': validatePIN(message.pin) // TODO: need to port this over
    });
  }

  function setCapturedCredentials(message, sender, callback) {
    CapturedCredentialStorage.setCredentials(message, sender.tab);
  }

  function getCapturedCredentials(message, sender, callback) {
    CapturedCredentialStorage.getCredentials(message, sender.tab, callback);
  }

  function deleteCapturedCredentials(message, sender, callback) {
    CapturedCredentialStorage.deleteCredentials(sender.tab);
  }

  function getSavedCredentials(message, sender, callback) {
    var hostname = Realms.getRealm(sender.tab.url);
    var currentUser = Gombot.getCurrentUser();
    var logins = [];
    if (currentUser) {
      logins = currentUser.get('logins').filter(function(x) { 
        return x.hostname === hostname;
      }); 
    }
    callback(logins);
    // Chrome requires that we return true if we plan to call a callback
    // after an onMessage function returns.
    return true;
  }

  function showPINPromptInfobar(message, sender, callback) {
      displayInfobar({
        notify: true,
        tabID: sender.tab,
        notification: {
          type: 'pin_entry',
          // Include the tabID in the notification so the infobar handler
          // can trigger autofill in the correct tab.
          tabID: sender.tab.id,
          callback: callback
        }
      });
      return true;
  }

  function getSiteConfig(message, sender, callback) {
    callback(Gombot.SiteConfigs[Gombot.TldService.getDomain(sender.tab.url)] || {});
  }

  var commandHandlers = {
    'add_login': addLogin,
    'validate_pin': validatePin,
    'prompt_for_pin': showPINPromptInfobar,
    'set_captured_credentials': setCapturedCredentials,
    'get_captured_credentials': getCapturedCredentials,
    'delete_captured_credentials': deleteCapturedCredentials,
    'get_saved_credentials': getSavedCredentials,
    'get_site_config': getSiteConfig
  };

  //
  // Content-to-chrome message handlers
  //
  Messaging.addContentMessageListener(function(request, sender, sendResponse) {
    if (request.type && commandHandlers[request.type]) {
      //console.log("Msg received", request, sender);
      return commandHandlers[request.type].call(commandHandlers,request.message,sender,sendResponse);
    }
  });
};
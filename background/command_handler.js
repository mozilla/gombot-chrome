var CommandHandler = function(Messaging, CapturedCredentialStorage, Realms) {
  function addLogin(message, sender) {
    var currentUser = Gombot.getCurrentUser();
    var tabID = sender.tab.id,
        origin = message.origin,
        username = message.username,
        password = message.password;

    // Check to see if the user disabled password saving on this site
    if (currentUser.get('disabledSites')[origin] === 'all') {
      return;
    }
    message.type = 'password_observed';
    // Look for passwords in use on the current site
    var loginForSavedUsername = currentUser.get('logins').find(function(login) {
      // TODO, FIXME: This assumes non-user-edited realms, meaning each realm will be an
      //              array of 1 non-wildcarded realm
      return Realms.isOriginMemberOfRealm(origin,
        Realms.getRealmForOrigin(login.get('origins')[0])) &&
             login.get('username') === username;
    });
    if (loginForSavedUsername) {
      if (loginForSavedUsername.get("password") === password) {
        // We're just logging into a site with an existing login. Bail.
        return;
      }
      else {
        // Prompt user to update password
        message.type = 'update_password';
        // If the existing login stored for this site was PIN locked,
        // make sure this new one will be also.
        message.pinLocked = loginForSameUsername.get("pinLocked");
      }
    }
    if (currentUser && currentUser.keys) {
      // Prompt the user to save the login
      displayInfobar({
        notify: true,
        tabID: tabID,
        notification: message
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
    var pageOrigin = Realms.getOriginForUri(sender.tab.url);
    var currentUser = Gombot.getCurrentUser();
    var logins = [];
    if (currentUser) {
      logins = currentUser.get('logins').filter(function(login) {
        return Realms.isOriginMemberOfRealm(pageOrigin, Realms.getRealmForOrigin(login.get('origins')[0]));
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

  // probably will need to tweak this
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
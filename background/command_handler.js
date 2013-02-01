var CommandHandler = function(Gombot, Messaging, _) {

  function addLogin(message, sender) {
    var currentUser = Gombot.getCurrentUser(),
        tabID = sender.tab.id;
    Gombot.Linker.shouldShowLinkingNotification(currentUser, message, { success: function(linkingInfo) {
      if (!linkingInfo) return;
      linkingInfo.tabID = tabID;
      _.extend(message, linkingInfo);
      if (currentUser) {
        // Prompt the user to save the login
        Gombot.Infobars.displayInfobar({
          notify: true,
          tabID: tabID,
          notification: message
        });
      } else {
        Gombot.Infobars.displayInfobar({
          notify: true,
          tabID: tabID,
          notification: {
            type: 'signup_nag'
          }
        });
      }
    }});
  }

  function validatePin(message, sender, callback) {
    // TODO: move this code somewhere else
    // If there's no PIN set, accept. Otherwise, validate.
    var currentUser = Gombot.getCurrentUser();
    callback({ 'is_valid': (currentUser.get('pin') === message.pin) });
  }

  function setCapturedCredentials(message, sender, callback) {
    Gombot.CapturedCredentialStorage.setCredentials(message, sender.tab);
  }

  function getCapturedCredentials(message, sender, callback) {
    Gombot.CapturedCredentialStorage.getCredentials(message, sender.tab, callback);
  }

  function deleteCapturedCredentials(message, sender, callback) {
    Gombot.CapturedCredentialStorage.deleteCredentials(sender.tab);
  }

  // TODO: Have this execute callbacks: one what we have now and one after the fetch
  // The callback can only be executed once, so we should set up a channel or use another mechanism
  function getSavedCredentials(message, sender, callback) {
    var currentUser = Gombot.getCurrentUser(),
        logins = [];
    if (!currentUser) return false;
    currentUser.fetch({ success: function() {
      logins = currentUser.get('logins').filter(function(loginCredential) {
        return Gombot.Realms.isUriMemberOfRealm(sender.tab.url, loginCredential.origins);
      });
    callback(logins);
    }});
    // Chrome requires that we return true if we plan to call a callback
    // after an onMessage function returns.
    return true;
  }

  function showPINPromptInfobar(message, sender, callback) {
      Gombot.Infobars.displayInfobar({
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

  // create a new user account
  function createUser(message, sender, callback) {
    Gombot.AccountManager.createAccount(message, callback);
    return true;
  }
  
  // return the URL of the currently active tab on the currently active
  // window. used by the gombot button panel to get context
  function getCurrentURL(message, sender, callback) {
    if (typeof chrome !== 'undefined') {
      chrome.windows.getCurrent(function(win) { 
          chrome.tabs.query({
              'windowId': win.id,
              'active': true
          }, 
          function(tabArray) { 
              callback({
                url: tabArray[0].url
              });
           });
       });
    }
    else {
      var tabs = require("tabs");
      callback({
        url: tabs.activeTab.url
      });
    }
  }
  
  // just wrap Gombot.getCurrentUser()
  function getCurrentUser(message, sender, callback) {
    console.log('getCurrentUser');
    callback(Gombot.getCurrentUser());
  }

  // sign into a user account
  function signIn(message, sender, callback) {
    Gombot.AccountManager.signIn(message, callback);
    return true;
  }

  // navigate tab to a particular extension resource page
  // message: { resource: <resource page>, newTab: bool }
  // Resource page should the basename of the resource page excluding
  // the file type suffix, e.g., create_account
  function navigateTo(message, sender, callback) {
    Gombot.Pages.navigateTo(message.resource, message.newTab ? undefined : sender);
  }

  var commandHandlers = {
    'add_login': addLogin,
    'validate_pin': validatePin,
    'prompt_for_pin': showPINPromptInfobar,
    'set_captured_credentials': setCapturedCredentials,
    'get_captured_credentials': getCapturedCredentials,
    'delete_captured_credentials': deleteCapturedCredentials,
    'get_saved_credentials': getSavedCredentials,
    'get_site_config': getSiteConfig,
    'create_user': createUser,
    'get_current_url': getCurrentURL,
    'get_current_user': getCurrentUser,
    'sign_in': signIn,
    'navigate_to': navigateTo
  };

  //
  // Content-to-chrome message handlers
  //
  // Format: { resquest: { message: <message data> },
  //           sender: { tab: { id: <tab id>, url: <url currently in tab> } },
  //           sendResponse: callback function with single parameter to respond to content scripts }
  Messaging.addContentMessageListener(function(request, sender, sendResponse) {
    if (request.type && commandHandlers[request.type]) {
      console.log("Msg received", request, sender);
      return commandHandlers[request.type].call(commandHandlers,request.message,sender,sendResponse);
    }
  });
};

if (typeof module != 'undefined' && module.exports) {
  module.exports = CommandHandler;
}

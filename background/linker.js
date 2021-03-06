var Linker = function(Gombot) {
  var LoginCredential = Gombot.LoginCredential;

  function findLoginCredentialForUsernameAndUrl(user, username, url) {
    return user.get('logins').find(function(loginCredential) {
      return Gombot.Realms.isUriMemberOfRealm(url, loginCredential.origins) &&
             loginCredential.get('username') === username;
    });
  }

  function shouldShowLinkingNotification(user, loginInfo, options) {
    var url = loginInfo.loginurl,
        username = loginInfo.username,
        password = loginInfo.password,
        result = {},
        success = options.success;

    if (!user) {
      success(false);
      return;
    }

    // Check to see if the user disabled password saving on this site
    if (user.get('disabledSites')[Gombot.Realms.getOriginForUri(url)] === 'all') {
      success(false);
      return;
    }

    // Look for passwords in use on the current site
    var loginForSameUsername = findLoginCredentialForUsernameAndUrl(user, username, url);
    if (loginForSameUsername) {
      if (loginForSameUsername.get("password") === password) {
        // We're just logging into a site with an existing login. Bail.
        success(false);
        return;
      }
      else {
        // Prompt user to update password
        result.type = 'update_password';
        // If the existing login stored for this site was PIN locked,
        // make sure this new one will be also.
        result.pinLocked = loginForSameUsername.get("pinLocked");
      }
    }
    else {
      result.type = 'password_observed';
    }
    success(result);
  }

  function updateExistingLoginCredential(loginCredential, attrs) {
    // For existing credential, just update the password.
    loginCredential.set({ password: attrs.password });
  }

  function createNewLoginCredential(attrs) {
    return new LoginCredential(attrs);
  }

  // TODO: options should have success and error
  function link(user, loginInfo, options) {
    console.log("in link");
    var attrs = {
          username: loginInfo.username,
          password: loginInfo.password,
          // Fields that may be missing
          title: loginInfo.title || Gombot.Realms.getTitleFromUri(loginInfo.loginurl),
          loginurl: loginInfo.loginurl,
          pinLocked: loginInfo.pinLocked || false,
          supplementalInformation: loginInfo.supplementalInformation || {}
        },
        loginCredential;
    // make sure user model is up to date, then save
    user.fetch({ success: function() {
      console.log("in fetch success");
      loginCredential = findLoginCredentialForUsernameAndUrl(user, loginInfo.username, loginInfo.loginurl);
      if (loginCredential) updateExistingLoginCredential(loginCredential, attrs);
      else {
        loginCredential = createNewLoginCredential(attrs);
        console.log("about to add new login")
        user.get('logins').add(loginCredential);
      }
      user.save();
    }});
  }

  // TODO: options should have success and error
  function disableSite(user, loginInfo, options) {
    // make sure user model is up to date, then save
    user.fetch({ success: function() {
      user.get('disabledSites')[loginInfo.origin] = 'all';
      user.save();
    }});
  }

  return {
    shouldShowLinkingNotification: shouldShowLinkingNotification,
    link: link,
    disableSite: disableSite
  };
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Linker;
}

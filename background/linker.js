var Linker = function(Realms, LoginCredential) {

	function shouldShowLinkingNotification(user, loginInfo) {
  	var origin = loginInfo.origin,
  		  realm = Realms.getRealmForOrigin(origin),
        username = loginInfo.username,
        password = loginInfo.password,
        result = {};

    // Check to see if the user disabled password saving on this site
    if (user.get('disabledSites')[origin] === 'all') {
      return false;;
    }

    // Look for passwords in use on the current site
    var loginForSavedUsername = user.get('logins').find(function(loginCredential) {
      return Realms.loginCredentialMatchesRealm(loginCredential, realm) &&
             loginCredential.get('username') === username;
    });
    if (loginForSavedUsername) {
      if (loginForSavedUsername.get("password") === password) {
        // We're just logging into a site with an existing login. Bail.
        return false;
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
    return result;
	}

	// TODO: options should have success and error
	function link(user, loginInfo, options) {
  	var attrs = {
  		    username: loginInfo.username,
          password: loginInfo.password,
          origins: [ loginInfo.origin ],
    			// Fields that may be missing
    			title: loginInfo.title || Realms.getTitleFromOrigin(loginInfo.origin),
    	    url: loginInfo.url || loginInfo.origin + "/",
    			pinLocked: loginInfo.pinLocked || false,
    		  supplementalInformation: loginInfo.supplementalInformation || {}
  	    };
  	var newLogin = new Gombot.LoginCredential(attrs);
		user.get('logins').add(newLogin);
    user.save();
	}

	// TODO: options should have success and error
	function disableSite(user, loginInfo, options) {
    user.get('disabledSites')[loginInfo.origin] = 'all';
    user.save();
	}

	return {
		shouldShowLinkingNotification: shouldShowLinkingNotification,
		link: link,
		disableSite: disableSite
	};
};
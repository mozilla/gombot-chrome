var Linker = function(Realms, LoginCredential) {

  function findLoginCredentialForUsernameAndUrl(user, username, url) {
    return user.get('logins').find(function(loginCredential) {
      return Realms.isUriMemberOfRealm(url, loginCredential.origins) &&
             loginCredential.get('username') === username;
    });
  }

	function shouldShowLinkingNotification(user, loginInfo) {
  	var url = loginInfo.loginurl,
        username = loginInfo.username,
        password = loginInfo.password,
        result = {};

    // Check to see if the user disabled password saving on this site
    if (user.get('disabledSites')[Realms.getOriginForUri(url)] === 'all') {
      return false;;
    }

    // Look for passwords in use on the current site
    var loginForSameUsername = findLoginCredentialForUsernameAndUrl(user, username, url);
    if (loginForSameUsername) {
      if (loginForSameUsername.get("password") === password) {
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

  function updateExistingLoginCredential(loginCredential, attrs) {
    // For existing credential, just update the password.
    loginCredential.set({ password: attrs.password });
  }

  function createNewLoginCredential(attrs) {
    return new LoginCredential(attrs);
  }

	// TODO: options should have success and error
	function link(user, loginInfo, options) {
  	var attrs = {
  		    username: loginInfo.username,
          password: loginInfo.password,
    			// Fields that may be missing
    			title: loginInfo.title || Realms.getTitleFromUri(loginInfo.loginurl),
    	    loginurl: loginInfo.loginurl,
    			pinLocked: loginInfo.pinLocked || false,
    		  supplementalInformation: loginInfo.supplementalInformation || {}
  	    },
        loginCredential;
    // see if user is up to date before linking
    user.fetch({ success: function() {
      loginCredential = findLoginCredentialForUsernameAndUrl(user, loginInfo.username, loginInfo.loginurl);
      if (loginCredential) updateExistingLoginCredential(loginCredential, attrs);
      else {
        loginCredential = createNewLoginCredential(attrs);
    		user.get('logins').add(loginCredential);
      }
      user.save();
    }});
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
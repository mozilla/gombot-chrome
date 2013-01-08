var PasswordForm = function($, DomMonitor) {
	const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];

	function notifyObserver(fn) {
		var args;
	  if (this.observer[fn]) {
        args = Array.prototype.slice.call(arguments,1);
        // Add self as first argument
        args.unshift(this);
	      this.observer[fn].apply(this.observer, args);
	  }
	}

	function passwordFieldRemovedCallback(domMonitor) {
		//console.log("PasswordForm.passwordFieldRemovedCallback username=",this.getUsername(),"password=",this.getPassword());
		// Stop listening for the password field to be removed
		DomMonitor.off("isRemoved.pwdEl"+this.id);
		if (this.getPassword()) { // if we have a password in the form
			// Notify observer of credentials in the form
			notifyObserver.call(this, "credentialsCaptured");
		}
		// Notify observers they should link if they have captured creds
		// Note: this should be called even if the password field is empty because
		// the page may have deleted the password field contents before removing it.
		notifyObserver.call(this, "link");
	}

	function capturedCredentialsCallback(event) {
		notifyObserver.call(this, "credentialsCaptured");
	}

	function typeValueInElementHelper($el, value, currentIndex, callback) {
		if (currentIndex >= value.length) {
			if (callback) callback();
			return;
		}
		var partialValue = value.substring(0, currentIndex+1);
		setTimeout(function() {
			$el.keydown();
			$el.val(value);
			setTimeout(function() {
				$el.keyup();
				setTimeout(function() {
					typeValueInElementHelper($el, value, currentIndex+1, callback);
				},0);
			},0);
		},0);

	}

	function fillField(el, value, callback) {
		var $el = $(el);
		$el.focus();
		var blur = function() {
			$el.blur();
			setTimeout(callback, 0);
		}
		value = value || "";
		// if typeValueInElementHelper is too slow, then use this code below.
		// $el.val(value);
		// blur();
		setTimeout(function() {
			// After focusing on the given element, the page's javascript may
			// change the focus (for example, swap out a fake field for a real one)
			// and we should then type the value into the newly focused field
			var activeElement = document.activeElement;
			if (inputIsPossibleUsernameField(activeElement) || inputIsPasswordField(activeElement)) {
				$el = $(activeElement);
			}
			typeValueInElementHelper($el, value, 0, blur);
		}, 0);
	}

	function inputIsPossibleUsernameField(input) {
		return input.tagName.toLowerCase() === "input" &&
		       VALID_USERNAME_INPUT_TYPES.indexOf(input.type.toLowerCase()) !== -1;
	}

	function inputIsPasswordField(input) {
		return input.tagName.toLowerCase() === "input" && input.type.toLowerCase() === "password";
	}

  function maybeGetConfiguredUsernameField() {
      var $username = $(this.config.un);
      if ($username.length > 0 && this.$containingForm.has($username)) {
          return $username.get(0);
      } else {
          return null;
      }
  }

  function findBestUsernameFieldCandidate() {
		var inputsList = this.$containingEl.find('input').get();
		var pwFieldIdx = inputsList.indexOf(this.passwordField.el);
    for (var inputIdx = pwFieldIdx-1; inputIdx >= 0; inputIdx--) {
        if (inputIsPossibleUsernameField(inputsList[inputIdx])) {
            return inputsList[inputIdx];
        }
    }
    // Couldn't find a valid username input field.
    return null;
  }

  function findUsernameField() {
    // If the username field is explicitly configured, then get it
    var usernameEl = maybeGetConfiguredUsernameField.call(this);
    // If we didn't find a configured username field for the form, then
    // look for one
    if (!usernameEl) {
        usernameEl = findBestUsernameFieldCandidate.call(this);
    }
    return { el: usernameEl, $el: $(usernameEl) };
  }

  function handlePossibleUsernameFieldChange() {
		var activeElement = document.activeElement;
		// If the user focuses on a username element and the active element changes, then
		// we should update what our notion of the username field is.
		// See https://online.citibank.com for where this is needed.
		if (activeElement !== this.usernameField.el &&
			  inputIsPossibleUsernameField(activeElement)) {
			this.usernameField.$el.off(this.focusEvents);
			this.usernameField = { el: activeElement, $el: $(activeElement) };
		}
  }

	var PasswordForm = function(id, passwordEl, $containingEl, siteConfig) {
		this.id = id;
		this.passwordField = { el: passwordEl };
		this.$containingEl = $containingEl;
		this.config = siteConfig || {};

		// "input" event will capture paste input and key by key input on modern browsers
		// Note: this will not trigger when values are filled by javsacript or the browser
		this.inputEvents = "input."+this.id;
		this.submitEvents = "submit."+this.id;
		this.focusEvents = "focus.username"+this.id;

    // Setting 'autocomplete' to 'off' will signal to the native
    // password manager to ignore this login wrt filling and capturing.
    // This solves the "double infobar" problem when linking.
    this.passwordField.el.setAttribute('autocomplete', 'off');

    // This must be called after passwordField and $containingEl are set
    this.usernameField = findUsernameField.call(this);
    this.usernameField.$el.on(this.focusEvents, handlePossibleUsernameFieldChange.bind(this));

		// This is an external observer interested in events on the PasswordForm,
		// most likely the PasswordFormInspector.
		this.observer = null;
		DomMonitor.on("isRemoved.pwdEl"+this.id, this.passwordField.el, passwordFieldRemovedCallback.bind(this))
	};

	// TODO: consider whether to make this a multiple event thingy
	// We could have each form individually monitor when it disappears or
	// becomes visible, invisible, or removed.
	PasswordForm.prototype.observe = function(observer) {
		this.observer = observer;
		this.$containingEl.on(this.inputEvents, "input", capturedCredentialsCallback.bind(this));
		this.$containingEl.on(this.submitEvents, capturedCredentialsCallback.bind(this));
		return this;
	};

	PasswordForm.prototype.unobserve = function() {
		this.$containingEl.off(this.inputEvents);
		this.$containingEl.off(this.submitEvents);
		this.usernameField.$el.off(this.focusEvents);
		this.observer = null;
		return this;
	};

	PasswordForm.prototype.fill = function(credentials) {
		var clickOn = this.config.clickOn;
		if (clickOn) {
			$(clickOn).click();
		}
		fillField(this.usernameField.el, credentials.username, (function() {
			fillField(this.passwordField.el, credentials.password);
		}).bind(this));
		return this;
	};

	PasswordForm.prototype.getPassword = function() {
		if (this.passwordField.el) {
			return this.passwordField.el.value;
		}
		return "";
	};

	PasswordForm.prototype.getUsername = function() {
		if (this.usernameField.el) {
			return this.usernameField.el.value;
		}
		return "";
	};

	function highlightEl(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
	}

	PasswordForm.prototype.highlight = function() {
		var containingEl = this.$containingEl.get(0);
    if (this.usernameField.el) {
			highlightEl(this.usernameField.el, "blue");
		} else {
    	console.log("No username field found for", this);
    }
    if (this.passwordField.el) {
      highlightEl(this.passwordField.el, "green")
    } else {
      console.log("No password field found for", this);
    }
    if (containingEl) {
      highlightEl(containingEl, "red");
    } else {
      console.log("No containing form field found for", this);
    };
    return this;
	};

	return PasswordForm;
};
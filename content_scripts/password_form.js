var PasswordForm = function($, DomMonitor) {
	const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];
  const FAKE_USERNAME_FIELD_HINTS = ['email', 'username'];
  const FAKE_PASSWORD_FIELD_HINTS = ['password'];

  const USERNAME_TYPE = "username";
  const PASSWORD_TYPE = "password";
  const FAKE_PASSWORD_TYPE = "fakePassword";

  // Notifies the observer of the event fn. Currently we only support a single observer.
	function notifyObserver(fn) {
		var args;
	  if (this.observer[fn]) {
        args = Array.prototype.slice.call(arguments,1);
        // Add self as first argument
        args.unshift(this);
	      this.observer[fn].apply(this.observer, args);
	  }
	}

	// Callback function for when the passwordField element in this PasswordForm is removed
	// from the DOM. If there is password data in the element, then this typically indicates
	// an AJAX login just completed and we should possibly link. We notify the observers
	// that credentials were captured and that we should link.
	function passwordFieldRemovedCallback(domMonitor) {
		//console.log("PasswordForm.passwordFieldRemovedCallback username=",this.getUsername(),"password=",this.getPassword());
		// Stop listening for the password field to be removed
		DomMonitor.off("isRemoved.pwdEl"+this.id);
		if (this.getPassword()) { // if we have a password in the form
			// Notify observer of credentials in the form
			notifyObserver.call(this, "credentialsCaptured");
			// Notify observer they should link if they have captured creds
			notifyObserver.call(this, "link");
		}
	}

	// Callback to capture any credentials input by the user into the form. We first update our
	// locally cached copy of the credentials and then notify the obverser of captured
	// credentials.
	function capturedCredentialsCallback(event) {
		if (event.target === this.usernameField.el) {
			this.usernameField.val = this.usernameField.el.value;
		}
		else if (event.target === this.passwordField.el) {
			this.passwordField.val = this.passwordField.el.value;
		}
		notifyObserver.call(this, "credentialsCaptured");
	}

	// Helper used by fillField() to "type like a human" into an input field.
	// It tries to type a character a type, simulating keyDown and keyUp events.
	function typeValueInElementHelper($el, value, currentIndex, callback) {
		if (currentIndex >= value.length) {
			if (callback) callback();
			return;
		}
		var partialValue = value.substring(0, currentIndex+1);
		setTimeout(function() {
			$el.keydown();
			$el.val(partialValue);
			setTimeout(function() {
				$el.keyup();
				setTimeout(function() {
					typeValueInElementHelper($el, value, currentIndex+1, callback);
				},0);
			},0);
		},0);

	}

	// Fills the input element <el> with value <value>. Callback is invoked with filling is
	// completed. It uses typeValueInElementHelper() to "type like a human" and sandwiches the
	// fill with focus and blur events.
	function fillField(field, value, callback) {
		var $el = field.$el,
        self = this;
		$el.focus();
		var blur = function() {
			$el.blur();
			setTimeout(callback, 50);
		}
		value = value || "";
		setTimeout(function() {
			// After focusing on the given element, the page's javascript may
			// change the focus (for example, swap out a fake field for a real one)
			// and we should then type the value into the newly focused field.
			if (field.type === USERNAME_TYPE) {
        // returns new username field or existing one
        field = handlePossibleUsernameFieldChange.call(self);
        // possibly reset $el
        $el = field.$el;
      }
      else if (field.type === PASSWORD_TYPE && isPasswordField(document.activeElement)) {
        // CK: I expect this is rare and is untested
				$el = $(activeElement);
			}
      // update our local view of what the field's value since input events won't
      // capture changes made through JS
      field.val = value;
			// keep it simple for now
			$el.val(value);
			setTimeout(blur, 50);;
			//typeValueInElementHelper($el, value, 0, blur);
		}, 50);
	}

	// Determines if an input field is a password field.
	function isPasswordField(input) {
		return input.tagName.toLowerCase() === "input" && input.type.toLowerCase() === "password";
	}

	// Determines if an input field is a "fake" password field. If the fields value is
	// one of configured username watermarks in FAKE_PASSWORD_FIELD_HINTS, we say it is.
	function isFakePasswordField(input) {
		return input.tagName.toLowerCase() === "input" &&
		       input.type.toLowerCase() === "text" &&
		       FAKE_PASSWORD_FIELD_HINTS.indexOf(input.value.toLowerCase()) !== -1;
	}

  // Determines if an input field can be considered to be a username field. mustBeVisible
  // is a flag indiciating whether field must be visible to be considered a candidate.
  // We accept the valid text input types, but reject possible "fake" password
 	// fields.
	function isPossibleUsernameField(input, mustBeVisible) {
		return input.tagName.toLowerCase() === "input" &&
		       VALID_USERNAME_INPUT_TYPES.indexOf(input.type.toLowerCase()) !== -1 &&
		       !isFakePasswordField(input) &&
		       (!mustBeVisible || $(input).is(":visible"));
	}

	// Determines if an input field is a "fake" username field. If the fields value is
	// one of configured username watermarks in FAKE_USERNAME_FIELD_HINTS, we say it is.
	function isFakeUsernameField(input) {
		return input.tagName.toLowerCase() === "input" &&
		       input.type.toLowerCase() === "text" &&
		       FAKE_USERNAME_FIELD_HINTS.indexOf(input.value.toLowerCase()) !== -1;
	}

	// If the configuration explicitly specifies a username field, then try to
	// find that one and return it.
  function maybeGetConfiguredUsernameField() {
      return this.$containingEl.find(this.config.un).get(0);
  }

  // Helper function used by findUsernameField() to find the best username field
  // candidate. It starts at the passwordField and works "up" the DOM to first
  // first reasonable looking candidate.
  //   mustBeVisible: Whether the search can select a non-visible field.
  function findBestUsernameFieldCandidate(mustBeVisible) {
		var inputsList = this.$containingEl.find('input').get();
		var pwFieldIdx = inputsList.indexOf(this.passwordField.el);
    for (var inputIdx = pwFieldIdx-1; inputIdx >= 0; inputIdx--) {
        if (isPossibleUsernameField(inputsList[inputIdx], mustBeVisible)) {
            return inputsList[inputIdx];
        }
    }
    // Couldn't find a valid username input field.
    return null;
  }

  // Find the best guess for the username field in this PasswordForm.
  // This assumes this.$containingEl and this.passwordField have been set.
  // We first look for a configuredUsernameField (rare), and failing that then
  // look for one dynamically, giving preference to visible fields.
  function findUsernameField() {
    // If the username field is explicitly configured, then get it, otherwise find on in the DOM
    var usernameEl = maybeGetConfiguredUsernameField.call(this) ||
                     findBestUsernameFieldCandidate.call(this, true /* mustBeVisible */) ||
        						 findBestUsernameFieldCandidate.call(this, false /* mustBeVisible */);
    return createFieldObjForEl(usernameEl, USERNAME_TYPE);
  }

	// If the user focuses on a username element and the active element changes, then
	// we should update what our notion of the username field is. This part of our handling
	// for fake username/password fields. See comment on maybeTickleFakeInputFields for
	// further discussion.
	// See https://online.citibank.com for an example of why this is needed.
  function handlePossibleUsernameFieldChange() {
		var activeElement = document.activeElement;
		if (activeElement !== this.usernameField.el &&
			  isPossibleUsernameField(activeElement)) {
			console.log("PasswordForm: switching usernameField old=",this.usernameField.el,"new=",activeElement);
			this.usernameField.$el.off(this.focusEvents);
			this.usernameField = createFieldObjForEl(activeElement, USERNAME_TYPE);
		}
    return this.usernameField;
  }

  // Some sites show a fake username/password field with a "watermark" (e.g., it
  // says "Password" in the input field). When the user focuses on this field, the
  // page will hide the fake field, and show the real one. When we form fill a field,
  // we want it to visible to the user, so this function will attempt tickle any
  // fake credential fields in an attempt to make the real fields visible.
  //   triggers: An array of watermark strings to look in "fake" username/password fields,
  //             all lowercase. e.g., [ "username", "email" ]
  function maybeTickleFakeInputFields(triggers) {
    var $inputFields = this.$containingEl.find(":text"),
        thisUsernameEl = this.usernameField.el;
    $inputFields.each(function(i, el) {
      var $el = $(el);
      if (el !== thisUsernameEl &&
          $el.is(":visible") &&
          triggers.indexOf($el.val().toLowerCase()) !== -1) {
        $el.click();
      }
    });
  }

  function maybeFillFakePassword(value, callback) {
  	var fakePasswordEl = $(this.config.fakePasswordFill).get(0);
  	//console.log("maybeFillFakePassword", fakePasswordEl);
  	if (fakePasswordEl) {
  		fillField.call(this, createFieldObjForEl(fakePasswordEl, FAKE_PASSWORD_TYPE), value, callback);
  		return true;
  	}
  	return false;
  }

  // Create an object that representing username and password fields.
  // el is the raw DOM element, $el is the jQuery wrapped DOM element, and val
  // is for storing captured credentials. type is descriptive string, one of:
  // "password", "username", "fakePassword"
  function createFieldObjForEl(el, type) {
  	return { el: el, $el: $(el), val: "", type: type };
  }

  // PasswordForm constructor function. <args> should contain the following:
  //   id: unqiue id value
  //   passwordEl: (optional) DOM element representing the password element in this form
  //   usernameEl: (optional) DOM element representing the username element in this form
  //   containingEl: DOM element representing the "form" element that contains
  //                 the passwordEl (note: need not be an HTML form)
  //   siteConfig: site configuration hash for special site specific handling
  // Generally, either the passwordEl or usernameEl is provided.
	var PasswordForm = function(args) {
		var id = args.id,
		    passwordEl = args.passwordEl,
		    usernameEl = args.usernameEl,
		    containingEl = args.containingEl,
		    siteConfig = args.siteConfig;
		this.id = id;
		this.passwordField = createFieldObjForEl(passwordEl, PASSWORD_TYPE);
		this.$containingEl = $(containingEl);
		this.config = siteConfig || {};

		// "input" event will capture paste input and key by key input on modern browsers
		// Note: this will not trigger when values are filled by javsacript or the browser
		this.inputEvents = "input."+this.id;
		this.focusEvents = "focus.username"+this.id;
		this.removedEvents = "isRemoved.pwdEl"+this.id;

		if (usernameEl) {
			this.usernameField = createFieldObjForEl(usernameEl, USERNAME_TYPE);
		} else {
    	// This must be called after passwordField and $containingEl are set
    	this.usernameField = findUsernameField.call(this);
    }
    // We may have detected detected a "fake" username field that after the user focuses on it,
    // the site switches focus to the "real" username field. This handler will update
    // this.usernameField appropriately.
    this.usernameField.$el.on(this.focusEvents, handlePossibleUsernameFieldChange.bind(this));

		// This is an external observer interested in events on the PasswordForm,
		// most likely the PasswordFormInspector.
		this.observer = null;

    if (this.passwordField.el) {
  		// Add a handler for when the password field is removed from the DOM. This will generally
  		// trigger a linking.
  		DomMonitor.on(this.removedEvents, this.passwordField.el, passwordFieldRemovedCallback.bind(this))
      // Setting 'autocomplete' to 'off' will signal to the native
      // password manager to ignore this login wrt filling and capturing.
      // This solves the "double infobar" problem when linking.
      this.passwordField.el.setAttribute('autocomplete', 'off');
    }
	};

	// Notify the observer whenever we detect interesting input events.
	PasswordForm.prototype.observe = function(observer) {
		this.observer = observer;
		this.$containingEl.on(this.inputEvents, "input", capturedCredentialsCallback.bind(this));
		return this;
	};

	// Turn off all internal observers
	PasswordForm.prototype.unobserve = function() {
		this.$containingEl.off(this.inputEvents);
		this.$containingEl.off(this.removedEvents);
		this.usernameField.$el.off(this.focusEvents);
		this.observer = null;
		return this;
	};

	// Fill the form in a special way with the given credentials in the format of:
	// { username: <username>, password: <password> }
	// Before filling each field, we tickle any possible "fake" username/password fields
	// so that filled values will be visible to the user. fillField() also goes through
	// some cortortions to "type like a human" and handle dynamic username field "switch-outs".
	PasswordForm.prototype.fill = function(credentials) {
    maybeTickleFakeInputFields.call(this, FAKE_USERNAME_FIELD_HINTS);
		fillField.call(this, this.usernameField, credentials.username, (function() {
			maybeTickleFakeInputFields.call(this, FAKE_PASSWORD_FIELD_HINTS);
			maybeFillFakePassword.call(this, credentials.password);
			fillField.call(this, this.passwordField, credentials.password);
		}).bind(this));
		return this;
	};

	// Return the password in this form. Prefer any value that captured explicitly by our
	// handler.
	PasswordForm.prototype.getPassword = function() {
		if (this.passwordField.val) return this.passwordField.val;
		if (this.passwordField.el) {
			return this.passwordField.el.value;
		}
		return "";
	};

	// Return the username in this form. Prefer any value that captured explicitly by our
	// handler.
	PasswordForm.prototype.getUsername = function() {
		if (this.usernameField.val) return this.usernameField.val;
		if (this.usernameField.el) {
			return this.usernameField.el.value;
		}
		return "";
	};

	function highlightEl(el, color) {
    el.style['border'] = '2px solid '+color;
    el.setAttribute('data-detected', 'true');
	}

	// Crude highlighting of the username/password fields and containing form.
	// Generally for dev/debugging purposes only.
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


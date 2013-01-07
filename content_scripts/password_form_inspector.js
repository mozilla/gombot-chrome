var PasswordFormInspector = function($, PasswordForm, DomMonitor) {
    const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];

    var running = false;

    var observers = [];

    var idCounter = 0;

    var passwordForms = [];

    var siteConfig = {};

    function generateId() {
        idCounter += 1;
        return idCounter;
    }

    function getUsernameFieldForPasswordField(containerForm,passwordEl) {
        var inputsList = containerForm.find('input').get();
        var pwFieldIdx = inputsList.indexOf(passwordEl);
        for (var inputIdx = pwFieldIdx-1; inputIdx >= 0; inputIdx--) {
            if (VALID_USERNAME_INPUT_TYPES.indexOf(inputsList[inputIdx].type.toLowerCase()) != -1) {
                return inputsList[inputIdx];
            }
        }
        // Couldn't find a valid username input field.
        return null;
    }

    function findForms() {
        var $passwordInputs = $('input[type=password]');
        var oldPasswordForms = passwordForms; // TODO: clean these up
        passwordForms = [];
        $passwordInputs.each(function(idx,passwordEl) {
            var $passwordEl = $(passwordEl),
                $containingForm = $passwordEl.closest('form'),
                usernameEl,
                usernameFields = {},
                numPasswordInputs;
            if ($containingForm.length === 0) {
                console.log("Could not find form element, passwordEl=", $passwordEl);
                // Could not find an HTML form, so now just look for any element that
                // contains both the password field and some other input field with type=text.
                // Note: this will also find inputs with no type specified, which defaults to text.
                $containingForm = $passwordEl.parents().has('input:text').first();
            }

            if ($containingForm.length === 0) {
                return;
            }
            // Setting 'autocomplete' to 'off' will signal to the native
            // password manager to ignore this login wrt filling and capturing.
            // This solves the "double infobar" problem when linking.
            passwordEl.setAttribute('autocomplete', 'off');
            numPasswordInputs = $containingForm.find('input[type=password]').length;
            // If the containing form contains multiple password field, then ignore
            // for now. This is probably a change password field.
            if (numPasswordInputs > 1) return;
            usernameEl = getUsernameFieldForPasswordField($containingForm,passwordEl);
            passwordForms.push(new PasswordForm(generateId(),
                                                { el: usernameEl },
                                                { el: passwordEl },
                                                $containingForm.get(0),
                                                siteConfig));
        });
        observeForms();
    }

    function credentialsCaptured(passwordForm) {
        var creds = { formId: passwordForm.id,
                      username: passwordForm.getUsername(),
                      password: passwordForm.getPassword() };
        visitObservers("credentialsCaptured", creds);
    }

    function link(passwordForm) {
        visitObservers("link");
    }

    var passwordFormObserver = {
        credentialsCaptured: credentialsCaptured,
        link: link
    };

    // internal function to start observing the form collection
    // Currently just notifies observers of captured credentials
    function observeForms() {
        passwordForms.forEach(function(form) {
            form.observe(passwordFormObserver);
        });
    }

    function visitObservers(fn) {
        var args = Array.prototype.slice.call(arguments,1);
        args.unshift(self);
        observers.forEach(function(o) {
            if (o[fn]) {
                o[fn].apply(o, args);
            }
        });
    }

    function domMonitorCallback() {
        findForms();
        visitObservers("formsFound", passwordForms);
    }

    // PUBLIC SECTION

    function observe(observer) {
        if (!running) {
            start();
        }
        observers.push(observer);
        // if we have password forms, then notify observer immediately
        if (passwordForms.length > 0 && observer.formsFound) {
            observer.formsFound(self);
        }
    }

    function setConfig(config) {
        siteConfig = config;
        passwordForms.forEach(function(form) { form.config = siteConfig; });
    }

    // highlights all password forms on page
    function highlight() {
        passwordForms.forEach(function(form) {
            form.highlight();
        });
    }

    function fill(credentials) {
        passwordForms.forEach(function(form) {
            form.fill(credentials);
        });
    }

    function start() {
        if (!running) {
            running = true;
            findForms();
            DomMonitor.on("addedNodes", "input", domMonitorCallback);
        }
    }

    function stop() {
        if (running) {
            DomMonitor.off("addedNodes", domMonitorCallback);
            running = false;
        }
    }

    var self = {
        start: start,
        observe: observe,
        setConfig: setConfig,
        fillForms: fill,
        highlightForms: highlight,
        stop: stop
    };
    return self;
};

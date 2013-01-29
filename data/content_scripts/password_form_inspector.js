var PasswordFormInspector = function($, PasswordForm, DomMonitor) {
    // TODO: put these in config so we can use them in both PasswordFromInspector and PasswordForm
    const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];

    const INPUT_USERNAME_SELECTORS = $.map(VALID_USERNAME_INPUT_TYPES, function(type) { return "input[type="+type+"]"; }).join(",");

    var running = false;

    var observers = [];

    var idCounter = 0;

    var passwordForms = [];

    var siteConfig = {};

    function generateId() {
        idCounter += 1;
        return idCounter;
    }

    function findMultistageForms() {
        var $un;
        if (!siteConfig.multiStage) return [];
        $un = $(siteConfig.un);
        if ($un.length === 0) return [];
        return [ new PasswordForm({ id: generateId(),
                                    usernameEl: $un.get(0),
                                    containingEl: getFormForElement($un).get(0),
                                    siteConfig: siteConfig }) ];
    }

    function getFormForElement($el) {
        // Find the closest parent that also contains an input field that looks
        // like a username
        var $closestForm = $el.parents().has(INPUT_USERNAME_SELECTORS).first();
        if (!$closestForm || $closestForm.length === 0) {
            $closestForm = $('body');
        }
        return $closestForm;
    }

    function findForms() {
        var $passwordInputs = $('input[type=password]');
        var oldPasswordForms = passwordForms; // TODO: clean these up
        passwordForms = [];
        $passwordInputs.each(function(idx,passwordEl) {
            var $passwordEl = $(passwordEl),
                $containingForm = getFormForElement($passwordEl),
                numPasswordInputs = $containingForm.find('input[type=password]').length;
            // If the containing form contains multiple password field, then ignore
            // for now. This is probably a change password field or a signup field
            if (numPasswordInputs > 1) {
                console.log("found more than 1 password input, bailing");
                return;
            }

            passwordForms.push(new PasswordForm({ id: generateId(),
                                                  passwordEl: passwordEl,
                                                  containingEl: $containingForm.get(0),
                                                  siteConfig: siteConfig }));
        });
        passwordForms = passwordForms.concat(findMultistageForms());
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
        var length = passwordForms.length;
        // Need to work through the forms sequentials because PasswordForm.fill
        // inspects the active element as it goes, so we don't want to interfere
        // with that.
        function fillForm(i) {
            if (i<length) {
                passwordForms[i].fill(credentials, function() { fillForm(i+1); });
            }
        }
        fillForm(0);
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

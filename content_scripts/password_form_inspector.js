var PasswordFormInspector = function($, PasswordForm, InputMonitor, Linker, Messaging) {
    const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];

    var observers = [];

    var inputMonitor = null;

    var idCounter = 0;

    var passwordForms = [];

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
            if (usernameEl) {
                usernameFields["username"] = { el: usernameEl };
            }
            passwordForms.push(new PasswordForm(generateId(), usernameFields, { el: passwordEl }, $containingForm.get(0)));
        });
    }



    function observeForms() {
        var callback = function(capturedCredentials) {
            visitObservers("credentialsCaptured", capturedCredentials);
        }
        passwordForms.forEach(function(form) {
            form.observe(callback);
        });
    }

    function getForms() {
        return passwordForms;
    }

    function observe(observer) {
        observers.push(observer);
        // if we have password forms, then notify observer immediately
        if (passwordForms.length > 0 && observer.formsFound) {
            observer.formsFound(passwordForms);
        }
    }

    function visitObservers(fn, arg) {
        console.log("visitObservers", observers);
        observers.forEach(function(o) {
            if (o[fn]) {
                o[fn](arg);
            }
        });
    }

    function start() {
        inputMonitor = new InputMonitor(function () { findForms(); visitObservers("formsFound", passwordForms); });
        findForms();
        inputMonitor.start();
    }

    function cleanup() {

    }

    return {
        start: start,
        observe: observe,
        getForms: getForms,
        cleanup: cleanup
    };
};

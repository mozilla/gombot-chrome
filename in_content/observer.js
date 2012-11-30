(function() {
    var forms = document.getElementsByTagName('form');
    var formsByType = {};
    for (var formIdx = 0; formIdx < forms.length; formIdx++) {
        
        var inputs = forms[formIdx].getElementsByTagName('input');
        var inputsList = Array.prototype.slice.call(inputs);
        
        var pwFields = getPwFields(inputsList);

        // TODO: Remove this code (and anything else relying on addAutofillToForm)
        // If it's a login form, add the autofill listener.
        // if (pwFields.length == 1) {
        //     addAutofillToForm('login',forms[formIdx],pwFields);
        // }
        
        // Keep in formsByType a map from nummber of password inputs to form elements.
        if (formsByType[pwFields.length] === undefined) {
            formsByType[pwFields.length] = [forms[formIdx]];
        }
        else {
            formsByType[pwFields.length].push(forms[formIdx]);
        }
        
        function makeOnSubmit(formEl,_inputsList,_pwFields) {
            return function(e) {
                var newLoginObj = {
                   hostname: window.location.host,
                   formSubmitURL: this.action,
                   // Always null for logins extracted from HTML forms
                   httpRealm: null
                };

                var usernameInput = null;
                var pwInput = null;
                
                switch (determineFormType(formEl)) {
                    case 'login':
                        // Find the username input - the input before the password field
                        // of a valid type.
                        usernameInput = getUsernameFieldForPasswordField(_inputsList,_pwFields[0].idx);

                        pwInput = _inputsList[_pwFields[0].idx];
                    break;
                    
                    case 'signup':
                        usernameInput = getUsernameFieldForPasswordField(_inputsList,_pwFields[0].idx);
                        pwInput = _inputsList[_pwFields[0].idx];
                    break;
                    
                    case 'change_password':
                        // TODO
                    break;
                    
                    case 'unknown':
                    default:
                        return;
                    
                    break;
                }
                //    pwInput = _inputsList[pwInputIdx];
                //    usernameInput = getUsernameFieldForPasswordField(_inputsList,pwInputIdx);
                // }
                newLoginObj['username'] = usernameInput.value;
                newLoginObj['password'] = pwInput.value;
                newLoginObj['usernameField'] = getFieldDescriptor(usernameInput);
                newLoginObj['passwordField'] = getFieldDescriptor(pwInput);
                newLoginObj['formEl'] = getFieldDescriptor(formEl);
                storeLogin(newLoginObj);
                return false;
           }
            // }
        }
        
        forms[formIdx].addEventListener('submit',makeOnSubmit(forms[formIdx],inputsList,pwFields));
        console.log(formsByType);
    }

    //  Returns the username field from inputsList that is 
    //  closest before the field at pwFieldIdx. Or null, if
    //  no valid field exists.
    function getUsernameFieldForPasswordField(inputsList,pwFieldIdx) {
        const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];
        var backupGuesses = [];
        for (var inputIdx = pwFieldIdx-1; inputIdx >= 0; inputIdx--) {
            if (VALID_USERNAME_INPUT_TYPES.indexOf(inputsList[inputIdx].type) != -1) {
                if (inputsList[inputIdx].val) {
                    return inputsList[inputIdx];                    
                }
                else {
                    // If the input has nothing in it, add it as a "backup guess".
                    backupGuesses.push(inputsList[inputIdx]);
                }
            }
        }
        if (backupGuesses.length > 0)
            return backupGuesses[backupGuesses.length-1];
        // Couldn't find a valid username input field.
        return null;
    }   
        
    function getInputsList(formEl) {
        var inputs = formEl.getElementsByTagName('input');
        return Array.prototype.slice.call(inputs);
    }
    
    function getPwFields(_inputsList) {
        var pwFields = [];
        for (var inputIdx = 0; inputIdx < _inputsList.length; inputIdx++) {
            if (_inputsList[inputIdx].type == 'password') {
                pwFields.push({
                    idx: inputIdx,
                    val: _inputsList[inputIdx].value
                });   
            }
        }
        return pwFields;
    }
    
    // TODO: There's much more work to be done in improving heuristics.
    // How Firefox does it: 
    // http://mxr.mozilla.org/mozilla-central/source/toolkit/components/passwordmgr/nsLoginManager.js#643
    function determineFormType(formEl) {
        var pwFields = getPwFields(getInputsList(formEl));
        switch (pwFields.length) {
            case 1:
                return 'login';
            
            case 2:
                // Assume an account creation form. As long as the two passwords
                // are equal, we should be good.
                if (pwFields[0].val != pwFields[1].val) {
                    // Password inputs aren't equal, so bail.
                    return 'unknown';
                }
                return 'signup';
            break;
                
            case 3:
                // Assume a password change form. Look for two passwords that are equal.
                var pwInputIdx = null;
                for (var pwFieldIdx in pwFields) {
                    if (pwFields[0].val == pwFields[1].val) {
                        pwInputIdx = pwFields[0].idx;
                    }
                    else if (pwFields[1].val == pwFields[2].val) {
                        pwInputIdx = pwFields[1].idx;
                    }
                    else if (pwFields[0].val == pwFields[2].val) {
                        pwInputIdx = pwFields[0].idx;
                    }
                }
                // All password fields differ. No idea what's going on, so bail.
                if (!pwInputIdx) return 'unknown';
                return 'change_password';
            break;
            
            default:
                return 'unknown';
        }
    }

    function autologinError(errorDescription) {
        // TODO: send a message back to chrome saying we screwed up.
    }

    function masterOnMessageListener(msg) {
        console.log("got msg", msg);
        if (msg.type == 'fill_form') {
            console.log("in fill_form: ", msg);
            var forms = document.body.getElementsByTagName('form');
            for (var formIdx = 0; formIdx < forms.length; formIdx++) {
                if (forms[formIdx].querySelectorAll('input[type="password"]').length > 0) {
                    var fields = getLoginFieldsForForm(forms[formIdx]);
                    fields.username.value = msg.login.username;
                    fields.password.value = msg.login.password;
                }
            }
        }
    }
    
    chrome.extension.onMessage.addListener(masterOnMessageListener);

    function getLoginFieldsForForm(formEl) {
        var usernameElem;
        var passwordElem;
        var formInputs = Array.prototype.slice.call(formEl.getElementsByTagName('input'));
        passwordElem = formEl.querySelector('[type="password"]');
        usernameElem = getUsernameFieldForPasswordField(formInputs,formInputs.indexOf(passwordElem));
        if (!usernameElem) {
            // Still can't find a username field for autologin; bail.
            autologinError("Can't find username field!");
            return;
        }
        return {
            username: usernameElem,
            password: passwordElem
        };
    }

    function findByFieldDescriptor(descriptor,parent) {
        if (descriptor.id) {
            return document.getElementById(descriptor.id);
        }
        if (parent === undefined) parent = document.body;
        if (descriptor.name) {
            return parent.querySelector('[name="' + descriptor.name + '"]');
        }
        return null;
    }

    function getFieldDescriptor(elem) {
        return {
            'name': elem.attributes.name ? elem.attributes.name.value : undefined,
            'id': elem.id.name ? elem.attributes.id.value : undefined
        };
    }

    function storeLogin(loginObj) {
        // loginObj fields: username,password,site,usernameElement,passwordElement
        chrome.extension.sendMessage({
            type: 'add_login',
            message: loginObj
        });
    }
    chrome.extension.sendMessage({
        type: 'observing_page',
        message: {
            // TODO: make sure we can trust window.location (we probably can't) or find a 
            // way to get this chrome-side.
            location: window.location,
            hostname: window.location.host,
            // Report if there is a single login-type form on the page, so we can attempt automated sign-in
            // if there's a login stored.
            single_login_form: (formsByType[1] && formsByType[1].length == 1),
            num_login_forms: formsByType[1] ? formsByType[1].length : 0
        }
    });
})();
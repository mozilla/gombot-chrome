(function() {
    var forms = document.getElementsByTagName('form');
    var formsByType = {};
    for (var formIdx = 0; formIdx < forms.length; formIdx++) {
        
        var inputs = forms[formIdx].getElementsByTagName('input');
        var inputsList = Array.prototype.slice.call(inputs);
        
        var pwFields = [];
        for (var inputIdx = 0; inputIdx < inputsList.length; inputIdx++) {
            if (inputsList[inputIdx].type == 'password') {
                pwFields.push({
                    idx: inputIdx,
                    val: inputsList[inputIdx].value
                });   
            }
        }
        
        // If it's a login form, add the autofill listener.
        if (pwFields.length == 1) {
            addAutofillToForm('login',forms[formIdx],pwFields);
        }
        
        // Keep in formsByType a map from nummber of password inputs to form elements.
        if (formsByType[pwFields.length] === undefined) {
            formsByType[pwFields.length] = [forms[formIdx]];
        }
        else {
            formsByType[pwFields.length].push(forms[formIdx]);
        }
        
        function makeOnSubmit(formEl,_inputsList,_pwFields) {
            return function(e) {
                e.preventDefault();
                var newLoginObj = {
                   hostname: window.location.host,
                   formSubmitURL: this.action,
                   // Always null for logins extracted from HTML forms
                   httpRealm: null
                };

                var usernameInput = null;
                var pwInput = null;
        
                if (_pwFields.length == 1) {
                   // Find the username input - the input before the password field
                   // of a valid type.
                   usernameInput = getUsernameFieldForPasswordField(_inputsList,_pwFields[0].idx);

                   pwInput = _inputsList[_pwFields[0].idx];
                }
                else if (_pwFields.length == 2) {
                   // Assume an account creation form. As long as the two passwords
                   // are equal, we should be good.
                   if (_pwFields[0].val != _pwFields[1].val) {
                       // Password inputs aren't equal, so bail.
                       return;   
                   }
                   usernameInput = getUsernameFieldForPasswordField(_inputsList,_pwFields[0].idx);
                   pwInput = _inputsList[_pwFields[0].idx];
                }
                else if (_pwFields.length == 3) {
                   // Assume a password change form. Look for two passwords that are equal.
                   var pwInputIdx = null;
                   for (var pwFieldIdx in _pwFields) {
                       if (_pwFields[0].val == _pwFields[1].val) {
                           pwInputIdx = _pwFields[0].idx;
                       }
                       else if (_pwFields[1].val == _pwFields[2].val) {
                           pwInputIdx = _pwFields[1].idx;
                       }
                       else if (_pwFields[0].val == _pwFields[2].val) {
                           pwInputIdx = _pwFields[0].idx;
                       }
                   }
                   // All password fields differ. No idea what's going on, so bail.
                   if (!pwInputIdx) return;
                   pwInput = _inputsList[pwInputIdx];
                   usernameInput = getUsernameFieldForPasswordField(_inputsList,pwInputIdx);
                }
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
        for (var inputIdx = pwFieldIdx-1; inputIdx >= 0; inputIdx--) {
            if (VALID_USERNAME_INPUT_TYPES.indexOf(inputsList[inputIdx].type) != -1) {
                return inputsList[inputIdx];
            }
        }
        // Couldn't find a valid username input field.
        return null;
    }

    function addAutofillToForm(type,formEl,pwInputs) {
        // TODO
        // Big random number to represent this form uniquely
        var form_id = parseInt(Math.random()*100000);
        var onMsgFunc = function(msg) {
            console.log('in onMsgFunc, saw message of type ', msg.type);
            console.log(msg);
            if (msg.type == 'fill_form' && msg.form_id == form_id) {
                for (var inputIdx in pwInputs) {
                    pwInputs[inputIdx].value = msg.password;
                }
                chrome.extension.onMessage.removeListener(onMsgFunc);
            }
            else if (msg.type == 'do_autologin') {
                var usernameElem;
                var passwordElem;
                passwordElem = findByFieldDescriptor(msg.login.passwordField);
                if (!passwordElem) {
                    // FIXME: For now, assume there's only one password input in the form,
                    // so if we can't find it via descriptor, no problem!
                    passwordElem = formEl.querySelector('[type="password"]');
                }
                usernameElem = findByFieldDescriptor(msg.login.usernameField);
                if (!usernameElem) {
                    // Couldn't find via descriptor, try heuristically.
                    var formInputs = formEl.getElementsByTagName('input');
                    usernameElem = getUsernameFieldForPasswordField(formInputs,formInputs.indexOf(passwordElem));
                    if (!usernameElem) {
                        // Still can't find a username field for autologin; bail.
                        autologinError("Can't find username field!");
                        return;
                    }
                }
                // TODO: "type like a human" with focus, keydown, and blur events.
                usernameElem.value = msg.login.username;
                passwordElem.value = msg.login.password;
                formEl.submit();
            }
            else if (msg.type == 'confirm_form_exists') {
                if (findByFieldDescriptor(msg.login.formEl)) {
                    chrome.extension.sendMessage({
                        type: 'ask_for_autologin',
                        login: msg.login
                    });
                }
            }
        };
        chrome.extension.onMessage.addListener(onMsgFunc);
        // switch (type) {
        //     case "login":
        //     
        //     
        //     break;
        //     
        //     case "signup":
        //     
        //     break;
        //     
        //     case "change_password":
        //     
        //     break;
        // }
    }

    function autologinError(errorDescription) {
        // TODO: send a message back to chrome saying we screwed up.
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
            'name': elem.name,
            'id': elem.id
        };
    }

    function storeLogin(loginObj) {
        //username,password,site,usernameElement,passwordElement
        chrome.extension.sendMessage({
            type: 'add_login',
            message: loginObj
        });
    }
    console.log('sending observing_page');
    chrome.extension.sendMessage({
        type: 'observing_page',
        message: {
            // TODO: make sure we can trust window.location (we probably can't) or find a 
            // way to get this chrome-side.
            location: window.location,
            hostname: window.location.host,
            // Report if there is a single login-type form on the page, so we can attempt automated sign-in
            // if there's a login stored.
            single_login_form: (formsByType[1] && formsByType[1].length == 1)
        }
    });
})();
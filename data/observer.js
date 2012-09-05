(function() {
    var forms = document.getElementsByTagName('form');
    for (var formIdx = 0; formIdx < forms.length; formIdx++) {
        console.log(forms[formIdx]);
        forms[formIdx].addEventListener('submit', function() {
            var newLoginObj = {
                hostname: window.location.host,
                formSubmitURL: this.action,
                // Always null for logins extracted from HTML forms
                httpRealm: null
            };
            var inputs = this.getElementsByTagName('input');
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
            var usernameInput = null;
            var pwInput = null;
        
            if (pwFields.length == 1) {
                // Find the username input - the input before the password field
                // of a valid type.
                usernameInput = getUsernameFieldForPasswordField(inputsList,pwFields[0].idx);

                pwInput = inputsList[pwFields[0].idx];
            }
            else if (pwFields.length == 2) {
                console.log('two pwinput fields!');
                // Assume an account creation form. As long as the two passwords
                // are equal, we should be good.
                if (pwFields[0].val != pwFields[1].val) {
                    // Password inputs aren't equal, so bail.
                    return;   
                }
                usernameInput = getUsernameFieldForPasswordField(inputsList,pwFields[0].idx);
                pwInput = inputsList[pwFields[0].idx];
            }
            else if (pwFields.length == 3) {
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
                if (!pwInputIdx) return;
                pwInput = inputsList[pwInputIdx];
                usernameInput = getUsernameFieldForPasswordField(inputsList,pwInputIdx);
            }
            newLoginObj['username'] = usernameInput.value;
            newLoginObj['password'] = pwInput.value;
            newLoginObj['usernameField'] = getFieldDescriptor(usernameInput);
            newLoginObj['passwordField'] = getFieldDescriptor(pwInput);
            storeLogin(newLoginObj);
            return false;
        });
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
})();
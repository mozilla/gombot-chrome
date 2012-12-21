var PasswordFormInspector = (function() {    
    const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];
    
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
    
    function detect() {
        var $passwordInputs = $('input[type=password]'),
            result = { loginForms: [], signupForms: [], changePasswordForms: [] },
            $passwordEl = null,
            $containingForm = null,
            usernameEl = null,
            numPasswordInputs = 0;

        $passwordInputs.each(function(idx,passwordEl) {
            $passwordEl = $(passwordEl);
            $containingForm = $passwordEl.closest('form');
            if ($containingForm.length === 0) {
                console.log("Could not find form element, passwordEl=", $passwordEl);
                $containingForm = $passwordEl.parents().has($passwordEl).has('input:text').first();
            }

            if ($containingForm.length === 0) {
                return;
            }
            numPasswordInputs = $containingForm.find('input[type=password]').length;
            if (numPasswordInputs > 1) return;
            usernameEl = getUsernameFieldForPasswordField($containingForm,passwordEl);
            result.loginForms.push({
                usernameEl: usernameEl,
                passwordEl: passwordEl,
                containingEl: $containingForm.get()[0]
            });
        });
        return result;
    }
    
    return {

        detect: detect

    };
})();

var DomMonitor = (function() {
    const MONITOR_INTERVAL_LENGTH = 1000;
    var monitorInterval = null,
        callback = null,
        test = null;

    function executeTest() {
        if (test()) {
            callback();
        }
    }

    function start(testFunc, callbackFunc) {
        test = testFunc;
        callback = callbackFunc;
        executeTest();
        monitorInterval = setInterval(executeTest, MONITOR_INTERVAL_LENGTH);
    };

    function stop() {
        callback = null;
        test = null;
        clearInterval(executeTest);
    };

    return {
        start: start,
        stop: stop
    };
})();


function attachHandlers() {
    // Run on page load
    var passwordCounterTest;
    (function() {
        var passwordCount = null;
        passwordCounterTest = function() {
            var newPasswordCount = $('input[type=password]').length,
                result = false;
            if (passwordCount === null) {
                passwordCount = newPasswordCount;
                return false;
            }
            result = newPasswordCount > passwordCount;
            passwordCount = newPasswordCount;
            return result;
        };
    })();
    highlightLoginForms();
    DomMonitor.start(passwordCounterTest, highlightLoginForms);
}

function highlightLoginForms() {
    var res = PasswordFormInspector.detect();
    for (var formX = 0; formX < res.loginForms.length; formX++) {
        if (res.loginForms[formX].usernameEl) {
            res.loginForms[formX].usernameEl.style['border'] = '2px solid blue';
            res.loginForms[formX].usernameEl.setAttribute('data-detected', 'true');
        } else {
            console.log("No username field found for", res.loginForms[formX]);
        }
        if (res.loginForms[formX].passwordEl) {
            res.loginForms[formX].passwordEl.style['border'] = '2px solid green';
            res.loginForms[formX].passwordEl.setAttribute('data-detected', 'true');
        } else {
            console.log("No password field found for", res.loginForms[formX]);
        }
        if (res.loginForms[formX].containingEl) {
            res.loginForms[formX].containingEl.style['border'] = '2px solid red';
            res.loginForms[formX].containingEl.setAttribute('data-detected', 'true');
        } else {
            console.log("No containing form field found for", res.loginForms[formX]);
        }

    }
}
attachHandlers();
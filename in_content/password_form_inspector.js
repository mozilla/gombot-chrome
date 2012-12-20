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
            result = { loginForms: [], signupForms: [], changePasswordForms: [] };
        $passwordInputs.each(function(idx,passwordEl) {
            var containingForm = $(passwordEl).closest('form'),
                usernameEl,
                numPaswordInputs = $(containingForm).find('input[type=password]').length;
                
            if (!containingForm) {
                // TODO
                return;
            }
            if (numPaswordInputs > 1) return;
            usernameEl = getUsernameFieldForPasswordField(containingForm,passwordEl);
            result.loginForms.push({
                usernameEl: usernameEl,
                passwordEl: passwordEl,
                containingEl: containingForm.get()[0]
            });
        });
        return result;
    }
    
    return {

        detect: detect

    };
})();

function highlightLoginForms() {
    var res = PasswordFormInspector.detect();
    for (var formX = 0; formX < res.loginForms.length; formX++) {
        console.log(res.loginForms[formX]);
        res.loginForms[formX].usernameEl.style['border'] = '2px solid blue';
        res.loginForms[formX].passwordEl.style['border'] = '2px solid green';
        res.loginForms[formX].containingEl.style['border'] = '2px solid red';
    }
}
setTimeout(highlightLoginForms,500);
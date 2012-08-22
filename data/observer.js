const VALID_USERNAME_INPUT_TYPES = ['text','email','url','tel','number'];
    
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
        var pwInputs = inputsList.filter(function(x) { 
            return x.type == 'password';
        });
        var pwInput = null;
        
        if (pwInputs.length == 1) {
            // Find the username input - the input before the password field
            // of a valid type.
            var pwInputIdx = inputsList.indexOf(pwInputs[0]);
            var usernameInput = null;
            for (var inputIdx = pwInputIdx-1; inputIdx >= 0; inputIdx--) {
                if (VALID_USERNAME_INPUT_TYPES.indexOf(inputs[inputIdx].type) != -1) {
                    usernameInput = inputs[inputIdx];
                    break;   
                }
            }
            // Couldn't find a valid username input field, so bail.
            if (!usernameInput) {
                return;   
            }
            pwInput = pwInputs[0];
        }
        newLoginObj['username'] = usernameInput.value;
        newLoginObj['password'] = pwInput.value;
        newLoginObj['usernameField'] = getFieldDescriptor(usernameInput);
        newLoginObj['passwordField'] = getFieldDescriptor(pwInput);
        storeLogin(newLoginObj);
        return false;
    });
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
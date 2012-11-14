/*
*   pin_entry.js
*
*
*   Contains the code that runs inside of the PIN entry interface, either
*   inside of an iframe or a new browser window.
*
*/

 // PIN the user entered previously.
var previousPIN = null;

// Should we ask the user to repeat their PIN after entry?
var repeatPIN = false;
// Is this the repeat step, or the first time?
var repeatingPIN = false;

// Callback ID to send back up to pin_ui.js
var callbackID = null;

var IN_IFRAME = false;

function sendMessage(msg) {
    // console.log('sendMessage: ', msg);
    // Don't use regular window.postMessage if we're running in popup mode.
    if (IN_IFRAME) {
        window.postMessage(msg,'*');
    }
    else {
        chrome.extension.sendMessage(msg);
    }
}

function initializePINEntry() {
    // Start focus on first PIN digit.
    $('#digit1').focus();
    
    $('input').keypress(function(evt) {
        var input = this;
        // Did the user type a digit?
        if (evt.charCode >= '0'.charCodeAt(0) && evt.charCode <= '9'.charCodeAt(0)) {
            // Wait a beat so that we have what the user entered.
            setTimeout(function() {
                if ($(input).val().length == 1) {
                    // Advance focus to the element with the next tabindex.
                    $('[tabindex="'+ ($(input).attr('tabindex')+1) + '"]').focus();
                }            
            },1);            
        }
        else {
            // Make sure this character won't get typed.
            evt.preventDefault();
        }
    });
    
    $('#submit-pin').click(function() {
        if (repeatPIN) {
            if (repeatingPIN) {
                if (previousPIN == getEnteredPIN()) {
                    submitPIN();
                }
                else {
                    $('#pin-repeat-message').hide();
                    $('#pin-error-message').show();
                    repeatingPIN = false;
                }
            }
            else {
                previousPIN = getEnteredPIN();
                repeatingPIN = true;
                // Show the user the repeat PIN message.
                $('#pin-entry-message').hide();
                $('#pin-repeat-message').show();
            }
            $('input').val('');
            $('#digit1').focus();
        } else {
            submitPIN();
        }
    });
    
    function onMessage(msg) {
        console.log('in pin_entry.js, got message of type ', msg.type, msg);
        switch (msg.type) {
            case 'set_prompt':
                $('#pin-entry-message').html(msg.prompt);
                repeatPIN = Boolean(msg.repeat);
                console.log('repeatPIN = ', repeatPIN);
                break;
            case 'set_callbackid':
                callbackID = msg.callback_id;
                break;
            case 'set_container':
                IN_IFRAME = msg.in_iframe;
                break;
            case 'reset_entry':
                $('input').val('');
	            $('#digit1').focus();
                break;
        }
    }
    
    function getEnteredPIN() {
        // Using .get() because jQuery .map returns an object and not an array.
        return $('input').get().map(function(x) { return x.value; } ).join('');
    }
    
    function submitPIN() {
        // We're done, submit the PIN.
        sendMessage({
            'type': 'submit_pin', 
            'pin': getEnteredPIN(), 
            'callback_id': callbackID
        });
    }
    
    // Attach message handler for both browser chrome and for when
    // we're running in an iframe.
    chrome.extension.onMessage.addListener(onMessage);
    window.addEventListener('message',function(e){
        onMessage(e.data);
    },false);
};

$(document).ready(initializePINEntry);
 // PIN the user entered previously.
var previousPIN = null;

// Should we ask the user to repeat their PIN after entry?
var repeatPIN = false;
// Is this the repeat step, or the first time?
var repeatingPIN = false;

// Callback ID to send back up to pin_ui.js
var callbackID = null;

if (!self) {
    // If we're in an iframe, we have to bolt self.postMessage to the 
    // iframe postMessage.
    self = {
        postMessage: function(data) {
            parent.postMessage('iframe_message',data);
        }
    };
}

$(document).ready(function() {
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
                repeatPIN = Boolean(msg.repeat)//(msg.repeat !== undefined);
                console.log('repeatPIN = ', repeatPIN);
                break;
            case 'set_callbackid':
                callbackID = msg.callback_id;
                break;
        }
    }
    
    function getEnteredPIN() {
        // Using .get() because jQuery .map returns an object and not an array.
        return $('input').get().map(function(x) { return x.value; } ).join('');
    }
    
    function submitPIN() {
        // We're done, submit the PIN.
        chrome.extension.sendMessage({
            'type': 'submit_pin', 
            'pin': getEnteredPIN(), 
            'callback_id': callbackID
        });
    }
    
    if (chrome && chrome.extension) {
        chrome.extension.onMessage.addListener(onMessage);   
    }
    else {
        alert('attaching iframe listener');
        // When we're running in an iframe
        window.addEventListener('message',function(e){
            console.log('in iframe, got message');
            alert('in iframe, got message: ', JSON.stringify(e.data));
        });
        
        window.parent.postMessage({
            type: 'test'
        },'*');
    }
    
});

// 
// function test() {
//     console.log('test!');
//     document.write('hello world!');
//     
//     chrome.extension.sendMessage({
//         type: 'test_msg',
//         message: []
//     });
// }
// 
// test();
// TODO: Unite this, common/pin_entry.js, and pages/common/x-tags/pin/pin.js into something
// reusable and not jQuery dependant.

$(document).ready(function() {
    function getEnteredPIN() {
        // Using .get() because jQuery .map returns an object and not an array.
        return $('.pin-digit').get().map(function(x) { return x.value; } ).join('');
    }
    
    $('.pin-digit').keypress(function(evt) {
        var input = this;
        // Did the user type a digit?
        if (evt.charCode >= '0'.charCodeAt(0) && evt.charCode <= '9'.charCodeAt(0)) {
            // Wait a beat so that we have what the user entered.
            setTimeout(function() {
                if ($(input).val().length == 1) {
                    if ($(input).attr('tabindex') == 4) {
                        // User finished entering PIN
                        chrome.extension.sendMessage({
                            type: 'validate_pin',
                            message: {
                                pin: getEnteredPIN()   
                            }
                        },
                        function(response) {
                            if (response.is_valid) {
                                CompleteInfobar({
                                    type: 'pin_entry',
                                    pin_valid: true
                                });
                            }
                            else {
                                // TODO: Prompt for master password after three failures
                                $('.pin-digit').addClass('wrong-pin');
                                $('#pin-entry-prompt').html('Incorrect PIN. Try again.');
                                resetPINForm();
                            }
                        });
                    }
                    else {
                        // Advance focus to the element with the next tabindex.
                        $('[tabindex="'+ ($(input).attr('tabindex')+1) + '"]').focus();   
                    }
                }
            },1);
        }
        else {
            // Make sure this character won't get typed.
            evt.preventDefault();
        }
    });
    
    function resetPINForm() {
        $('.pin-digit').val('');
        $('#digit1').focus();
    }
    
    resetPINForm();
});

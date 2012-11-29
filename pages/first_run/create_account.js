$(document).ready(function() {
    $('#account-form').submit(function() {
        // Validate form
        if ($('[name="pin"]').get()[0].value != $('[name="pin-repeat"]').get()[0].value) {
            alert('PINs must match!');
            return false;
        }
    	var backgroundPage = chrome.extension.getBackgroundPage();
        // Set user PIN
        backgroundPage.setAndSavePIN($('[name="pin"]').get()[0].value);
        backgroundPage.firstRunFinished();
    })
});
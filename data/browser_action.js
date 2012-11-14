/*
*   browser_action.js
*
*
*   This code runs inside of the browser action popup. Enables the user
*   to choose a login and copy the corresponding password to their clipboard,
*   as well as prompting them for a PIN inside of a iframe (pin_entry.html).
*
*/

function copyToClipboard(_str) {
    chrome.extension.sendMessage({
        type: 'copy_clipboard',
        str: _str
    });
}

$(document).ready(function() {
	var backgroundPage = chrome.extension.getBackgroundPage();
    var data = backgroundPage.getPageDataForPopup(function(data) {
        var pinLocked = false;
        for (var login in data) {
            var newEl = $('<div><strong>' + data[login].username + '</strong>: \
            <input class="pwd-copy" type="submit" value="copy" data-password="' + data[login].password + '"></div>')
            $('#logins').append(newEl);
            // Technically, there should be only one login, and if there are more, only all or none
            // of them should be marked pin locked, but since this is still experimental,
            // I'm PIN locking if even one of them is.
            if (data[login].pin_locked) pinLocked = true;
        }
        
        if (pinLocked) {
            $('#logins').hide();
            $('#pin-entry-frame').show();
            var pinEntryIframe = $('#pin-entry-frame').get()[0];
            // Use setTimeout to wait a beat so the document ready handler in pin_entry.js
            // has a chance to run.
            setTimeout(function() {
                pinEntryIframe.contentWindow.postMessage({
                    'type': 'set_prompt',
                    'prompt': "Enter your PIN to see your accounts for this site."
                }, '*');
                // This tells pin_entry.js to use window.postMessage instead of 
                // chrome.extension.sendMessage.
                pinEntryIframe.contentWindow.postMessage({
                    'type': 'set_container',
                    'in_iframe': true
                }, '*');
            },1);
            pinEntryIframe.contentWindow.addEventListener('message',function(e) {
				var msg = e.data;
				switch(msg.type) {
					case 'submit_pin':
						if (backgroundPage.validatePIN(msg.pin)) {
				            $('#logins').show();
				            $('#pin-entry-frame').hide();
						}
						else {
			                pinEntryIframe.contentWindow.postMessage({
			                    'type': 'set_prompt',
			                    'prompt': "Sorry, that was incorrect. Please try again."
			                }, '*');
			                pinEntryIframe.contentWindow.postMessage({
			                    'type': 'reset_entry'
			                }, '*');
						}	
					break;
				}
            });
        } 
        $('.pwd-copy').click(function() {
            copyToClipboard($(this).attr('data-password'));
        });
    });
});
$(document).ready(function() {
	var backgroundPage = chrome.extension.getBackgroundPage();
	$('#step1 button').click(function(e) {
		// Prevent form from submitting
		e.preventDefault();
		validateSignup(function(result) {
			if (result.type == 'error') {
				$('#form-error-alert').show();
				$('#form-error-alert .alert-text').html(result.msg);
				return;
			}
			else {
				startStep2();
			}
		});
	});
	
	function startStep2() {
		// Hide, in case the error was revealed on a previous attempt.
		$('#form-error-alert').hide();
		$('#step1').hide();
		$('#step2').show();
				
        var pinEntryIframe = $('#pin-entry-frame').get()[0];
        // Use setTimeout to wait a beat so the document ready handler in pin_entry.js
        // has a chance to run.
        setTimeout(function() {
            pinEntryIframe.contentWindow.postMessage({
                'type': 'set_prompt',
				'repeat': true,
                'prompt': "Create a PIN for Gombot to protect your passwords."
            }, '*');
            // This tells pin_entry.js to use window.postMessage instead of 
            // chrome.extension.sendMessage.
            pinEntryIframe.contentWindow.postMessage({
                'type': 'set_container',
                'in_iframe': true
            }, '*');
        },1);
        pinEntryIframe.contentWindow.addEventListener('message',function(e) {
			if (e.data.type == 'submit_pin') {
				backgroundPage.setAndSavePIN(e.data.pin);
				startStep3();
			}
		});
	}
	
	function startStep3() {
		$('#step2').hide();
		$('#step3').show();
		backgroundPage.firstRunFinished();
	}
});

function validateSignup(callback) {
	if ($('#master-password').val() != $('#master-password-again').val()) {
		callback({
			type: 'error',
			msg: 'Passwords don\'t match!'
		});
	}
	else {
		// TODO: Client library needs to talk to the server here
		callback({
			type: 'success'
		});
	}
}
$(document).ready(function() {

    $('#pin-info-link').click(function (ev) {
        $('#account-form').toggleClass('show-info');
    });

    $('#account-form').submit(function(e) {
        // Validate form
        var ok = checkPINs();
        ok = checkEmail() && ok;
        ok = checkPasswords() && ok;
        if (ok) {
          var backgroundPage = chrome.extension.getBackgroundPage();
          // Set user PIN
          backgroundPage.setAndSavePIN($('[name="pin"]').get()[0].value);
          backgroundPage.firstRunFinished();
        } else {
          e.preventDefault();
        }
    })
});

function checkPINs() {
    var pin = $('[name="pin"]').get()[0];
    var repeat = $('[name="pin_repeat"]').get()[0];
    if (pin.value.length !== 4) {
        $('.pin').addClass('invalid').addClass('short');
        return false;
    }
    $('.pin').removeClass('short');
    if (pin.value !== repeat.value) {
        $('.pin').addClass('invalid').addClass('mismatch');
        pin.value = '';
        repeat.value = '';
        return false;
    }
    $('.pin').removeClass('invalid')
              .removeClass('mismatch');
    return true;
}

function checkPasswords() {
    var pass = $('[name="password"]').get()[0].value;
    if (pass.length < 6) {
        $('.password').addClass('invalid').addClass('short');
        return false;
    }
    $('.password').removeClass('short');
    if (pass !== $('[name="password_repeat"]').get()[0].value) {
        $('.password').addClass('invalid').addClass('mismatch');
        return false;
    }
    $('.password').removeClass('invalid')
                  .removeClass('mismatch');
    return true;
}

// borrowed from browserid dialog validation module
function verifyEmail(address) {
    if (typeof(address) !== "string")
        return false;
    // Original gotten from http://blog.gerv.net/2011/05/html5_email_address_regexp/
    // changed the requirement that there must be a ldh-str because BrowserID
    // is only used on internet based networks.
    var parts = address.split("@");

    return (/^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i).test(address)
           // total address allwed to be 254 bytes long
           && address.length <= 254
           // local side only allowed to be 64 bytes long
           && parts[0] && parts[0].length <= 64
           // domain side allowed to be up to 253 bytes long
           && parts[1] && parts[1].length <= 253;
};

function checkEmail() {
    var email = $('[name="email"]').get()[0].value;
    if (!email || !verifyEmail(email)) {
        $('.email').addClass('invalid');
        return false;
    }
    $('.email').removeClass('invalid');
    return true;
}

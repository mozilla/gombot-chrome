var messenger;
$(document).ready(function() {
  messenger = PageMessaging();
  messenger.messageToChrome({});
  var busy = false;

  $('#pin-info-link').click(function(ev) {
    $('#account-form').toggleClass('show-info');
  });

  $('#account-form').submit(function(e) {
    var validEmail, validPassword, validPin, ok, scrollToEl;
    e.preventDefault();
    if (busy) return;
    busy = true;

    // Validate form
    validPin = checkPINs();
    // TODO: canonicalize email
    validEmail = checkEmail();
    validPassword = checkPasswords();
    ok = validPin && validEmail && validPassword;
    if (ok) {
      var email = $('[name="email"]').get()[0].value.trim();
      var password = $('[name="password"]').get()[0].value;
      var newsletter = $('[name="newsletter"]').is(':checked');
      var pin = $('[name="pin"]').get()[0].value;
      ProgressIndicator.show();

      messenger.messageToChrome({
        type: 'create_user',
        message: {
          password: password,
          email: email,
          pin: pin,
          newsletter: newsletter
        }
      }, function(err) {
        if (err) {
          console.log("ERROR", err);
          if (err.response && err.response.errorMessage.match(/That email has already been used/)) {
            $('.email').addClass('used');
            $('html, body').animate({
              scrollTop: $("#email").offset().top
            }, 250);
          }
          // TODO: handle any errors
          ProgressIndicator.hide();
          busy = false;
        } else {
          ProgressIndicator.hide();
          window.location = '/data/pages/first_run/success.html';
          busy = false;
        }
      });
    }
    else { // validation problem
      busy = false;
      if (!validEmail) scrollToEl = "#email";
      else if (!validPassword) scrollToEl = "#password";
      else if (!validPin) scrollToEl = "#pin";
      $('html, body').animate({
         scrollTop: $(scrollToEl).offset().top
     }, 250);
    }
  });
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
}

function checkEmail() {
  $('.email').removeClass('used');
  var email = $('[name="email"]').get()[0].value;
  if (!email || !verifyEmail(email)) {
    $('.email').addClass('invalid');
    return false;
  }
  $('.email').removeClass('invalid');
  return true;
}

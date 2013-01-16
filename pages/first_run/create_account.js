$(document).ready(function() {
  var Gombot = chrome.extension.getBackgroundPage().Gombot;
  //var GombotClient = chrome.extension.getBackgroundPage.GombotClient;
  var userCollection = Gombot.users;
  var server = 'https://gombot.org';
  //var client = new GombotClient(server + '/api');
  var busy = false;

  // seed entropy
  // client.context({}, function(err, data) {
  //   client.timeOffset = (new Date()/1000 >>> 0) - data.server_time;
  // });

  $('#pin-info-link').click(function(ev) {
    $('#account-form').toggleClass('show-info');
  });

  $('#account-form').submit(function(e) {
    e.preventDefault();
    if (busy) return;
    busy = true;

    // Validate form
    var ok = checkPINs();
    // TODO: canonicalize email
    ok = checkEmail() && ok;
    ok = checkPasswords() && ok;
    if (ok) {
      var email = $('[name="email"]').get()[0].value.trim();
      var password = $('[name="password"]').get()[0].value;
      var newsletter = $('[name="newsletter"]').get()[0].value === 'subscribe';
      var pin = $('[name="pin"]').get()[0].value;
      ProgressIndicator.show();
      busy = false;
      ProgressIndicator.hide();
      var user = new Gombot.User({
        'email': email,
        'pin': pin
      });

      user.password = password;
      user.newsletter = newsletter;

      user.save(null,{
        success: function() {
          userCollection.add(user);
          Gombot.setCurrentUser(user);
          window.location = '/pages/first_run/success.html';
        }
      });
    }
  });
});

var ProgressIndicator = (function() {
  var indicatorImage = $('<img>')
  .addClass('progress-indicator-image')
  .attr('src', '../common/img/spinner.gif').get(0);
  return {
    show: function() {
      if ($('.progress-indicator').has(indicatorImage).length == 0) {
        $('.progress-indicator').append(indicatorImage);
      }
      $(indicatorImage).show();
    },
    hide: function() {
      $(indicatorImage).hide();
    }
  };
})();

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
  var email = $('[name="email"]').get()[0].value;
  if (!email || !verifyEmail(email)) {
    $('.email').addClass('invalid');
    return false;
  }
  $('.email').removeClass('invalid');
  return true;
}

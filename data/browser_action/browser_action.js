/*
*   browser_action.js
*
*
*   This code runs inside of the browser action popup. Enables the user
*   to choose a login and copy the corresponding password to their clipboard,
*   as well as prompting them for a PIN to view their passwords..
*
*/

var messenger;

function copyToClipboard(_str) {
    chrome.extension.sendMessage({
        type: 'copy_clipboard',
        str: _str
    });
}

// This function will be called when Gombot content scripts "boot up"
// inside of a panel (ie. window.location is a resource:// URL).
$(document).ready(function() {
  $('body').html(window.location);
  return;
  messenger = Gombot.Messaging();
  dump('get_current_user\n');
  document.body.innerHTML = window.location.toString();
  Gombot.messenger.messageToChrome({
      type: 'get_current_user',
      message: {}
    },
    function(data) {
      currentUser = data;
      initUI();
    }
  );
    console.log('Gombot Messaging: ',Gombot.Messaging);
});

function initUI() {
  dump('initUI\n');
  dump(JSON.stringify(currentUser),'\n');
  if (currentUser) {
    $('#current-user-email').html(currentUser.get('email'));
    // The user has already signed up for Gombot, so ask for feedback.
    $('.show-after-signup').show();
    $('#feedback-link').click(function(e) {
    	chrome.tabs.create({
            url: 'https://getsatisfaction.com/gombotalpha'
    	});
      e.preventDefault();
    });
    $('#export-data-link').click(function(e) {
        // This functionality was removed for now.
        //backgroundPage.downloadExportDataFile();
        e.preventDefault();
    });
    initBrowserAction();
  }
  else {
    // Display reminder to sign in to/create a Gombot account.
    $('#signup-nag').show();
  }
  $('.signup-link').click(function(e) {
      backgroundPage.startFirstRunFlow();
      e.preventDefault();
  });
  $('.signout-link').click(function(e) {
      Gombot.clearCurrentUser(function() { window.location.reload(); });
      e.preventDefault();
  });
}

function initBrowserAction() {
  var currentUser = Gombot.getCurrentUser();
  backgroundPage.getActiveTab(function(tab) {
    var newURL = backgroundPage.Uri(tab.url);
    // TODO: Make this realm-aware
    var logins = currentUser.get('logins').filter(function(login) {
      var loginURI = backgroundPage.Uri(login.get('loginurl'));
      return loginURI.host() == newURL.host();
    });
    // Show the divider to show the separation in the layout.
    $('#divider').show();
    if (logins.length == 0) {
      $('#logins').hide();
      $('#no-logins-saved').show();
      return;
    }
    // Technically, there should be only one login, and if there are more, only all or none
    // of them should be marked pin locked, but since this is still experimental,
    // I'm PIN locking if even one of them is.
    if (_.some(logins,function(login) { return login.get('pinLocked'); })) {
      $('#logins').hide();
      $('#pin-entry').show();
      var pinEntryWidget = $('[name="pin"]').get()[0];
      // Focus on first PIN digit
      $('x-pin input:first').focus();
      pinEntryWidget.addEventListener('changed', function(e) {
        // Ensure the user has finished entering their PIN.
        if (pinEntryWidget.value.length == 4) {
          if (backgroundPage.validatePIN(pinEntryWidget.value)) {
            $('#logins').show();
            $('#pin-prompt').hide();
            $('x-pin').hide();
            // The user has successfully authenticatd with their PIN,
            // so fill in the forms on the current page.
            backgroundPage.formFillCurrentTab();
          }
          else {
            $('#pin-prompt').html('Sorry, that was incorrect. Please try again.');
            $('x-pin input').val('');
            $('x-pin input:visible:first').focus();
          }
        }
      });
    }
    const PASSWORD_REPLACEMENT = '••••••••';
    for (var i in logins) {
        var passwordHTMLString = '<div class="login"><strong>' + logins[i].get('username') +
            '</strong><input class="copy-button" type="submit" value="copy" data-password="' + logins[i].get('password') + '">'
            + '<span class="fubared-password">' + PASSWORD_REPLACEMENT + '</span></div>'
        var newEl = $(passwordHTMLString);
        $('#logins').append(newEl);

    }
    $('.copy-button').click(function() {
        copyToClipboard($(this).attr('data-password'));
    });
  });
}
$(document).ready(function() {
    var Gombot = chrome.extension.getBackgroundPage().Gombot;
    var userCollection = Gombot.users;
    var server = 'https://gombot.org';
    var client = new GombotClient(server + '/api');
    var busy = false;

    // seed entropy
    client.context({}, function(err, data) {
        client.timeOffset = (new Date()/1000 >>> 0) - data.server_time;
    });

    $('#sign-in-form').submit(function(e) {
        e.preventDefault();
        if (busy) return;
        busy = true;
        $('#sign-in-form').removeClass('invalid');
        var email = $('[name="email"]').get()[0].value;
        var password = $('[name="password"]').get()[0].value;
        client.signIn({
            email: email,
            pass: password
        }, function (err) {
          busy = false;
          if (err) {
            $('#sign-in-form').addClass('invalid');
          } else {
            var user = userCollection.find(function(obj) {
              return obj.get('email') === email;
            });
            if (user) {
              user.keys = client.keys;
              Gombot.setCurrentUser(user);
              window.location = 'success.html';
            }
            else {
              // TODO: getPayload
              console.log("Can't find a backbone object for this email!");
            }
          }
        });
    });
});

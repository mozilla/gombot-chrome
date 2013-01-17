$(document).ready(function() {
    var Gombot = chrome.extension.getBackgroundPage().Gombot;
    var userCollection = Gombot.users;
    //var server = 'https://gombot.org';
    //var client = new GombotClient(server + '/api');
    var busy = false;

    // seed entropy
    //client.context({}, function(err, data) {
    //    client.timeOffset = (new Date()/1000 >>> 0) - data.server_time;
    //});

    $('#sign-in-form').submit(function(e) {
        e.preventDefault();
        if (busy) return;
        busy = true;
        ProgressIndicator.show();
        $('#sign-in-form').removeClass('invalid');
        var email = $('[name="email"]').get()[0].value;
        var password = $('[name="password"]').get()[0].value;
        var user = userCollection.find(function(obj) {
          return obj.get('email') === email;
        }) || new Gombot.User({ email: email });
        user.fetch({ success: function() {
                       ProgressIndicator.hide();
                       Gombot.setCurrentUser(user);
                       userCollection.add(user);
                       window.location = '/pages/first_run/success.html';
                     },
                     error: function(err) {
                       $('#sign-in-form').addClass('invalid');
                       ProgressIndicator.hide();
                     },
                     password: password
                   });
    });
});

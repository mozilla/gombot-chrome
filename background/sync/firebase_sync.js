var FirebaseSync = function(Backbone, _, firebaseStoreName) {

  var firebaseUserRef = 'https://gombot.firebaseIO.com/'+firebaseStoreName;

  function getFirebaseStoreForUser(model) {
    var storePath = [ firebaseUserRef,
                      btoa(model.get("email")),
                      model.keys.authKey,
                      model.keys.authKey ].join('/');
    return new Backbone.Firebase(new Firebase(storePath));
  }

  function sync(method, model, options) {
    if (!model.keys) {
      console.log("Error missing keys in model for firebase", model);
      return;
    }
    model.firebase = model.firebase || getFirebaseStoreForUser(model);
    Backbone.Firebase.sync(method, model, options);
  }

  return {
    sync: sync
  };
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = FirebaseSync;
}


//  var authClient = new FirebaseAuthClient(dataRef, authClientCallback);
  // chrome.webRequest.onBeforeSendHeaders.addListener(
  //   function(details) {
  //     // Remove Origin header if it exists
  //     for (var i = 0; i < details.requestHeaders.length; ++i) {
  //       if (details.requestHeaders[i].name === 'Origin') {
  //         details.requestHeaders.splice(i, 1);
  //         break;
  //       }
  //     }
  //     // Remove Referer header if it exists
  //     for (var i = 0; i < details.requestHeaders.length; ++i) {
  //       if (details.requestHeaders[i].name === 'Referer') {
  //         details.requestHeaders.splice(i, 1);
  //       }
  //     }
  //     // Add a Referer header for gombot.org
  //     details.requestHeaders.push({ name: 'Referer', value: 'https://gombot.org/'});
  //     return {requestHeaders: details.requestHeaders};
  //   },
  //   { urls: ["https://auth.firebase.com/*"] },
  //   ["blocking", "requestHeaders"]
  // );


  // function authClientCallback(error, user) {
  //   if (error) {
  //     // an error occurred while attempting login
  //     console.log(error);
  //   } else if (user) {
  //     currentUser = user;
  //     usersRef.child(user.id).on('value', getUserData);
  //     // user authenticated with Firebase
  //     console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
  //   } else {
  //     if (currentUser) usersRef.child(currentUser.id).off('value', getUserData);
  //     currentUser = null;
  //     // user is logged out
  //   }
  // }

  // function create(email, password, options) {
  //   authClient.createUser(email, password, function(error, user) {
  //     if (!error) {
  //       console.log('User Id: ' + user.id + ', Email: ' + user.email);
  //     } else {
  //       console.log("FirebaseSync.create error:", error);
  //     }
  //   });
  // }

  // function login(email, password, options) {
  //   authClient.login('password', {
  //     email: email,
  //     password: password,
  //     rememberMe: true
  //   });
  // }

/*
*   storage.js
*
*
*   Handles persisting user data via localStorage.
*
*/

// This handles the low-level localStorage
// TODO: handle errors
var LocalStorage = function() {
  return {
    getItem: function(key, callback) {
      chrome.storage.local.get(key, function(storageObj) {
        callback(storageObj[key]);
      });
    },
    setItem: function(key, data, callback) {
      var updatedObj = {};
      updatedObj[key] = data;
      chrome.storage.local.set(updatedObj, callback);
    },
    removeItem: function(key, callback) {
      chrome.storage.local.remove(key, callback);
    }
  }
};

// var User = (function(Storage){

//   // In-memory storage for user data that gets synced.
//   var _logins = {};
//   var _neverAsk = {};
//   var _pin = null;

//   // In-memory storasge for user data that's persisted to localStorage, but not synced.
//   var _didFirstRun = false;

//   // The key for the document in localStorage which holds all of the user
//   // data synced with the server.
//   const SYNC_DOCUMENT_KEY = 'gombot_user_data';

//   const DATA_VERSION = 'identity.mozilla.com/gombot/v1/userData';

//   // NB: remove every call to fetchStoredData and updateStoredData before commit!

  // function fetchStoredData(callback) {
  //   var keysToFetch = [
  //     SYNC_DOCUMENT_KEY,
  //     'did_first_run'
  //   ];
  //   chrome.storage.local.get(SYNC_DOCUMENT_KEY, function(storageObj) {
  //     var userData = storageObj;//[SYNC_DOCUMENT_KEY];
  //     if (userData === undefined) {
  //       userData = {
  //         version: DATA_VERSION,
  //         logins: {},
  //         pin: loginsLock.pin || null,
  //         neverAsk: {}
  //       };
  //     }
  //     callback(userData);
  //   });
  // }

//   // function updateStoredData(obj) {
//   //   var updatedObj = {};
//   //   updatedObj[SYNC_DOCUMENT_KEY] = obj;
//   //   chrome.storage.local.set(updatedObj);
//   // }

//   function saveToLocalStorage() {
//     Storage.set(SYNC_DOCUMENT_KEY, {
//       version: DATA_VERSION,
//       logins: _logins || {},
//       pin: _pin || null,
//       neverAsk: _neverAsk || {}
//     });
//     Storage.set('did_first_run',_didFirstRun);
//   }

//   function loadFromLocalStorage() {
//     fetchStoredData(function(userData) {
//       _logins = userData[SYNC_DOCUMENT_KEY].logins;
//       _pin = userData[SYNC_DOCUMENT_KEY].logins;
//       _neverAsk = userData[SYNC_DOCUMENT_KEY].neverAsk;
//       _didFirstRun = userData['did_first_run'];
//     });
//   }

//   // Load from localStorage into memory when extension starts.
//   loadFromLocalStorage();

//   var userData = {};

//   var loginsObj = (function() {
// function formatStoredLogin(login) {
//   return {
//     username: login.username,
//     password: login.password,
//     hostname: login.hostname,
// 
//     // Fields that may be missing
//     title: login['title'] || '',
//     url: login['url'] || '',
//     pinLocked: login['pinLocked'] || false,
//     supplementalInformation: login['supplementalInformation'] || {}
//   };
// }
//     return {
//       // Save a new login object to localStorage
//       add: function(newLogin) {
//         var loginObj = formatStoredLogin(newLogin);
//         // Filter for logins with the same username and hostname.
//         var existingLoginsForHost = _logins[newLogin.hostname] || [];
//         _logins[newLogin.hostname] =
//           existingLoginsForHost.filter(function(_login) {
//             return _login.username != loginObj.username;
//           });
//         _logins[newLogin.hostname].push(loginObj);
//         saveToLocalStorage();
//       },
//       // Takes a hostname and a callback, and passes it a list of login
//       // objects the user has saved for that domain.
//       getForHostname: function(hostname/*,callback*/) {
//           return (_logins[hostname] || []);
//       },

//       // Mainly for debugging purposes.
//       deleteForHostname: function(hostname) {
//         delete _logins[hostname];
//         saveToLocalStorage();
//       }
//     };
//   })();

//   var neverAskObj = (function() {
//     return {
//       // Add a hostname to the list of sites for which we never
//       // prompt to save passwords
//       add: function(siteHostname) {
//         if (!(siteHostname in _neverAsk)) {
//           _neverAsk[siteHostname] = 'all';
//           saveToLocalStorage();
//         }
//       },
//       // Takes a callback, and passes it a list of domains the user
//       // has elected to never save logins on.
//       get: function(/*callback*/) {
//         return _.keys(userData.neverAsk);
//       },
//       // Takes a hostname and a callback. Passes callback a boolean,
//       // indicating if the user *should* be asked about logins
//       // on that domain.
//       checkForHostname: function(hostname/*,callback*/) {
//         return !(hostname in this.get());
//       }
//     };
//   })();

//   var firstRunObj = (function(){
//     return {
//       wasCompleted: function() {
//         // Takes a callback, and passes it a boolean indicating whether
//         // or not the user has completed the first run flow.
//         // Note that this will return true if the user started the first
//         // run flow but did not complete it.
//         return _didFirstRun;
//       },
//       setIfCompleted: function(firstRunFinished) {
//         //setIfDidFirstRun
//         // Set (or unset) the flag indicating the user has finished the first
//         // run flow.
//         _didFirstRun = firstRunFinished;
//         saveToLocalStorage();
//       }
//     };
//   })();

//   var pinObj = (function() {
//     return {
//       validate: function(testPin) {
//         return testPin == _pin;
//       },
//       get: function() {
//         return _pin;
//       },
//       set: function(newPIN) {
//         _pin = newPIN || null;
//         saveToLocalStorage();
//       }
//     }
//   });
//   return {
//     Logins: loginsObj,
//     neverAsk: neverAskObj,
//     firstRun: firstRunObj,
//     PIN: pinObj
//   };
// })(Gombot.Storage);

// // Takes a callback, and passes it a list of domains the user
// // has elected to never save logins on.
// function getNeverSaveOnSites(callback) {
//     fetchStoredData(function(userData) {
//        callback(_.keys(userData.neverAsk));
//     });
// }

// // Takes a hostname and a callback, and passes it a list of login
// // objects the user has saved for that domain.
// function getLoginsForSite(hostname,callback) {
//     fetchStoredData(function(userData) {
//         callback(userData.logins[hostname] || []);
//     });
// }

// // Mainly for debugging purposes.
// function deleteLoginsForSite(hostname) {
//     fetchStoredData(function(userData) {
//         delete userData[hostname];
//         updateStoredData(userData);
//     });
// }

// Returns a string of a comma separated value file containing the hostname, username,
// and password for each login the user has saved.
function getLoginsCSV(callback) {
  // Add header
  var retVal = "hostname,username,password\n";
  fetchStoredData(function(userData) {
    for (var item in _.keys(userData.logins)) {
      for (var login in userData.logins[item]) {
        retVal += login.hostname + ',' + login.username
          + ',' + login.password + '\n';
      }
    }
    callback(retVal);
  });
}

// Dump localStorage to CSV file, for debugging purposes.
function downloadExportDataFile() {
  // Get entire content of localStorage
  // NB: This contains all of the user's passwords in plaintext, as well as
  // their PIN and not-so-useful flags like did_first_run.
  getLoginsCSV(function(loginsCSV) {
    // Turn storageObj into a blob
    var blob = new window.Blob([loginsCSV], {type: 'text/csv'});

    // Creates a link that opens the blob on the background page,
    // and then clicks it. Cribbed from:
    // http://stackoverflow.com/questions/4845215/making-a-chrome-extension-download-a-file
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'passwords_dump.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    delete a;// we don't need this anymore
  });
}

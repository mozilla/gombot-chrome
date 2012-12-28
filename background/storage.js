/*
*   storage.js
*
*
*   Handles persisting user data via localStorage.
*
*/

 
//
// Getting and saving login data to/from localStorage
//

// List of hostnames the user has asked passwords not to be saved on.
// Kept in sync with local storage.
var neverSaveOnSites = [];

// Other type: 'pin' when PIN locking is enabled.
var loginsLock = {
    type: 'none'
};

// Takes a callback, and passes it a boolean indicating whether
// or not the user has completed the first run flow.
// Note that this will return true if the user started the first
// run flow but did not complete it.
function checkIfDidFirstRun(callback) {
	chrome.storage.local.get('did_first_run', function(storageObj) {
		callback(Boolean(storageObj.did_first_run));
	});	
}

// Set (or unset) the flag indicating the user has finished the first
// run flow.
function setIfDidFirstRun(firstRunFinished) {
	chrome.storage.local.set({
        'did_first_run': Boolean(firstRunFinished)
    });
}

// Updates the user's PIN in loginsLock and also updates localStorage.
function setAndSavePIN(pin) {
    loginsLock = {
        'type': 'pin',
        'pin': pin
    };
    saveLoginsLock();
}

function loadLoginsLock() {
    // Load PIN lock state from localStorage
    chrome.storage.local.get('logins_lock', function(storageObj) {
        if (storageObj.logins_lock === undefined) storageObj.logins_lock = {type: 'none'};
        loginsLock = storageObj.logins_lock;
    });
}

function saveLoginsLock() {
    // Persist loginsLock to localStorage, to preserve PIN across sessions
    chrome.storage.local.set({
      'logins_lock': loginsLock
    });
}

// Save a new login object to localStorage
function saveToStorage(newLogin) {      
  var siteLoginsKey = 'logins_' + newLogin.hostname;
  chrome.storage.local.get(siteLoginsKey, function(storageObj) {
      var storageLogins = storageObj[siteLoginsKey];
      if (storageLogins === undefined) storageLogins = {};
      if (storageLogins.stored_logins === undefined) storageLogins.stored_logins = [];
      // Filter for similar logins.
      storageLogins.stored_logins = storageLogins.stored_logins.filter(function(_login) {
          return _login.hostname != newLogin.hostname && _login.username != newLogin.username;
      });
      storageLogins.stored_logins.push(newLogin);
      storageObj[siteLoginsKey] = storageLogins;
      chrome.storage.local.set(storageObj);
  });
}

// Add a hostname to the list of sites for which we never 
// prompt to save passwords
function neverSaveOnSite(siteHostname) {
  getNeverSaveOnSites(function(storedSites) {
      storedSites.push(siteHostname);
      chrome.storage.local.set({
          'never_save_on': storedSites
      });
      neverSaveOnSites = storedSites;
  });
}

// Takes a callback, and passes it a list of domains the user
// has elected to never save logins on. 
function getNeverSaveOnSites(callback) {
  chrome.storage.local.get('never_save_on', function(storageObj) {
      var storedSites = storageObj.never_save_on;
      if (storedSites === undefined) storedSites = [];
      callback(storedSites);
  });
}

// Takes a hostname and a callback, and passes it a list of login
// objects the user has saved for that domain.
function getLoginsForSite(hostname,callback) {
  var siteLoginsKey = 'logins_' + hostname;
  chrome.storage.local.get(siteLoginsKey, function(storageObj) {
      if (storageObj[siteLoginsKey] == undefined) storageObj[siteLoginsKey] = {};
      var storedLogins = storageObj[siteLoginsKey].stored_logins;
      if (storedLogins === undefined) storedLogins = [];
      function formatStoredLogin(login) {
          return {
              username: login.username,
              password: login.password,
              hostname: login.hostname,
              
              // Fields that may be missing
              title: login['title'] || '',
              url: login['url'] || '',
              pinLocked: login['pinLocked'] || false,
              supplementalInformation: login['supplementalInformation'] || {},   
          };
      }
      callback(storedLogins.map(formatStoredLogin));
  });
}
  
// Mainly for debugging purposes.
function deleteLoginsForSite(hostname) {
  var loginsKey = 'logins_' + hostname;
  var storageObj = {};
  storageObj[loginsKey] = {};
  chrome.storage.local.set(storageObj);
}

// Returns a string of a comma separated value file containing the hostname, username,
// and password for each login the user has saved.
function getLoginsCSV(callback) {
    // Add header
    var retVal = "hostname,username,password\n";
    chrome.storage.local.get(null, function(storageObj) {
        for (var item in storageObj) {
            if (item.substr(0,7) == 'logins_' && item != 'logins_lock') {
                var login = storageObj[item].stored_logins[0];
                retVal += login.hostname + ',' + login.username + ',' + login.password + '\n';
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

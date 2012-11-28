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
    // Update the browserAction popup page.
    chrome.browserAction.setPopup({
        popup: firstRunFinished ? "data/browser_action.html" : "data/first_run.html"
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
      callback(storedLogins);
  });
}
  
// Mainly for debugging purposes.
function deleteLoginsForSite(hostname) {
  var loginsKey = 'logins_' + hostname;
  var storageObj = {};
  storageObj[loginsKey] = {};
  chrome.storage.local.set(storageObj);
}

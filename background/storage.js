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

// The key for the document in localStorage which holds all of the user
// data synced with the server.
const LOCAL_STORAGE_KEY = 'gombot_user_data';

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
    fetchStoredData(function(userData) {
        if (userData['pin']) {
            loginsLock = {
                type: 'pin',
                pin: userData.pin
            };
        }
        else {
            loginsLock = {
                type: 'none'
            };
        }
    });
}

function saveLoginsLock() {
    // Persist loginsLock to localStorage, to preserve PIN across sessions
    fetchStoredData(function(userData) {
        userData['pin'] = loginsLock.pin || null;
        updateStoredData(userData);
    });
}

function formatStoredLogin(login) {
    return {
        username: login.username,
        password: login.password,
        hostname: login.hostname,

        // Fields that may be missing
        title: login['title'] || '',
        url: login['url'] || '',
        pinLocked: login['pinLocked'] || false,
        supplementalInformation: login['supplementalInformation'] || {}
    };
}

function fetchStoredData(callback) {
    chrome.storage.local.get(LOCAL_STORAGE_KEY, function(storageObj) {
        var userData = storageObj[LOCAL_STORAGE_KEY];
        if (userData === undefined) {
            userData = {
                version: "identity.mozilla.com/gombot/v1/userData",
                logins: {},
                pin: loginsLock.pin || null,
                neverAsk: {}
            };
        }
        callback(userData);
    });
}

function updateStoredData(obj) {
    var updatedObj = {};
    updatedObj[LOCAL_STORAGE_KEY] = obj;
    chrome.storage.local.set(updatedObj);
}

// Save a new login object to localStorage
function saveLoginToStorage(newLogin) {
    var loginObj = formatStoredLogin(newLogin);
    fetchStoredData(function(userData) {
        // Filter for logins with the same username and hostname.
        var existingLoginsForHost = userData.logins[newLogin.hostname] || [];
        userData.logins[newLogin.hostname] =
            existingLoginsForHost.filter(function(_login) {
                return _login.username != loginObj.username;
            });
        userData.logins[newLogin.hostname].push(loginObj);
        updateStoredData(userData);
    });
}

function loadNeverSaveOnSites() {
    getNeverSaveOnSites(function(siteNames) { neverSaveOnSites = siteNames; });
}

// Add a hostname to the list of sites for which we never
// prompt to save passwords
function neverSaveOnSite(siteHostname) {
    fetchStoredData(function(userData) {
        if (!(siteHostname in userData.neverAsk)) {
            userData.neverAsk[siteHostname] = 'all';
            updateStoredData(userData);
            loadNeverSaveOnSites();
        }
    });
}

// Takes a callback, and passes it a list of domains the user
// has elected to never save logins on.
function getNeverSaveOnSites(callback) {
    fetchStoredData(function(userData) {
       callback(_.keys(userData.neverAsk));
    });
}

// Takes a hostname and a callback, and passes it a list of login
// objects the user has saved for that domain.
function getLoginsForSite(hostname,callback) {
    fetchStoredData(function(userData) {
        callback(userData.logins[hostname] || []);
    });
}

// Mainly for debugging purposes.
function deleteLoginsForSite(hostname) {
    fetchStoredData(function(userData) {
        delete userData[hostname];
        updateStoredData(userData);
    });
}

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

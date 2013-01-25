// NOTE: This file is not being included for now

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

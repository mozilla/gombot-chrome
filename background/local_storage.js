/*
*   local_storage.js
*
*
*   Handles persisting user data via localStorage.
*
*/

// This handles the low-level localStorage
// TODO: handle errors
var LocalStorage = function() {
  var ChromeLocalStorage = {
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
  };

  var FirefoxLocalStorage = function() {
    var ss = require("simple-storage");
    var timers = require("timers");

    // this module uses setTimeouts to roughly simulate the async interface in chrome
    return {
      getItem: function(key, callback) {
        timers.setTimeout(function() {
          callback(ss.storage[key]);
        }, 0);
      },
      setItem: function(key, data, callback) {
        ss.storage[key] = data;
        if (callback) timers.setTimeout(callback,0);
      },
      removeItem: function(key, callback) {
        delete ss.storage[key];
        if (callback) timers.setTimeout(callback,0);
      }
    };
  };

  if (typeof chrome !== "undefined") {
    return ChromeLocalStorage;
  }
  else if (typeof require === "function") {
    return FirefoxLocalStorage();
  }
  else {
    throw "Can't initialize LocalStorage. Can't find 'chrome' or 'require'.";
  }
};

if (typeof module != 'undefined' && module.exports) {
  module.exports = LocalStorage;
}

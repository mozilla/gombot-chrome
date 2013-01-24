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
      timers.setTimeout(callback,0);
    },
    removeItem: function(key, callback) {
      delete ss.storage[key];
      timers.setTimeout(callback, 0);
    }
  }
};

module.exports = FirefoxLocalStorage;
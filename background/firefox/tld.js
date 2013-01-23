var {Cc, Ci} = require("chrome");

var eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);

var Tld = {
  getDomain: function(domain) {
    return eTLDService.getBaseDomainFromHost(domain);
  }
}

module.exports = Tld;
var {Cc, Ci} = require("chrome");

var eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);

var Tld = {
  getDomain: function(domain) {
    try {
      return eTLDService.getBaseDomainFromHost(domain);
    } catch(e) {
      return domain;
    }
  }
}

module.exports = Tld;
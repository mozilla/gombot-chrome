var TldService = function(Tld, Uri) {

  var ipAddressRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;

  function isIpAddress(domain) {
    var uri = new Uri(domain),
        host = uri.host();
    return ipAddressRegex.test(host);
  }

  function getDomain(domain) {
    var uri = new Uri(domain),
        host = uri.host(),
        port = uri.port(),
        result = "";
    if (ipAddressRegex.test(host)) {
      result = host;
    } else {
      result = Tld.getDomain(host) || host;
    }
    if (port) {
      result += ":"+port;
    }
    return result;
  }

  function getFullHostnameWithPort(domain) {
    var uri = new Uri(domain),
        host = uri.host(),
        port = uri.port(),
        result = host;
    if (port) {
      result += ":"+port;
    }
    return result;
  }

  return {
    getDomain: getDomain,
    isIpAddress: isIpAddress,
    getFullHostnameWithPort: getFullHostnameWithPort
  };
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = TldService;
}
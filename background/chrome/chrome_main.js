var Gombot;

(function() {
	var importedModules = {
  	Messaging: ChromeMessaging,
    LocalStorage: ChromeLocalStorage
  };
  Gombot = _Gombot(importedModules); // create global namespace, for Chrome
})();
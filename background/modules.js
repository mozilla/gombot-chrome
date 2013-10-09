/** Load all Gombot modules **/

var GombotModules = {
  Backbone: require("./lib/backbone"),
  _ : require("./lib/underscore"),
  Messaging: require("./messaging"),
  LocalStorage: require("./local_storage"),
  Tld: require("./lib/tld.js"),
  Uri: require("./lib/jsuri"),
  TldService: require("./tld_service"),
  SiteConfigs: require("./site_configs"),
  Realms: require("./realms"),
  LocalSync: require("./sync/local_sync"),
  //GombotClient: require("./client/client"),
  //GombotSync: require("./gombot_sync"),
  LoginCredential: require("./models/login_credential"),
  LoginCredentialCollection: require("./collections/login_credential_collection"),
  CapturedCredentialStorage: require("./captured_credential_storage"),
  Linker: require("./linker"),
  CommandHandler: require("./command_handler"),
  User: require("./models/user"),
  UserCollection: require("./collections/user_collection"),
  AccountManager: require("./account_manager"),
  Pages: require("./pages"),
  GombotCrypto: require("./client/crypto"),
  SyncAdapter: require("./sync/sync_adapter"),
  Q: require("./lib/q.js")
};

module.exports = GombotModules;
var GombotTest;
var SH;
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

mocha.setup('bdd');

// TODO: put some teardown code here to remove usersTest store, etc
GombotTest = chrome.extension.getBackgroundPage()._Gombot();
SH = SpecHelpers(GombotTest);
GombotTest.init({ firebaseStoreName: SH.FIREBASE_STORE_NAME, storeName: SH.LOCAL_STORAGE_STORE_NAME, callback: go, testing: true });

function go() {
  mocha.run();
}





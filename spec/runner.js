var GombotTest;
var SH;
var should = chai.should();
var assert = chai.assert;

mocha.setup('bdd');

// TODO: put some teardown code here to remove usersTest store, etc
GombotTest = chrome.extension.getBackgroundPage()._Gombot();
GombotTest.init({ storeName: "usersTest", callback: go, testing: true });
SH = SpecHelpers(GombotTest);

function go() {
 mocha.run();
}





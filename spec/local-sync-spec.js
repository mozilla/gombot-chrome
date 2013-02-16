describe("Local sync", function() {
  this.timeout(20000);
  runUserSpec('localStorage');
});

describe("Firebase sync", function() {
  this.timeout(20000);
  runUserSpec('firebase');
});
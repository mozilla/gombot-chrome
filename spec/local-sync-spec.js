describe("Local sync", function() {
  this.timeout(20000);
  runUserSpec();
});


// exports.testCreateThenFetch = function(test) {
//   init(function() {
//     createUser({
//       callback: function(user) {
//         var u = new Gombot.User({ id: user.id, email: user.get("email") });
//         u.fetch({
//           password: TEST_PASSWORD,
//           success: function() {
//             test.pass();
//             test.done();
//           },
//           error: function(err) {
//             console.log("error:", err);
//             test.fail();
//             test.done();
//           }
//         });
//       },
//       password: TEST_PASSWORD
//     });
//   });
//   test.waitUntilDone();
// };

// exports.testUpdateThenFetch = function(test) {
//   test.pass();
//   test.done();
// };

// exports.testCreateThenDestroy = function(test) {
//   test.pass();
//   test.done();
// };



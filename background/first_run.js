/*
*   first_run.js
*
*
*   Starts the first run/signup flow, and communicates with it from chrome code.
*
*/

function startFirstRunFlow(signInPage) {
  // Show the splash screen in a new tab. Should point the user to click
  // on the browserAction.
  var pageName = signInPage ? 'sign_in' : 'create_account';
	showPage('../data/pages/first_run/' + pageName + '.html');
}

function showPage(url) {
	chrome.tabs.create({
    url: url
	});
}
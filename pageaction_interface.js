function getActiveTab(callback) {
    // Taken from: http://code.google.com/p/pgn4web/issues/detail?id=110
    chrome.windows.getCurrent(function(win) { 
        chrome.tabs.query({
            'windowId': win.id,
            'active': true
        }, 
        function(tabArray) { 
            callback(tabArray[0]);
         } ); 
     });
}

// This is called when the user has PIN authenticated in the browser action
// popup. Fills in the forms on the current page.
function formFillCurrentTab() {
    getActiveTab(function(tab) {
        var tabID = tab.id;
        getPageDataForPopup(function (logins) {
            // TODO: Find out how to present a user with a choice if they have
            // more than one login saved for the current domain.
            chrome.tabs.sendMessage(tabID,{
                type: 'fill_form',
                login: logins[0]
            });
        }); 
    });
}

function getPageDataForPopup(callback) {
    getActiveTab(function(tab) {
        var newURL = new Uri(tab.url); 
        getLoginsForSite(newURL.host(),function(logins) {
            // if (logins.length == 0) return;
            callback(logins);
        }); 
    });
}

chrome.tabs.onUpdated.addListener(function(tabID,changeInfo) {
    console.log('tab onupdated!');
    if (changeInfo.url) {
        // TODO: Remove all current notifications for this tab.        
        var newURL = new Uri(changeInfo.url);
        getLoginsForSite(newURL.host(), function(logins) {
            console.log('Found ', logins.length, " logins for ", newURL.host());
            // console.log(newURL.host(),' is the newest domain on tab ',tabID);
            if (logins.length > 0) {
                console.log('calling show for tab ', tabID, ' on url ', changeInfo.url);
                chrome.pageAction.show(tabID);
            }
        });
    }
});
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

function getPageDataForPopup(callback) {
    getActiveTab(function(tab) {
        var newURL = new Uri(tab.url); 
        getLoginsForSite(newURL.host(),function(logins) {
            // if (logins.length == 0) return;
            callback(logins);
        }); 
    });
}

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo) {
    console.log('tab onupdated!');
    if (changeInfo.url) {
        var newURL = new Uri(changeInfo.url);
        getLoginsForSite(newURL.host(), function(logins) {
            console.log('Found ', logins.length, " logins for ", newURL.host());
            // console.log(newURL.host(),' is the newest domain on tab ',tabId);
            if (logins.length > 0) {
                console.log('calling show for tab ', tabId, ' on url ', changeInfo.url);
                chrome.pageAction.show(tabId);
            }
        });
    }
});

function getCurrentTabInfo() {
    
}
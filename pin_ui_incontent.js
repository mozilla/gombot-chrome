/*
*   pin_ui_incontent.js
*
*
*   Manages PIN entry in a iframe inside of web content. Currently not working, but
*   I'm keeping this code here until there's time to fix it.
*
*/

function promptUserForPINInContent(tabID,prompt,repeat,callback) {
        // chrome.tabs.executeScript(tab.id, {file: "data/auth_content_script.js"});
        var iframeURL = chrome.extension.getURL("data/pin_entry.html");
        console.log('doing incontent PIN, injecting iframe with url ', iframeURL);
        console.log("document.body.innerHTML = '<iframe src=\"" + iframeURL + "\"></iframe>'");
        // FIXME: Use iframeURL below
        chrome.tabs.executeScript(tabID,
            {
                code: "(function() {  \
                    var newElem = document.createElement('iframe'); \
                    newElem.src='chrome-extension://hmgdlhadlhilnlbbfcbemdjaongiihfg/data/pin_entry.html'; \
                    document.body.appendChild(newElem); \
                    newElem.addEventListener('message',function(e) { \
                        alert('Received ' + JSON.stringify(e.data)); \
                    }); \
                    chrome.extension.onMessage.addListener(function(msg) { \
                        console.log('got message! ', msg); \
                        if (msg.type == 'content_pin_msg') { \
                            console.log('newElem = ', newElem); \
                            newElem.contentDocument.querySelector('body').innerHTML = 'a test message.'; \
                        } \
                    }); \
                })()" 
            }
        );
        
        chrome.tabs.sendMessage(tabID, {
            type: 'content_pin_msg',
            data: {
                type: 'set_prompt',
                prompt: prompt,
                repeat: repeat
            }
        });
}
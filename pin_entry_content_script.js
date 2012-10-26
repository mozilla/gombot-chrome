chrome.extension.onMessage.addListener(function(msg) {
    console.log('got message of type ',msg.type,msg);
});
console.log('pin_entry_content_script!');
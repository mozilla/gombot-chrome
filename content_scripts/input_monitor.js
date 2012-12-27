// ConditionMonitor creates objects that monitor the DOM for added input objects,
// and calls a callback function when new inputs are added to the DOM.
// Public functions:
//    start: starts the monitor
//    stop: stops the monitor
var InputMonitor = function(MutationObserver) {

    function mutationContainsAddedInput(mutation) {
       var addedNodes = Array.prototype.slice.call(mutation.addedNodes),
           addedNodesLength = addedNodes.length,
           i;

        if (addedNodesLength === 0) {
            return false;
        }
        for (i=0; i<addedNodesLength; i++) {
            if (addedNodes[i].querySelectorAll &&
                addedNodes[i].querySelectorAll("input").length > 0) {
                return true;
            }
        }
        return false;
    }

    var InputMonitor = function(callbackFunc) {
        this.callback = callbackFunc || function() {};
        // create an observer instance
        this.observer = new MutationObserver((function(mutations) {
            var mutationsLength = mutations.length, i;
            for (i=0; i<mutationsLength; i++) {
                if (mutationContainsAddedInput(mutations[i])) {
                    this.callback();
                    return;
                }
            }
        }).bind(this));
    };

    InputMonitor.prototype.start = function() {
        this.observer.observe(document, { childList: true, subtree: true })
    };

    InputMonitor.prototype.stop = function() {
        this.observer.disconnect();
    };

    return InputMonitor;
};

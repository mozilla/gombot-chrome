// ConditionMonitor creates objects that monitors a condition function
// via polling. When the condition function returns true, the ConditionMonitor
// will execute the callback.
// Public functions:
//    start: starts the monitor
//    stop: stops the monitor

var ConditionMonitor = (function() {
    const DEFAULT_MONITOR_INTERVAL_LENGTH = 1000;

    var ConditionMonitor = function(conditionFunc, callbackFunc, intervalLength) {
        this.condition = conditionFunc || function() { return false; };
        this.callback = callbackFunc || function() {};
        this.monitorInterval = null;
        this.monitorIntervalLength = intervalLength || DEFAULT_MONITOR_INTERVAL_LENGTH;
    };

    function testCondition() {
        if (this.condition()) {
            this.callback();
        }
    }

    ConditionMonitor.prototype.start = function() {
        testCondition.call(this);
        this.monitorInterval = setInterval(testCondition.bind(this), this.monitorIntervalLength);
    };

    ConditionMonitor.prototype.stop = function() {
        clearInterval(this.monitorInterval);
    };

    return ConditionMonitor;
})();

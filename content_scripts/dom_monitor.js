var DomMonitor = function($, MutationObserver) {

	var mutationObserver = null;

	var subscribers = {
		addedNodes: [],
		isRemoved: []
	};

	function visitSubscribersForNodes(subscriberList, nodes) {
		var $node;
		if (subscriberList.length === 0) return;
		nodes.forEach(function(node) {
			$node = $(node);
			subscriberList.forEach(function(subscriber) {
				if (subscriber.arg) {
					if ($node.is(subscriber.arg) || $node.has(subscriber.arg).length > 0) {
						subscriber.notify = true;
					}
				} else {
					subscriber.notify = true;
				}
			});
		});
	}

	function notifySubscribers() {
		var notifyList = [];
		var types = Object.keys(subscribers);
		types.forEach(function(type) {
			subscribers[type].forEach(function(subscriber) {
				if (subscriber.notify) {
					notifyList.push(subscriber);
				}
			});
		});
		notifyList.forEach(function(subscriber) {
			delete subscriber.notify;
			subscriber.callback(self);
		});
	}

	function mutationObserverCallback(mutations) {
		mutations.forEach(function(mutation) {
			var removedNodes = Array.prototype.slice.call(mutation.removedNodes || []),
			    addedNodes = Array.prototype.slice.call(mutation.addedNodes || []);
			if (mutation.type === "childList") {
				visitSubscribersForNodes(subscribers.isRemoved, removedNodes);
				visitSubscribersForNodes(subscribers.addedNodes, addedNodes);
			}
		}, this);
		notifySubscribers();
	}

	function addSubscriber() {
		var args = Array.prototype.slice.call(arguments),
		    type = args.shift(),
		    id = args.shift(),
		    obj = {};
		if (subscribers[type]) {
			obj.id = id;
			if (args.length == 2) {
				obj.arg = args[0];
				obj.callback = args[1];
			} else if (args.length == 1) {
				obj.callback = args[0];
			}
			subscribers[type].push(obj);
		} else {
			console.log("DomMonitor: unknown type given to on:", type);
		}
	}

	// addedNodes([cssFilter,] callback)
	//   cssFilter: optional css expression to filter addedNodes
	//   callback: function
	// isRemoved(element, callback)
	//   element: DOM element
	//   callback: function
	function on() {
		var args = Array.prototype.slice.call(arguments),
		    type = args.shift(),
		    a = type.split("."),
		    id = null;
		if (a.length > 1) {
			type = a.shift();
			id = a.join(".");
		}
		args.unshift(id);
		args.unshift(type);
		addSubscriber.apply(null, args);
	}

	function off() {
		var args = Array.prototype.slice.call(arguments),
		    type = args.shift(),
		    a = type.split("."),
		    callback = args.shift(),
		    id = null,
		    subs = null,
		    subsLength;
		if (a.length > 1) {
			type = a.shift();
			id = a.join(".");
		}
		subs = subscribers[type];
		if (!subs) {
			console.log("DomMonitor.off illegal type", type);
			return;
		}
		length = subs.length;
		for (var i=0; i<length; i++) {
			if (id && subs[i].id === id ||
					callback && subs[i].callback === callback) {
				console.log("DomMonitor.off successfully removed subscriber", subs[i]);
				subs.splice(i,1);
				return;
			}
		}
	}

	function start() {
	  this.mutationObserver = new MutationObserver(mutationObserverCallback);
	  this.mutationObserver.observe(document, { childList: true, subtree: true });
	}

	function stop() {
		this.mutationObserver.disconnect();
	}

	var self = {
		start: start,
		stop: stop,
		on: on,
		off: off
	};
	return self;
};
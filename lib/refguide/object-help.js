(function (global) {
	global.GIDGET = global.GIDGET || {};

	var helpByName = {
		gidget: {
			title: 'Gidget',
			summary: 'This is Gidget. Hovering or selecting him shows the current memory state.'
		},
		rock: {
			title: 'Rock',
			summary: 'Rocks block movement. They can be scanned, but they are obstacles, not cargo.'
		},
		goop: {
			title: 'Goop',
			summary: 'Goop is the cleanup target. Grab it and bring it to a bucket.'
		},
		bucket: {
			title: 'Bucket',
			summary: 'Buckets hold goop. Drop goop here to satisfy the level goal.'
		},
		button: {
			title: 'Button',
			summary: 'Buttons are interactive objects used to trigger level-specific actions.'
		},
		crack: {
			title: 'Crack',
			summary: 'Cracks are dangerous terrain. Use avoid when planning a path around them.'
		},
		rat: {
			title: 'Rat',
			summary: 'Rats are moving obstacles. Avoid them when collecting goop.'
		}
	};

	var helpByCode = {
		scan: {
			title: 'scan',
			summary: 'Scan an object so Gidget can remember it and use it later.'
		},
		goto: {
			title: 'goto',
			summary: 'Move toward a target object, optionally avoiding another object.'
		},
		grab: {
			title: 'grab',
			summary: 'Grab an object so it moves with Gidget.'
		},
		drop: {
			title: 'drop',
			summary: 'Drop an object that Gidget is currently grabbing.'
		},
		analyze: {
			title: 'analyze',
			summary: 'Inspect an object to reveal its properties and actions.'
		},
		ask: {
			title: 'ask',
			summary: 'Ask an analyzed object to perform one of its actions.'
		},
		if: {
			title: 'if',
			summary: 'Only continue if the recent results match the condition.'
		},
		it: {
			title: 'it',
			summary: 'Refers to the current focused object.'
		},
		avoid: {
			title: 'avoid',
			summary: 'Keep this object out of the path when moving.'
		},
		to: {
			title: 'to',
			summary: 'Introduces the action to ask another object to perform.'
		},
		is: {
			title: 'is',
			summary: 'Tests whether an object has a property or tag.'
		},
		are: {
			title: 'are',
			summary: 'Tests whether several objects have a property or tag.'
		},
		on: {
			title: 'on',
			summary: 'Used when an action targets something already in place.'
		}
	};

	function fallbackTitle(name) {
		return 'This is a ' + name + '.';
	}

	function fallbackSummary(name) {
		return 'I can tell this is a ' + name + ', but I do not have a special help entry for it yet.';
	}

	global.GIDGET.objectHelp = {
		getTitle: function (name) {
			var entry = helpByName[String(name).toLowerCase()];
			return entry ? entry.title : fallbackTitle(name);
		},

		getSummary: function (name) {
			var entry = helpByName[String(name).toLowerCase()];
			return entry ? entry.summary : fallbackSummary(name);
		},

		getCodeTitle: function (name) {
			var entry = helpByCode[String(name).toLowerCase()];
			return entry ? entry.title : fallbackTitle(name);
		},

		getCodeSummary: function (name) {
			var entry = helpByCode[String(name).toLowerCase()];
			return entry ? entry.summary : fallbackSummary(name);
		}
	};
}(window));

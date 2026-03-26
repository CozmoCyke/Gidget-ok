(function (global) {
	global.GIDGET = global.GIDGET || {};

	var helpByName = {
	gidget: {
			title: 'Gidget',
			summary: 'This is Gidget, the robot. Hovering or selecting it shows the robot\'s current state and memory.'
		},
		rock: {
			title: 'Rock',
			summary: 'Rocks block the robot\'s path. The robot can scan them, but it cannot carry them.'
		},
		goop: {
			title: 'Goop',
			summary: 'Goop is the cleanup target. The robot can grab it and carry it to a bucket.'
		},
		bucket: {
			title: 'Bucket',
			summary: 'Buckets collect goop. Drop goop here to finish the goal.'
		},
		button: {
			title: 'Button',
			summary: 'Buttons are interactive objects that can trigger level actions.'
		},
		crack: {
			title: 'Crack',
			summary: 'Cracks are dangerous terrain. Use avoid to keep the robot around them.'
		},
		rat: {
			title: 'Rat',
			summary: 'Rats move around the level. Keep the robot away from them while collecting goop.'
		}
	};

	var helpByCode = {
		scan: {
			title: 'scan',
			summary: 'Let the robot remember an object for later.'
		},
		goto: {
			title: 'goto',
			summary: 'Move the robot toward the selected target.'
		},
		grab: {
			title: 'grab',
			summary: 'Let the robot carry the selected object.'
		},
		drop: {
			title: 'drop',
			summary: 'Release the object the robot is carrying.'
		},
		analyze: {
			title: 'analyze',
			summary: 'Inspect an object so the robot can use its properties.'
		},
		ask: {
			title: 'ask',
			summary: 'Tell the robot to ask an analyzed object to act.'
		},
		if: {
			title: 'if',
			summary: 'Only continue when the robot\'s condition is true.'
		},
		it: {
			title: 'it',
			summary: 'Refers to the current object in focus.'
		},
		avoid: {
			title: 'avoid',
			summary: 'Keep this object out of the robot\'s path.'
		},
		to: {
			title: 'to',
			summary: 'Introduce the target object for the action.'
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

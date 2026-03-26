(function (global) {
	global.GIDGET = global.GIDGET || {};

	var helpByName = {
	gidget: {
			title: 'Gidget',
			summary: 'This is Gidget, the robot. Hovering or selecting it shows the robot\'s current state, memory, and energy.'
		},
		rock: {
			title: 'Rock',
			summary: 'Rocks block the robot\'s path. The robot can scan them, but it cannot carry or drop them.'
		},
		goop: {
			title: 'Goop',
			summary: 'Goop is the cleanup target. The robot can grab it and carry it to a bucket to finish the job.'
		},
		bucket: {
			title: 'Bucket',
			summary: 'Buckets collect goop. Drop goop here when the robot needs to complete the goal.'
		},
		button: {
			title: 'Button',
			summary: 'Buttons are interactive objects that can trigger a level action when the robot uses them.'
		},
		crack: {
			title: 'Crack',
			summary: 'Cracks are dangerous terrain. Use avoid to keep the robot away from them.'
		},
		rat: {
			title: 'Rat',
			summary: 'Rats move around the level. Keep the robot away from them while it collects goop.'
		}
	};

	var helpByCode = {
		scan: {
			title: 'scan',
			summary: 'Let the robot remember an object for later use.'
		},
		goto: {
			title: 'goto',
			summary: 'Move the robot toward the selected target.'
		},
		grab: {
			title: 'grab',
			summary: 'Pick up the selected object so the robot can carry it.'
		},
		drop: {
			title: 'drop',
			summary: 'Put down the object the robot is carrying.'
		},
		analyze: {
			title: 'analyze',
			summary: 'Inspect an object so the robot can read its properties and actions.'
		},
		ask: {
			title: 'ask',
			summary: 'Ask an analyzed object to perform one of its actions.'
		},
		if: {
			title: 'if',
			summary: 'Only continue when the test is true.'
		},
		it: {
			title: 'it',
			summary: 'Refers to the current object or value in focus.'
		},
		avoid: {
			title: 'avoid',
			summary: 'Keep the robot away from this object while moving.'
		},
		to: {
			title: 'to',
			summary: 'Points to the target of the action.'
		},
		is: {
			title: 'is',
			summary: 'Checks whether an object has a property or tag.'
		},
		are: {
			title: 'are',
			summary: 'Checks whether several objects have a property or tag.'
		},
		on: {
			title: 'on',
			summary: 'Shows what the action works on.'
		}
	};

	function fallbackTitle(name) {
		return 'This is a ' + name + '.';
	}

	function fallbackSummary(name) {
		return 'I can tell this is a ' + name + ', but I do not have a local help card for it yet.';
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

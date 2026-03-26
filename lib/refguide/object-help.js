(function (global) {
	global.GIDGET = global.GIDGET || {};

	var helpByName = {
	gidget: {
			title: 'Gidget',
			summary: 'This is Gidget, the robot. Hovering or selecting it shows the robot\'s current state, memory, and energy.'
		},
		rock: {
			title: 'Rock',
			summary: 'Rocks block movement. The robot can scan them, but they stay in the way and cannot be carried.'
		},
		goop: {
			title: 'Goop',
			summary: 'Goop is the cleanup target. The robot usually needs to pick it up and drop it in a bucket.'
		},
		bucket: {
			title: 'Bucket',
			summary: 'Buckets are the place to drop goop after the robot picks it up.'
		},
		button: {
			title: 'Button',
			summary: 'Buttons usually trigger a level action when the robot touches or uses them.'
		},
		crack: {
			title: 'Crack',
			summary: 'Cracks are hazards. Keep the robot from stepping onto them.'
		},
		rat: {
			title: 'Rat',
			summary: 'Rats move around the level and can block the robot\'s path. Avoid them while planning a route.'
		}
	};

	var helpByCode = {
		scan: {
			title: 'scan',
			summary: 'Let the robot notice and remember an object for later steps.'
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
			summary: 'Read an object\'s properties so the robot can use what it learned.'
		},
		ask: {
			title: 'ask',
			summary: 'After analyze, ask the object to run one of its actions.'
		},
		if: {
			title: 'if',
			summary: 'Only continue when the test matches what the robot needs right now.'
		},
		it: {
			title: 'it',
			summary: 'Refers to the current object or value in focus.'
		},
		avoid: {
			title: 'avoid',
			summary: 'Tell the robot to route around this object instead of stepping into it.'
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

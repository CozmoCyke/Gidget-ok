/**
 * @class
 * The main IdeaGarden class.
 * @singleton
 *
 * The architecture in this file follows Figure 8.3 in Cao 2013.
 * Jill Cao, _Helping End-User Programmers Help Themselves - The Idea Garden Approach_.
 * Ph.D Thesis, Oregon State University, May 2013.
 */
if (typeof GIDGET !== "undefined") {
	GIDGET.ui = GIDGET.ui || {};
	if (typeof GIDGET.ui.helpCounter === "undefined") {
		GIDGET.ui.helpCounter = { tooltip: 0, refguide: 0 };
	}
	if (typeof GIDGET.ui.logEvent !== "function") {
		GIDGET.ui.logEvent = function() {};
	}
}

function ensureLocalHelpTooltip() {
	var $tooltip = $("#local-help-tooltip");
	if ($tooltip.length === 0) {
		$tooltip = $("<div>", {
			id: "local-help-tooltip",
			"class": "local-help-tooltip"
		}).appendTo("body");
	}
	return $tooltip;
}

function showLocalHelpTooltip(target, html) {
	var $tooltip = ensureLocalHelpTooltip();
	$tooltip.html(html);

	var rect = target.getBoundingClientRect();
	var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
	var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
	var left = scrollLeft + rect.left;
	var top = scrollTop + rect.bottom + 12;
	var maxLeft = scrollLeft + window.innerWidth - $tooltip.outerWidth() - 12;
	if (left > maxLeft) {
		left = Math.max(12 + scrollLeft, maxLeft);
	}

	$tooltip.css({
		left: left,
		top: top
	}).show();
}

function hideLocalHelpTooltip() {
	$("#local-help-tooltip").hide();
}

var IdeaGarden = (function($) {
	var o = $({}); // JQuery
	var exports = {};

	exports.actioner = {};
	exports.listener = {};
	exports.processor = {};

	// Help associated with tokens
	exports.tokensHelpData = {
		storage: {},
		setData: function(index, data) {
			this.storage[index] = data;
		},
		getTokenNumber: function(tokenId) {
			if (tokenId.indexOf('.') >= 0) {
				var values = tokenId.split('.');
				return parseInt(values[2], 10);
			} else {
				var tokenNumber = tokenId.replace("sourceToken", "");
				return parseInt(tokenNumber, 10);
			}
		},
		getDataFromElementId: function(characterClass) {
			var index = this.getTokenNumber(characterClass);
			return this.getData(index);
		},
		getData: function(index) {
			return this.storage[index];
		},
		clear: function() {
			this.storage = {};
		}
	};

	exports.getCode = function($mouseoverElement) {
		if ($mouseoverElement.parent().parent('#code').length > 0) {
			return $('#code');
		} else {
			return $mouseoverElement.parents('.codeContainer');
		}
	};

	// Add the events here.
	exports.abstractEvent = {
		assert: "assertion",
		for: "for",
		if: "if",
		condition: "condition",
		list: "list",
		variable: "variable",
		iteratorvariable: "iteratorVariable",
		object: "object",
		function: "function",
		when: "when"
	};

	// Add the actions here.
	exports.abstractAction = {
		assertion: "showAssertionSuggestion",
		iteration: "showIterationSuggestion",
		if: "showIfSuggestion",
		condition: "showConditionSuggestion",
		list: "showList",
		variable: "showVariable",
		iteratorvariable: "showIteratorVariable",
		object: "showObject",
		function: "function",
		when: "when"
	};

	function replaceLastChar(str, ending) {
		var index = str.length - 1;
		return str.substr(0, index) + ending + str.substr(index + ending.length);
	}

	exports.pluralize = function(noun) {
		var ret;
		if (noun.slice(-1) === 'y') {
			ret = replaceLastChar(noun, 'ies');
		} else if (noun.slice(-1) === 's') {
			ret = replaceLastChar(noun, 'ses');
		} else {
			ret = noun + 's';
		}

		return ret;
	};

	// Maps hintTopic IDs to the Display text
	var buttonCommand = {};

	exports.remapButtonCommandText = function(keyword) {
		var buttonCommandText = buttonCommand[keyword];
		if (typeof buttonCommandText === 'undefined') {
			buttonCommandText = keyword;
		}
		return buttonCommandText;
	};

	exports.button = function(topic) {
		if (topic !== null && typeof topic !== 'undefined') {
			var igContent = $("<div>").attr('class', 'ideagarden ideagarden-' + topic)
			.append($("<button>").attr("class", "ideagarden-" + topic + "-call")
				.button({
					text: true,
					label: "Give me a hint about \"" + exports.pluralize(exports.remapButtonCommandText(topic)) + "\""
				}));
			return $(igContent)[0].outerHTML;
		} else {
			return "";
		}
	};
	
	// logs when IG icon appears in dictionary tooltips
	exports.tooltipUnstuckarator = function(topic) {
		if (topic !== null && typeof topic !== 'undefined' && (topic === "for"||topic === "if"||topic === "ensure"||topic === "object"||topic === "function"||topic === "create"||topic === "when"||topic === "list"||topic === "plural")) {
			if (topic === "create"||topic === "object"){topic = "igobject";}
			else if (topic === "list"||topic === "plural"){topic = "list";}
			else if (topic === "for"){topic = "repeat";}
			else if (topic === "ensure"){topic = "assertion";}
			GIDGET.ui.logEvent("IdeaGarden-unstuckerator", {
				event: "displayed-in-tooltip",
				topic: topic
			});
			return true;
		} else {return false;}
	};

	function matchFunctionCall(sourceLine) {
		return (/(.*(\s)*)+\(/).test(sourceLine);
	}

	function matchPlural(activeToken) {
		return (/\/\w+\/s/.test(activeToken));
	}

	/**
	* Gets a hint topic from the given source code line.
	* Naively searches for the first instance of a programming language keyword.
	*/
	exports.getHintTopicFromLine = function(sourceLine, activeToken) {
		var hintTopic;
		if (typeof activeToken === 'undefined') { activeToken = ''; }

		if (matchPlural(activeToken)) {
			hintTopic = exports.abstractEvent.list;
		} else if (sourceLine.search('for') >= 0) {
			hintTopic = exports.abstractEvent.for;
		} else if (sourceLine.search('if') >= 0) {
			hintTopic = exports.abstractEvent.if;
		} else if (matchFunctionCall(sourceLine)) {
			hintTopic = exports.abstractEvent.function;
		} else {
			hintTopic = null;
		}

		return hintTopic;
	};

	/**
	* @method
	* Start listening on a particular namespace.
	*
	* This code is adapted from the "subscribe" method in
	* [Tiny Pub/Sub](https://github.com/cowboy/jquery-tiny-pubsub).
	*
	* Example Usage:
	* this.listen('IdeaGardenCode', IdeaGarden.processHostInfo('IdeaGardenCode'));
	*/
	exports.listen = function() {
		o.on.apply(o, arguments);
	};

	/**
	* @method
	* Stops listening on a particular namespace.
	*
	* This code is adapted from the "unsubscribe" method in
	* [Tiny Pub/Sub](https://github.com/cowboy/jquery-tiny-pubsub).
	*/
	exports.unlisten = function() {
		o.off.apply(o, arguments);
	};

	/**
	* @method
	* Used by the host to send information to the listeners.
	*
	* @param options
	* element: The page element where the tooltip is attached to
	* event: The Javascript event that triggers the Idea Garden
	* code: JQuery DOM of the Gidget code window
	* topic: The Idea Garden topic (one of 'for', 'list', 'function-or-object', or 'if')
	* line: The source line where the problem is
	* activeToken: The ID identifier of the token where the Unstuckerator appears next to
	*
	* This code is adapted from the "publish" method in
	* [Tiny Pub/Sub](https://github.com/cowboy/jquery-tiny-pubsub).
	*
	* Example Usage:
	* IdeaGarden.hostInfoToIdeaGarden('IdeaGardenCode', {code: programText})
	*/
	exports.hostInfoToIdeaGarden = function() {
		o.trigger.apply(o, arguments);
	};

	/**
	* Sets up listeners
	*/
	exports.create = function() {
		// Initialize the other Idea Garden modules
		exports.listener = IdeaGarden.Listener.create();
		exports.actioner = IdeaGarden.Actioner.create();
		// exports.processor = IdeaGarden.InformationProcessor();

		// Register our namespaces and hook them up to the listener.
		this.listen('IdeaGardenTooltip', exports.listener.processHostInfo('IdeaGardenTooltip'));
	};

	return exports;
}(jQuery));

/**
 * @class
 * Abstract base class to correspond with the IdeaGarden Architecture
 * from Jill's thesis.
 */
IdeaGarden.AbstractListener = (function() {
	var exports = {};
	exports.prototype = {};

	exports.prototype.init = function() {
	};

	exports.prototype.processHostInfo = function(name) {
		return function(_, context) {
			if (typeof context.code === 'undefined') {
				console.error("Idea Garden: code wasn't passed!");
			} else if (typeof context.topic === 'undefined') {
				console.error("Idea Garden: topic wasn't passed!");
			} else if (typeof context.element === 'undefined') {
				console.error("Idea Garden: element wasn't passed!");
			} else if (typeof context.event === 'undefined') {
				console.error("Idea Garden: event wasn't passed!");
			} else if (typeof context.line === 'undefined') {
				console.error("Idea Garden: line wasn't passed!");
			} else if (typeof context.activeToken === 'undefined') {
				console.error("Idea Garden: activeToken wasn't passed!");
			} else {
				IdeaGarden.Controller.onReceiveEvent(context);
			}
		};
	};

	exports.create = function() {
		var ret = Object.create(exports.prototype);
		ret.init();
		return ret;
	};

	return exports;

}());

/**
 * @class
 */
IdeaGarden.Listener = (function() {
	var exports = {};

	exports.prototype = Object.create(IdeaGarden.AbstractListener.prototype);

	exports.prototype.init = function() {
	};

	exports.prototype.processHostInfo = function(name) {
		// Skip the first argument (event object) but log the name and other args.
		return function(_, context) {

			if (name === 'IdeaGardenTooltip') {
				context.ideaGardenEvent = context.topic;
			}

			IdeaGarden.Controller.onReceiveEvent(context);
		};
	};

	exports.create = function() {
		var ret = Object.create(exports.prototype);
		ret.init();
		return ret;
	};

	return exports;
}(IdeaGarden.Listener || {}));



/**
 * @class
 *
 * To fix: This is supposed to be host-independent, but it depends on your suggestions.
 */
IdeaGarden.Controller = (function() {
	var exports = {};

	exports.contexts = [];

	// Define the mapping from events to actions here.
	exports.eventToAction = {};
	exports.eventToAction[IdeaGarden.abstractEvent.for.toString()] = IdeaGarden.abstractAction.iteration;
	exports.eventToAction['notUsingIterator'] = IdeaGarden.abstractAction.iteration;
	exports.eventToAction['pluralInsteadOfSingleton'] = IdeaGarden.abstractAction.iteration;
	exports.eventToAction['usingEnsure'] = IdeaGarden.abstractAction.assertion;
	exports.eventToAction[IdeaGarden.abstractEvent.assert.toString()] = IdeaGarden.abstractAction.assertion;
	exports.eventToAction[IdeaGarden.abstractEvent.if.toString()] = IdeaGarden.abstractAction.if;
	exports.eventToAction[IdeaGarden.abstractEvent.condition.toString()] = IdeaGarden.abstractAction.condition;
	exports.eventToAction[IdeaGarden.abstractEvent.list.toString()] = IdeaGarden.abstractAction.list;
	exports.eventToAction[IdeaGarden.abstractEvent.variable.toString()] = IdeaGarden.abstractAction.variable;
	exports.eventToAction[IdeaGarden.abstractEvent.iteratorvariable.toString()] = IdeaGarden.abstractAction.iteratorvariable;
	exports.eventToAction['createObjectWithoutDefinition'] = IdeaGarden.abstractAction.object;
	exports.eventToAction[IdeaGarden.abstractEvent.object.toString()] = IdeaGarden.abstractAction.object;
	exports.eventToAction['functionMissingDefOrCall'] = IdeaGarden.abstractAction.function;
	exports.eventToAction[IdeaGarden.abstractEvent.function.toString()] = IdeaGarden.abstractAction.function;
	exports.eventToAction[IdeaGarden.abstractEvent.when.toString()] = IdeaGarden.abstractAction.when;

	exports.onReceiveEvent = function(context) {
		context.action = exports.eventToAction[context.ideaGardenEvent];
		exports.contexts.push(context);

		if (typeof context.action !== 'undefined') {
			IdeaGarden.actioner.onReceiveAbstractAction(context);
		}
	};

	return exports;
}(IdeaGarden.Controller || {}));

/**
 * @class
 * Abstract base class to correspond with the IdeaGarden Architecture
 * from Jill's thesis.
 */
IdeaGarden.AbstractActioner = (function() {
	var exports = {};
	exports.prototype = {};

	exports.prototype.init = function() {
	};

	exports.prototype.onReceiveAbstractAction = function(context) {
	};

	exports.create = function() {
		var ret = Object.create(exports.prototype);
		ret.init();
		return ret;
	};

	return exports;

}());

/**
 * @class
 */
IdeaGarden.Actioner = (function() {
	var exports = {},
		defaultOutputElement = "#extensions",
		suggestion = {
			repeat: null,
			composition: null,
			gettingStarted: null
		},
		nextSuggestionDOM;

	exports.prototype = Object.create(IdeaGarden.AbstractActioner.prototype);

	exports.prototype.init = function() {

		// Initialize the feature's content here.
		suggestion.assertion = IdeaGardenSuggestion.Concrete.create("assertion");
		suggestion.repeat = IdeaGardenSuggestion.Concrete.create("repeat");
		suggestion.condition = IdeaGardenSuggestion.Concrete.create("condition");
		suggestion.if = IdeaGardenSuggestion.Concrete.create("if");
		suggestion.list = IdeaGardenSuggestion.Concrete.create("list");
		suggestion.variable = IdeaGardenSuggestion.Concrete.create("variable");
		suggestion.iteratorvariable = IdeaGardenSuggestion.Concrete.create("iteratorvariable");
		suggestion.object = IdeaGardenSuggestion.Concrete.create("object");
		suggestion.function = IdeaGardenSuggestion.Concrete.create("function");
		suggestion.when = IdeaGardenSuggestion.Concrete.create("when");
		
		initializeHandlers();
	};

	function initializeHandlers() {
		$(document).on('click', $('#ideagarden-expand-repeat'), function(event) {
			$('.ideagarden-more').show();
			$('.ideagarden-ellipses').hide();
		});
	}

	function createSuggestionDOM(context) {
		var contextFromQueue = IdeaGarden.Controller.contexts.pop();

		var tooltipDOM;

		// Add in the mapping from actions to content here.
		switch(contextFromQueue.action) {
			case IdeaGarden.abstractAction.assertion:
				tooltipDOM = suggestion.assertion.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.iteration:
				tooltipDOM = suggestion.repeat.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.condition:
				tooltipDOM = suggestion.condition.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.if:
				tooltipDOM = suggestion.if.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.list:
				tooltipDOM = suggestion.list.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.variable:
				tooltipDOM = suggestion.variable.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.iteratorvariable:
				tooltipDOM = suggestion.iteratorvariable.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.object:
				tooltipDOM = suggestion.object.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.function:
				tooltipDOM = suggestion.function.getSuggestion(contextFromQueue);
				break;
			case IdeaGarden.abstractAction.when:
				tooltipDOM = suggestion.when.getSuggestion(contextFromQueue);
				break;
			default:
				break;
		}

		return tooltipDOM;
	}

	function registerTooltipButton(context) {

		var igSelector = '.' + 'ideagarden-' + context.topic;
		var igButton = '.' + 'ideagarden-' + context.topic + '-call';

		$(igButton).on("click", function() {
			$(igSelector).html(nextSuggestionDOM).addClass('ideagarden-tooltip-suggestion');
			$(igSelector).prepend('<h2>here\'s a hint about "' + IdeaGarden.pluralize(IdeaGarden.remapButtonCommandText(context.topic)) + '"...</h2>');
		});
	}

	exports.tooltip = function(context) {
		if (typeof $.fn.qtip !== 'function') {
			if (context.event && context.event.type === 'mouseleave') {
				hideLocalHelpTooltip();
				return;
			}

			var localContent = createSuggestionDOM(context);
			var localHtml = $('<div>').html(localContent.addClass('ideagarden-tooltip-suggestion')).html();
			showLocalHelpTooltip(context.element, localHtml);
			return;
		}

		var $ideaGardenContent = createSuggestionDOM(context);
		var contents = $('<div>').html($ideaGardenContent.addClass('ideagarden-tooltip-suggestion'));

		var position = {
			viewport: $(window)
		};

		if (typeof context.position !== 'undefined') {
			position = context.position;
		}

		$(context.element).qtip({
			overwrite: false,
			content: {
				text: contents.html(),
				title: {
					text: "drag to reposition",
					button: 'Close'
				}
			},
			position: position,
			show: {
				event: context.event.type,
				ready: true,
				solo: false,
				delay: 500
			},
			hide: {
				event: 'mouseleave',
				delay: 400,
				fixed: true
			},
			style: {
				classes: 'draggable-tooltip ideagarden-tooltip qtip-shadow qtip-light referenceQtipContainer'
			},
			events: {
				show: function(event, api) {
					var thisQTipID = $(this).attr('id');
					$("#" + thisQTipID + ' .ideagarden-more').hide();
					$("#" + thisQTipID + ' .ideagarden-ellipses').show();

					if (typeof $.fn.draggable === 'function') {
						$(this).draggable({
							containment: 'window',
							handle: api.elements.titlebar,
							start: function(event, ui) {
								GIDGET.ui.logEvent("IdeaGarden-tooltip", {
									event: event.type,
									id: $(this).attr("id"),
									topic: context.ideaGardenEvent,
									action: context.action
								});
							},
							stop: function(event, ui) {
								GIDGET.ui.logEvent("IdeaGarden-tooltip", {
									event: event.type,
									id: $(this).attr("id"),
									topic: context.ideaGardenEvent,
									action: context.action
								});
							},
							drag: function(event, ui) {
								api.set('hide.event', false);
							}
						});
					}

					// Increase tooltip counter
					GIDGET.ui.helpCounter['tooltip']++;
					GIDGET.ui.logEvent("IdeaGarden-tooltip", {
						event: event.type,
						id: $(this).attr("id"),
						topic: context.ideaGardenEvent,
						action: context.action
					});
				},
				hide: function(event, api) {
					GIDGET.ui.logEvent("IdeaGarden-tooltip", {
						event: event.type,
						id: $(this).attr("id"),
						topic: context.ideaGardenEvent,
						action: context.action
					});

					$('.ideagarden-more').hide();
					$('.ideagarden-ellipses').show();
				},
				visible: function(event, api) {
					// Later move IG stuff into here
				}
			}
		});
	};

	/**
	* @override
	*/
	exports.prototype.onReceiveAbstractAction = function(context) {
		exports.tooltip(context);
	};

	/**
	* @override
	*/
	exports.create = function() {
		var ret = Object.create(exports.prototype);
		ret.init();
		return ret;
	};

	return exports;

}(IdeaGarden.Actioner || {}));

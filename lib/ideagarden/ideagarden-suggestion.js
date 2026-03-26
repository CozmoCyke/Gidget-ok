var IdeaGardenSuggestion = {};

function createStaticSuggestionDOM(identifier) {
	var introText = {
		assertion: "Check the condition you are asserting.",
		repeat: "Use the right list and iterator for the loop.",
		condition: "Make the condition explicit and complete.",
		if: "Verify the if condition matches what you want.",
		list: "Confirm you are referring to the intended list.",
		variable: "Use the variable name that matches the code.",
		iteratorvariable: "Pick a clearer iterator name for the loop.",
		object: "Make sure the object name matches the target.",
		function: "Check the function name or its definition.",
		when: "Confirm the trigger happens at the right moment."
	};

	var text = introText.hasOwnProperty(identifier) ? introText[identifier] : "Check the code around this hint.";
	return $('<div>', { 'class': 'ideagarden-tooltip-suggestion' })
		.append($('<span>', {
			'class': 'ideagarden-heading',
			"text": "Here's a hint..."
		}))
		.append($('<p>').text(text));
}

/**
 * @class
 */
IdeaGardenSuggestion.AbstractSuggestion = (function() {
	var exports = {};
	exports.prototype = {};
	exports.prototype.init = function() {
		this.identifier = "Abstract";
	};

	exports.prototype.getId = function() {
		return this.identifier;
	};

	exports.prototype.create = function(identifier) {
		var ret = Object.create(exports.prototype);
		ret.init();
		return ret;
	};

	return exports;
}());

/**
 * @class
 */
IdeaGardenSuggestion.Concrete = (function() {
	var exports = {};

	exports.prototype = Object.create(IdeaGardenSuggestion.AbstractSuggestion.prototype);

	exports.prototype.init = function(identifier) {
		IdeaGardenSuggestion.AbstractSuggestion.prototype.init.apply(this, [identifier]);
		this.identifier = identifier;
		this.dataFile = "lib/ideagarden/" + "ideagarden-suggestion-" + this.identifier + ".html";
		this.DOM = createStaticSuggestionDOM(this.identifier);

		var mySuggestion = this;

		$.ajax({
			url: this.dataFile,
			dataType: 'html',
			success: function(data) {
				mySuggestion.DOM = $();
				mySuggestion.DOM = mySuggestion.DOM.add($('<span>', {
					'class': 'ideagarden-heading',
					"text": "Here's a hint..."
				})).add(data);
			},
			error: function() {
				mySuggestion.DOM = createStaticSuggestionDOM(mySuggestion.identifier);
			}
		});
	};

	/**
	* @cfg
	* Change these to match your host environment.
	*/
	exports.ENV = {
		program: "code",
		programs: "code",
		element: "object",
		elements: "objects",
		ifConstruct: "if statement",
		forConstruct: "for loop",
		listConstruct: "list",
		functionCall: "function call",
		image: "lib/ideagarden/img/ideagarden-cell.png",
		defaultQuery: '/kitten/s'
	};

	function replaceIfCondition(dom, context) {
		var codeCondition = '(your condition)';
		if (typeof context.code !== 'undefined') {
			var m = /^if (.*)$/gi.exec(context.line);
			if (m) { codeCondition = m[1]; }
			dom.find(".ideagarden-context-condition").html("(" + codeCondition + ")");
		}
		return dom;
	}

	function insertPlayersCode(dom, context) {
		if (typeof context.code !== 'undefined') {
			var programText = context.code.text();
			dom.find(".ideagarden-code").html(programText.replace(/\t/g, '&nbsp;&nbsp;').replace(/\r|\n/g, '<br/>'));
		}
		return dom;
	}

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function parseListFromLoop(line) {
		var m = /^\s*for\s+(.*)*\s*in(\s*)+(\/\w+\/s*)$/i.exec(line);
		if (m && typeof m[3] !== 'undefined') {
			return m[3];
		} else {
			return exports.ENV.defaultQuery;
		}
	}

	function parseListFromLine(line) {
		var m = /.*(\s*)+(\/\w+\/s*)$/i.exec(line);
		if (m && typeof m[2] !== 'undefined') {
			return m[2];
		} else {
			return exports.ENV.defaultQuery;
		}
	}

	function parseListFromLine(line) {
		var m = /.*(\s*)+(\/\w+\/s*)$/i.exec(line);
		if (m && typeof m[2] !== 'undefined') {
			return m[2];
		} else {
			return '/gidget/s';
		}
	}

	function parseVariableFromForLoop(line) {
		var variable = 'myItem';
		// Using RegEx negative lookahead to get a word
		// except 'in' as the variable
		var m = /^for\s+(?!in)(\w+)(\s+in)*/.exec(line);
		if (m) {
			variable = m[1];
		}
		return variable;
	}

	function extractListType(theList, options) {
		if (typeof options === 'undefined') { options = {}; }

		var listType;
		var m = /\/(\w+)\//gi.exec(theList);
		if (m) {
			var prefix = '';
			listType = m[1];
			if (typeof options.pluralize !== 'undefined' && options.pluralize === true) {
				listType = IdeaGarden.pluralize(listType);
			}

			if (typeof options.my !== 'undefined' && options.my === true) {
				prefix = 'my';
				listType = prefix + capitalizeFirstLetter(listType);
			}
		} else {
			listType = parseVariableFromForLoop(line);
		}
		return listType;
	}

	function getLoopList(dom, context) {
		var listUsed;
		if (typeof context.code !== 'undefined' && typeof context.forLoopLine !== 'undefined') {
			listUsed = parseListFromLoop(context.forLoopLine);
		} else {
			listUsed = parseListFromLine(context.line);
		}
		dom.find(".ideagarden-loopList").addClass("sourceToken literal").html(listUsed);
		return dom;
	}

	function extractTypeFromList(text) {
		var looptype = 'thing in your list';
		if (text !== 'your list') {
			var m = /\/(\w+)\//gi.exec(text);
			if (m) {
				looptype = m[1];
			} else {
				looptype = 'item';
			}
		}

		return looptype;
	}

	function replaceLoopList(dom, newList) {
		dom.find(".ideagarden-loopList").addClass("sourceToken literal").html(newList);
		return dom;
	}

	function getLoopObjectType(dom, context) {
		var looplist;
		if (typeof context.code !== 'undefined' && typeof context.forLoopLine !== 'undefined') {
			looplist = parseListFromLoop(context.forLoopLine);
		} else {
			looplist = parseListFromLine(context.line);
		}
		looptype = extractTypeFromList(looplist);

		dom.find(".ideagarden-listType").html(looptype);
		dom.find(".ideagarden-listTypeQuery").addClass("sourceToken literal").html('/' + looptype + '/');

		return dom;
	}

	/**
	* If the iterator is the unknown default iterator, substitute it, if possible, with
	* the list's type.
	*/
	function substituteUnknownIterator(iterator, line, dom) {
		if (iterator === 'myItem') {
			iterator = extractTypeFromList(parseListFromLoop(line));
			dom.find(".ideagarden-iterator").addClass("sourceToken").html(iterator);
			dom.find(".ideagarden-myiterator").addClass("sourceToken").html('my' + capitalizeFirstLetter(iterator));
		} else {
			dom = replaceIterator(dom, iterator);
		}

		return dom;
	}

	/** Get the the iterator variable */
	function getIterator(dom, context) {
		var iterator;
		if (typeof context.code !== 'undefined' && typeof context.forLoopLine !== 'undefined') {
			iterator = parseVariableFromForLoop(context.forLoopLine);
			dom = substituteUnknownIterator(iterator, context.forLoopLine, dom);
		} else {
			iterator = extractListType(context.line, {my: true});
			dom = substituteUnknownIterator(iterator, context.line, dom);
		}

		return dom;
	}

	/** Gets the action */
	function getAction(ret, context) {
		var m = /^\s*(\w+)\s+/gi.exec(context.line);
		if (m) {
			ret.find(".ideagarden-action").html(m[1]);
		}

		return ret;
	}

	/** 
	* Find the 'for loop' line in the Code Window
	*/
	function findForLoopSourceLine($code, tokenID) {
		var gidgetCode = $code.find($('.sourceLine :contains("for")'));
		var forLines;

		// Go backwards through the code, as the unstuckerator always appears
		// after the 'for' token.
		$.each(gidgetCode.get().reverse(), function (index, value) {
			var match = $(value).attr('id').match(/sourceToken(\d+)/);
			var forToken = parseInt(match[1], 10);
			if (forToken < tokenID) {
				forLines = $(value).parent().text();
				return false;
			}
		});

		return forLines;
	}

	/**
	* Find the 'for loop' line from tooltips when not all
	* tokens are necessarily defined. This might not work
	* if there are multiple for loops in the example code.
	*/
	function findForLoopSourceLineFromTooltipCode($code, tokenID) {
		var gidgetCode = $code.find($('.sourceLine :contains("for")'));
		var forLines;

		// Go backwards through the code, as the unstuckerator always appears
		// after the 'for' token.
		$.each(gidgetCode.get().reverse(), function (index, value) {
			try {
				forLines = gidgetCode.text();
			} catch (e) {
				forLines = gidgetCode.text();
			}
		});

		return forLines;
	}

	function replaceIterator(dom, newIterator) {
		dom.find(".ideagarden-iterator").addClass("sourceToken").html(newIterator);
		dom.find(".ideagarden-myiterator").addClass("sourceToken").html(newIterator);
		return dom;
	}

	function replaceListVariable(dom, context) {
		dom.find(".ideagarden-listUsed").html(context.activeToken);
		return dom;
	}

	function generateLoopListVariable(dom, context) {
		dom.find(".ideagarden-listIterator").html(extractListType(context.activeToken, {my: true}));
		return dom;
	}

	function replaceListType(dom, context) {
		dom.find(".ideagarden-listType").html(extractListType(context.activeToken));
		return dom;
	}

	function replaceListTypePlural(dom, context) {
		dom.find(".ideagarden-listTypePlural").html(extractListType(context.activeToken, {pluralize: true}));
		return dom;
	}

	function replaceRepeatSuggestionVariables(ret, context) {

		if (context.topic === 'notUsingIterator') {
			context.forLoopLine = findForLoopSourceLine(context.code, context.activeToken);
		} else if (context.topic === IdeaGarden.abstractEvent.iteratorvariable) {
			context.forLoopLine = findForLoopSourceLineFromTooltipCode(context.code, context.activeToken);
		} else {
			context.line = context.line.text();
		}

		ret = getLoopList(ret, context);
		ret = getIterator(ret, context);
		ret = getLoopObjectType(ret, context);

		if (context.topic === 'pluralInsteadOfSingleton') {
			ret = getAction(ret, context);
		}

		return ret;
	}

	function replaceListVariables(ret, context) {
		ret = replaceListVariable(ret, context);
		ret = replaceLoopList(ret, context.activeToken);
		ret = replaceListType(ret, context);
		ret = replaceListTypePlural(ret, context);
		ret = replaceIterator(ret, extractTypeFromList(context.activeToken));
		return ret;
	}

	/**
	* @method
	*/
	exports.prototype.replaceEnv = function(dom, context) {
		var ret = $(dom);
		// Filter the content through variable replacement

		if (typeof context !== 'undefined') {
			if (context.topic === 'notUsingIterator' || context.topic === 'pluralInsteadOfSingleton') {
				ret = replaceRepeatSuggestionVariables(ret, context);
			} else if (context.topic === IdeaGarden.abstractEvent.iteratorvariable) {
				ret = replaceRepeatSuggestionVariables(ret, context);
			} else if (context.topic === IdeaGarden.abstractEvent.list && context.activeToken !== "") {
				ret = replaceListVariables(ret, context);
			}
		}

		return ret;
	};

	/**
	* @method
	*/
	exports.prototype.getSuggestion = function(context) {
		return exports.prototype.replaceEnv(this.DOM, context);
	};

	exports.create = function(identifier) {
		var ret = Object.create(exports.prototype);
		ret.init(identifier);
		return ret;
	};

	return exports;
}());

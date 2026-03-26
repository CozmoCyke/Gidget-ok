if (typeof GIDGET !== "undefined") {
	GIDGET.ui = GIDGET.ui || {};
	if (typeof GIDGET.ui.helpCounter === "undefined") {
		GIDGET.ui.helpCounter = { tooltip: 0, refguide: 0 };
	}
	if (typeof GIDGET.ui.logEvent !== "function") {
		GIDGET.ui.logEvent = function() {};
	}
}

function getLocalReferenceEntry(word) {
	var key = String(word || "").toLowerCase();
	var help = (GIDGET.objectHelp || {});

	var entries = {
		"=": {
			title: "equals",
			summary: "Tests whether the two sides are equal."
		},
		"#": {
			title: "length",
			summary: "Returns the number of items or characters."
		},
		addition: { title: "addition", summary: "Adds two values together." },
		and: { title: "and", summary: "Requires both conditions to be true." },
		create: { title: "create", summary: "Creates a new object or definition." },
		done: { title: "done", summary: "Marks a task or condition as complete." },
		drop: { title: "drop", summary: "Releases the object the robot is carrying." },
		else: { title: "else", summary: "Runs when the if condition is false." },
		energy: { title: "energy", summary: "Shows Gidget's remaining energy." },
		ensure: { title: "ensure", summary: "Checks that a condition stays true." },
		for: { title: "for", summary: "Starts a loop over a collection." },
		function: { title: "function", summary: "Defines or calls a reusable action." },
		goto: { title: "goto", summary: "Moves the robot toward a selected target." },
		grab: { title: "grab", summary: "Lets the robot carry an object." },
		if: { title: "if", summary: "Executes only when the condition is true." },
		image: { title: "image", summary: "Refers to an object's visual appearance." },
		in: { title: "in", summary: "Links an iterator to the list it walks." },
		list: { title: "list", summary: "A collection of objects or values the robot can work with." },
		literal: { title: "literal", summary: "A value written directly in code." },
		name: { title: "name", summary: "The identifier for an object or value." },
		not: { title: "not", summary: "Reverses the truth value of a condition." },
		object: { title: "object", summary: "A thing in the world or a defined value." },
		or: { title: "or", summary: "Requires at least one condition to be true." },
		plural: { title: "plural", summary: "Refers to more than one object." },
		position: { title: "position", summary: "Where an object is located." },
		property: { title: "property", summary: "An attribute that describes an object." },
		return: { title: "return", summary: "Sends a value back from a function." },
		right: { title: "right", summary: "A direction or alignment hint." },
		rotation: { title: "rotation", summary: "The object's turning angle." },
		scale: { title: "scale", summary: "The object's size multiplier." },
		set: { title: "set", summary: "Assigns a value to a property or variable." },
		singleton: { title: "singleton", summary: "Refers to exactly one object." },
		sound: { title: "sound", summary: "An auditory effect or resource." },
		stack: { title: "stack", summary: "A pile of values or objects." },
		subtraction: { title: "subtraction", summary: "Subtracts one value from another." },
		this: { title: "this", summary: "Refers to the current object or robot context." },
		to: { title: "to", summary: "Introduces the action target." }
	};

	if (entries.hasOwnProperty(key)) {
		return entries[key];
	}

	if (help && typeof help.getCodeTitle === "function" && typeof help.getCodeSummary === "function") {
		return {
			title: help.getCodeTitle(key),
			summary: help.getCodeSummary(key)
		};
	}

	return { 
		title: key || "help",
		summary: "No local help entry is available for this term."
	};
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

function showLocalHelpTooltip(target, title, html) {
	var $tooltip = ensureLocalHelpTooltip();
	$tooltip.html(
		$("<span>", { "class": "local-help-title", text: title })[0].outerHTML +
		$("<div>", { "class": "local-help-body", html: html })[0].outerHTML
	);

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

var refguide = {
	/*********************************************************
	****** T O O L - T I P S * H E L P E R - F U N C T I O N S
	*********************************************************/

	/**
	* Add the 'Dictionary' icon and a yellow background
	*/
	addTooltipHoverStyle: function (ev, name){
		if (refguide.displayHelp()) {
			if (ev.type !== 'mouseleave') {
				$(name).addClass('cursor-dictionary');
				$(name).css({'background-color' : 'yellow'});
			} else {
				$(name).removeClass('cursor-dictionary');
				refguide.retainErrorHighlights(name);
			}
		}
	},

	/**
	* Turn the cursor into the default cursor 'arrow' for the Idea Garden.
	*/
	addIdeaGardenHoverStyle: function (ev, name){
		if (refguide.displayHelp()) {
			if (ev.type !== 'mouseleave') {
				$(name).addClass('cursor-ideagarden');
			} else {
				$(name).removeClass('cursor-ideagarden');
				refguide.retainErrorHighlights(name);
			}
		}
	},

	/**
	* retain old color if this was highlighted as a coding error.
	*/
	retainErrorHighlights: function (name) {
		if ($(name).hasClass("error"))
			$(name).css({'background-color' : ''});
		else
			$(name).css({'background-color' : 'transparent'});
	},

	/** Creates a tooltip, using the message "tooltipMsg" that's passed to it.
	* This one appears and disappears immediately with mouse on/off and follows the mouse
	* Currently not used in the game, but remains as a utility.
	*/
	createTooltipQuick: function (obj, event, tooltipMsg){
		if (typeof $.fn.qtip !== 'function') {
			if (event.type === 'mouseleave') {
				hideLocalHelpTooltip();
			} else {
				showLocalHelpTooltip(obj, "Quick help", "<p>" + tooltipMsg + "</p>");
			}
			return;
		}
		$(obj).qtip({
			overwrite: false,
			content: tooltipMsg,
			position: {
				viewport: $(window),
				target: 'mouse',
				my: 'top right',
				adjust: {
					x: 10,  y: 10
				}
			},
			show: {
				event: event.type,
				ready: true,
				solo: false
			},
			hide: {
				fixed: true
			},
			style: {
				classes: 'draggable-tooltip qtip-shadow qtip-light dictionary-tooltip'
			},
			events: {
				show: function(event, api) {
					GIDGET.ui.logEvent("QuickTooltip", JSON.stringify({
						event: event.type,
						id: $(this).attr("id"),
						keyword: tooltipMsg
					}));
				},
				hide: function(event, api) {
					GIDGET.ui.logEvent("QuickTooltip", JSON.stringify({
						event: event.type,
						id: $(this).attr("id"),
						keyword: tooltipMsg
					}));
				}
			}
		}, event);
	},

	createTooltipAJAXAtPosition: function (obj, event, params, pos) {
		var url = "lib/refguide/reference.php";
		var loadText = "Loading reference...";
		if (GIDGET.experiment.showDebugButtons) {
			loadText = "Loading reference for: " + params;
		}

		if (typeof $.fn.qtip !== 'function') {
			if (event.type === 'mouseleave') {
				hideLocalHelpTooltip();
				return;
			}

			var entry = getLocalReferenceEntry(params.word);
			showLocalHelpTooltip(obj, entry.title, "<p>" + entry.summary + "</p>");
			return;
		}

		$(obj).qtip({
			overwrite: false,
			content: {
				text: function(event, api) {
					$.ajax({
						url: url,
						type: 'GET',
						data: params,
						dataType: 'html',
						async: true
					}).then(function(data) {
						// success is run once on the first load.
						// call tooltipUnstuckarator to log IG appearances in dictionary
						IdeaGarden.tooltipUnstuckarator(params.word);
						api.set('content.text', $.parseJSON(data).html);
					}, function(xhr, status, error) {
						api.set('content.text', 'The reference could not be loaded. Try again.');
					});

					return loadText;
				},
				title: {
					text: "drag to reposition",
					button: 'Close'
				}
			},
			show: {
				event: event.type,
				ready: true,
				solo: false,
				delay: 500
			},
			hide: {
				event: 'mouseleave',
				delay: 400,
				fixed: true
			},
			position: pos,
			style: {
				classes: 'draggable-tooltip qtip-shadow qtip-light dictionary-tooltip referenceQtipContainer'
			},
			events: {
				show: function(event, api) {
					if (typeof $.fn.draggable === 'function') {
						$(this).draggable({
							containment: 'window',
							handle: api.elements.titlebar,
							drag: function(event, ui) {
								api.set('hide.event', false);
							}
						});
					}

					// Increase tooltip counter
					GIDGET.ui.helpCounter['tooltip']++;
					GIDGET.ui.logEvent("Dictionary", JSON.stringify({
						event: event.type,
						id: $(this).attr("id"),
						keyword: params.word
					}));
				},
				hide: function(event, api) {
					GIDGET.ui.logEvent("Dictionary", JSON.stringify({
						event: event.type,
						id: $(this).attr("id"),
						keyword: params.word
					}));
				},
				visible: function(event, api) {
					// Later move IG stuff into here
					
				}
			}
		});
	},

	// Creates a tooltip, opening an AJAX call to a PHP script that returns text from query "path"
	createTooltipAJAX: function (obj, event, params) {

		var position = {
			viewport: $(window)
		};

		if (refguide.displayHelp()) {
			refguide.createTooltipAJAXAtPosition(obj, event, params, position);
		}
	},

	// This is not called in this version of the code.
	createTooltipAJAXOpposite: function (obj, event, params) {

		var position = {
			my: 'top right',
			at: 'bottom left'
		};

		if (refguide.displayHelp()) {
			refguide.createTooltipAJAXAtPosition(obj, event, params, position);
		}
	},

	// Checks to see if passed variable is a numerical value
	isNumber: function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},


	// remove space, object, and function from passed string.
	trimType: function (str) {

		str = str.replace("object","");
		str = str.replace("function","");
		str = str.replace(" ","");

		// Also, we need to check the meta string to make sure it's not a
		// list of objects or other lists, or it won't pass correctly.
		if (str.indexOf("[[") !== -1 || str.indexOf(",,") !== -1 || str.indexOf(", ,") !== -1)
			str = "[...,...,...]";

		return str;

	},

	 // Remove everything within parentheses "()" inclusive
	removeParenAndContents:  function (str) {
		return str.replace(/\(.*\)/, '');
	 },

	displayHelp:  function () {
		// Don't load if this is an exam level and we're not supposed to show it.
		if (typeof GIDGET.ui.isExamLevel === 'function' && GIDGET.ui.isExamLevel() && !GIDGET.experiment.allowRefGuideInExams)
			return false;
		else
			return true;

	},

	isReservedWord: function (keyword) {
		// Check for reserved terms
		switch (keyword) {
			case "energy":	return true; break;
			case "grabbed":	return true; break;
			case "image":	return true; break;
			case "labeled":	return true; break;
			case "layer":	return true; break;
			case "name":	return true; break;
			case "position":return true; break;
			case "gidget":return true; break;
			case "scale":	return true; break;
			case "rotation":return true; break;
			case "transparency":return true; break;
			default:		return false; break;
		}
		return false;
	},

	getSourceLineCodeFromObject: function (obj) {
		return $("#" + $(obj).parent('.sourceLine').attr('id'));
	},

	removeParentheses: function (txt) {
		var removed = txt || '';
		removed = removed.replace('(', '');
		removed = removed.replace(')', '');
		return removed;
	},

	initializeIdeaGardenTooltip: function (command, hintTopic, sourceLine, activeToken) {
		var keyword = refguide.removeParentheses(command);
		IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
			code: GIDGET.ui.htmlToGidgetCode($("#code").html()),
			topic: hintTopic,
			line: sourceLine,
			activeToken: activeToken
		});
	}
}


/*********************************************************
****** R E F E R E N C E - G U I D E *********************
*********************************************************/


// Reference Modal Content Changer
// Opens RefGuide by dropDown change
$(document).ready(function() {

	//Convert list to "chosen" style
	if (typeof $.fn.chosen === 'function') {
		$(".chzn-select").chosen();
	}

	// Make sure ajax pages aren't cached
	$.ajaxSetup ({
		cache: false
	});
	// Show something during load
	var ajax_load = "Loading...";

	// Called when the following select-list option is changed
	$('#referenceGuideList li').click(function(event) {
		var word = this.getAttribute('value');
		$('.referenceItemSelected').removeClass('referenceItemSelected');
		$(this).addClass('referenceItemSelected');
		var loadUrl = "lib/refguide/reference.php?word=" + word;
		// load the AJAX page
		$("#reference-modal").html(ajax_load);
		$.ajax({
			url: loadUrl,
			success: function(data) {
				$("#reference-modal").html($.parseJSON(data).html);
				GIDGET.ui.helpCounter['refguide']++;
				GIDGET.ui.logEvent("Dictionary", JSON.stringify({
					event: event.type,
					id: $("#reference-modal").attr("id"),
					keyword: word
				}))
			},
			error: function(response, status, xhr) {
				var msg = "Sorry, but there was an error: ";
				$("#reference-modal").html(msg + xhr.status + " " + xhr.statusText);				
			}
		});
	});
});

/*********************************************************
****** T O O L - T I P S *********************************
*********************************************************/

// Load/create tooltips on demand

$(document).on('focus mouseenter mouseleave', '.ig-character', function(event) {
	var that = this;

	// Let's make sure the IG character doesn't occur inside the tutorial
	if(! $(this).closest(".introjs-tooltip").length ) {
		
		refguide.addIdeaGardenHoverStyle(event, this);
	
		IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
			event: event,
			element: that,
			code: $("#code"),
			topic: IdeaGarden.tokensHelpData.getDataFromElementId($(that).attr('id')),
			line: refguide.getSourceLineCodeFromObject(that),
			activeToken: IdeaGarden.tokensHelpData.getTokenNumber($(that).attr('id'))
		});
	}

});

// Load/create tooltips on demand

$(document).on('focus mouseenter mouseleave', '.condition', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.condition
	});

});

$(document).on('focus mouseenter mouseleave', '.ensure', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.assert
	});

});

$(document).on('focus mouseenter mouseleave', '.for', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		code: IdeaGarden.getCode($(that)),
		topic: IdeaGarden.abstractEvent.for,
		line: $(that).parent('.sourceLine')
	});

});

$(document).on('focus mouseenter mouseleave', '.if', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.if
	});

});

$(document).on('focus mouseenter mouseleave', '.list', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.list,
		activeToken: $(that).text()
	});

});

$(document).on('focus mouseenter mouseleave', '.variable', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.variable
	});

});

$(document).on('focus mouseenter mouseleave', '.iteratorvariable', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		code: IdeaGarden.getCode($(that)),
		topic: IdeaGarden.abstractEvent.iteratorvariable,
		line: $(that).parent('.sourceLine')
	});

});

$(document).on('focus mouseenter mouseleave', '.igobject', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.object
	});

});

$(document).on('focus mouseenter mouseleave', '.function', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.function
	});

});

$(document).on('focus mouseenter mouseleave', '.when', function(event) {
	var that = this;

	refguide.addIdeaGardenHoverStyle(event, this);

	IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
		event: event,
		element: that,
		topic: IdeaGarden.abstractEvent.when
	});

});

/**
* Enables logging of when a QTip is closed with the 'close' button.
*/
$(document).on('mousedown', '.qtip-close', function(event) {

	var type = 'Dictionary';
	if ($(this).parents('.ideagarden-tooltip').length > 0) {
		type = 'IdeaGarden';
	}

	GIDGET.ui.logEvent(type, JSON.stringify({
		event: "close",
		id: $(this).parents(".qtip").attr("id")
	}));
});

/* E X A M * U I **************************************/
/** For when things are disabled in exam mode
* This functionality is deprecated, as tooltips do not hover on exam mode.
*/
// $(document).on('focus mouseenter mouseleave', '.disabledExam', function(event) {
// 	console.log("Deprecated: .disabledExam event.");
// 	// Lets make sure it's an exam level
// 	if (GIDGET.ui.isExamLevel()){
// 		var tooltipMsg = "This has been disabled because Gidget wants to try this level with minimal help!";
// 		createTooltipQuick(this, event, tooltipMsg);
// 	}
// });

/* K E Y W O R D S **************************************/
// E.g., set, up, function, object

$(document).on('focus mouseenter mouseleave', '.keyword', function(event) {

	// Stylize hover
	refguide.addTooltipHoverStyle(event, this);

	var thisKeyword = $(this).text();
	var tooltipMsg = "(blank)";

	refguide.createTooltipAJAX(this, event, {
		tooltip: true,
		word: thisKeyword
	});

});


/* L I S T - V A L U E S ***************************************/
// Looks specifically for empty lists
// Deprecated as of Idea Garden rewrite, as lists are now going to be an Idea Garden concept.
// This code will display Idea Garden help if you mouse over a list, but that is not
// specified behavior.

// $(document).on('focus mouseenter mouseleave', '.listValue', function(event) {

// 	var thisKeyword = $(this).text();

// 	// check if it's empty (should only have two spans for brackets).
// 	if ($(this).children().length == 2) {
// 		var that = this;

// 		addIdeaGardenHoverStyle(event, this);

// 		IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
// 			event: event,
// 			element: that,
// 			code: IdeaGarden.getCode($(that)),
// 			topic: IdeaGarden.abstractEvent.list,
// 			line: $(that).parent('.sourceLine'),
// 			position: {
// 				my: 'top right',
// 				at: 'bottom left'
// 			}
// 		});

// 	}
// 	else {
// 		// if the child has a class called backet (in a span), it should be highlighted and tooltipped.
// 		$(this).children().each(function() {
// 			if ($(this).hasClass("bracket")){
// 				var that = this;

// 				addIdeaGardenHoverStyle(event, this);

// 				IdeaGarden.hostInfoToIdeaGarden("IdeaGardenTooltip", {
// 					event: event,
// 					element: that,
// 					code: IdeaGarden.getCode($(that)),
// 					topic: IdeaGarden.abstractEvent.list,
// 					line: $(that).parent('.sourceLine'),
// 					position: {
// 						my: 'top right',
// 						at: 'bottom left'
// 					}
// 				});
// 			}
// 		});
// 	}
// });


/* P R I M I T I V E - & - O B J E C T - V A L U E S *********/
// E.g., 10, "string", false - (outside source code)

$(document).on('focus mouseenter mouseleave', '.primitiveValue, .objectValue', function(event) {

	// Stylize hover
	refguide.addTooltipHoverStyle(event, this);

	var thisKeyword = $(this).text();
	var objType = "";

	/*// Check to see if this is a list
	var isList = false;
	if( $(this).parent().hasClass('listValue') ){
		isList = true;
	}*/

	// Check to see if it's a number or a non-number
	if (refguide.isNumber(thisKeyword)){
		objType = "number";
	} else {
		// String detection
		if (thisKeyword.indexOf("\"") === 0)
			objType = "string";

		// Function detection
		if (thisKeyword.indexOf("function") === 0)
			objType = "function";
		// More function detection
		if (thisKeyword.indexOf("()") === thisKeyword.length-2 || thisKeyword.indexOf(")") == thisKeyword.length-1) {
			objType = "function";
			thisKeyword = refguide.removeParenAndContents(thisKeyword);
		}
		//Boolean detection
		if (thisKeyword.indexOf("true") === 0 || thisKeyword.indexOf("false") === 0)
			objType = "boolean";
		// Object (command) detection
		if (thisKeyword.indexOf("nothing") === 0)
			objType = "nothing";
		// Object (command) detection
		if (thisKeyword.indexOf("object") === 0)
			objType = "object";
		// Object detection
		if (thisKeyword === "" && $(this).attr("alt") !== undefined) {
			objType = "object";
			thisKeyword = $(this).attr("alt");
		}
	}

	refguide.createTooltipAJAX(this, event, {
		tooltip: true,
		word: "(" + objType + ")",
		meta: refguide.trimType(thisKeyword)
	});

});

/* V A R I A B L E - N A M E S *********************/
// E.g., energy, layer, x, y

$(document).on('focus mouseenter mouseleave', '.propertyName', function(event) {

	// Stylize hover
	refguide.addTooltipHoverStyle(event, this);

	if (refguide.isReservedWord($(this).text()))
		word = $(this).text();
	else
		word = "variable";


	refguide.createTooltipAJAX(this, event, {
		tooltip: true,
		word: word,
		meta: $(this).text()
	});
});


/* S T R A I G H T - D I C T I O N A R Y - T E R M  *********************/
// E.g., literal

$(document).on('focus mouseenter mouseleave', '.dictionaryTerm', function(event) {

	// Stylize hover
	refguide.addTooltipHoverStyle(event, this);

	word = $(this).text();

	refguide.createTooltipAJAX(this, event, {
		tooltip: true,
		word: word,
		meta: $(this).text()
	});
});



/* S O U R C E  - T O K E N S ****************************/
// E.g., *, +, -, "string", 10, -70 (in source code)

$(document).on('focus mouseenter mouseleave', '.sourceToken, .object', function(event) {


	var thisKeyword = $(this).text();
	var origKeyword = $(this).text();
	var tooltipMsg = "(blank)";
	var reservedWord = false;
	var sendMeta = false;
	var skip = false; // flag to skip creating a toolbar (e.g. if "-" refers to negation)

	// For special characters, assign a new keyword
	switch (thisKeyword){
		case "*":		thisKeyword = "multiplication"; break;
		case "+":		thisKeyword = "addition"; break;
		case "-":		thisKeyword = "subtraction"; break;
		case ">":		thisKeyword = "greater-than"; break;
		case "<":		thisKeyword = "less-than"; break;
		case ":":		thisKeyword = "property-of"; break;
		case "=":		thisKeyword = "(equality)"; break;
		case "#":		thisKeyword = "(length)"; break;
		case "[":		skip = true; break;
		case "]":		skip = true; break;
		case ",":		skip = true; break;
		default:		break;
	}

	// check special case for negative vs. subtraction
	if (thisKeyword == "(subtraction)"){
		//make sure it's not actually a negative
		if (refguide.isNumber($(this).prev().text()) === false && refguide.isNumber($(this).next().text()) === true)
			skip = true;
	}

	// check if these are brackets without anything in between
	if ($(this).text() == '['){
		if ($(this).next('.sourceToken').text() == ']'){
			thisKeyword = "(empty-list)";
			skip = true;
		}
	}
	else if ($(this).text() == ']'){
		if ($(this).prev('.sourceToken').text() == '['){
			thisKeyword = "(empty-list)";
			skip = true;
		}
	}

	// don't display tooltips for parenthesis
	if ($(this).text() == "(" || $(this).text() == ")") {
		skip = true;
	}

	// check to see if this is a keyword, 'this:', if it is, make tooltip and bypass everything else
	if ($(this).text() == 'this' && $(this).next('.sourceToken').text() == ':') {
		refguide.addTooltipHoverStyle(event, this);
		refguide.createTooltipAJAX(this, event, {
			tooltip: true,
			word: thisKeyword
		});
		return;
	}


	// Make this is a literal if labaled as an .object so it can process the object name
	// Check to make sure it's an object, and that it starts with a /
	if ($(this).is(".object") && $(this).text().indexOf("\/") === 0)
		$(this).addClass("literal");


	// check if these are also labeled as 'literal'
	if ($(this).hasClass('literal')){

		// Detect what type these literals are:

		if (refguide.isNumber($(this).text())){	// This is a NUMERICAL LITERAL
			//check for negatives (as opposed to subtraction)
			if ($(this).prev().text() == "-" && refguide.isNumber($(this).prev().prev().text()) === false)
				origKeyword = "-"+$(this).text();
			thisKeyword = "(number-literal)";
		}
		else {
			if ($(this).text().indexOf("\"") === 0) {	// This is a STRING LITERAL
				// add string detection
				thisKeyword = "(string-literal)";
			}
			else if ($(this).text().indexOf("\'") === 0) {	// This is a STRING LITERAL
				// add string detection
				thisKeyword = "(string-literal)";
			}
			else if ($(this).text().indexOf("\/") === 0){
				// slashes used to indicate list, but now they indicate objects
				if ($(this).text().length === 1 || $(this).text() == "\/\/") { // this is just a single or double slash
					skip = true;
				}
				else if ($(this).text().indexOf("\/s") == $(this).text().length-2){	// This is a PLURAL query
					thisKeyword = "plural";
				}
				else {	// This is a SINGLETON query
					thisKeyword = "singleton";
				}
			}
			else if ($(this).text().indexOf("false") === 0 || $(this).text().indexOf("true") === 0){ // This is a BOOLEAN LITERAL
				thisKeyword = "(boolean-literal)";
			}
			else { // This is a (generic) LITERAL!";
				thisKeyword = "(literal)";
			}
		}
		sendMeta = true;
	}

	if (!skip) {
		// Stylize hover
		refguide.addTooltipHoverStyle(event, this);
	}

	if (thisKeyword != $(this).text() && !skip) {
		if (!sendMeta)
			refguide.createTooltipAJAX(this, event, {
				tooltip: true,
				word: encodeURIComponent(thisKeyword)
			});
		else
			refguide.createTooltipAJAX(this, event, {
				tooltip: true,
				word: encodeURIComponent(thisKeyword),
				meta: encodeURIComponent(origKeyword)
			});
	}
	else if (refguide.isReservedWord(thisKeyword) && !skip) {
		refguide.createTooltipAJAX(this, event, {
			tooltip: true,
			word: thisKeyword
		});
	} else if (!skip && $(this).next('.sourceToken').text() === '(') {
		refguide.createTooltipAJAX(this, event, {
			tooltip: true,
			word: "(function-or-object)",
			meta: encodeURIComponent(origKeyword)
		});
	} else if (!skip) {
		refguide.createTooltipAJAX(this, event, {
			tooltip: true,
			word: "(unknown)",
			meta: encodeURIComponent(origKeyword)
		});
	}
});

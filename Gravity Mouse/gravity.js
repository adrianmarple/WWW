//Copyright Adrian de Ruyter Marple

/*TODO:
 * Have the pointer disappear when the real pointer is outside the viewport. (Almost done, but fails for the left side somehow)
 * Deal with hover over.
 * Consider using a hyperbola outside of wells.
 * Make sure frame borders behave properly.
 */

var extension = false; //set to false if this script is not used as part of a chrome extension
 
var offset, p_offset;
var click = false;
var wellBoxes = false;
var wells = [];

var visible = false;
var NORM_OPACITY = .4;
var WELL_OPACITY = .8;
var opacity = NORM_OPACITY;
if(extension)
	opacity = 0;

var Z_INDEX = 1e8;

var G = 3;
var on = false;


$(document).ready(function() {
	var ctrl = false;
	$(document).keydown(function(e) {
		if(e.keyCode == 17)
			ctrl = true;
	});
	$(document).keyup(function(e) {
		if(e.keyCode == 17)
			ctrl = false;
	});
	$(document).keydown(function(e) {
		if(ctrl && e.keyCode == 81) { //ctrl-q
			if(on) {
				turnOff();
			}
			else {
				turnOn();
			}
			if(extension)
				chrome.storage.sync.set({'toggle': on});
		}
	});
	
	if(extension)
		sync();
	else
		turnOn();
		
	//Add window spanning backdrop
	$('body').prepend('<div id="backdrop" style="position:fixed; float:left; opacity:.001; width:' +
			window.innerWidth + 'px; height:' + window.innerHeight + 'px; z-index:-2"><//div>');
	offset = document.getElementById('backdrop').getBoundingClientRect();
	
	$('#backdrop').css('margin-left', -offset.left + 'px');
	$('#backdrop').css('margin-top', -offset.top + 'px');
	
	window.onresize = function() {
		$('#backdrop').width(window.innerWidth  +  'px');
		$('#backdrop').height(window.innerHeight + 'px');
	}
	
	//Add false mouse pointer
	var src;
	if(extension)
		src = chrome.extension.getURL('pointer.png');
	else
		src = 'pointer.png';
		
	$('body').prepend('<img id="pointer" src="' + src +
			'" style="position:fixed; z-index:-2; float:left; opacity:0;' +
			'border-style:none; -webkit-box-shadow:none; box-shadow:none; width:14px" //>');
	p_offset = document.getElementById('pointer').getBoundingClientRect();
	if(!extension)
		$('#pointer').css('z-index', Z_INDEX);
	
	//Move mouse pointer towards wells
	window.addEventListener('mousemove', function(e) {
		visible = true;
		var xy = mouseTransform(e.clientX, e.clientY);
		var x = xy[0];
		var y = xy[1];
		$("#pointer").css("margin-left", x + 1 - p_offset.left); 
		$("#pointer").css("margin-top",  y + 1 - p_offset.top);
		if(on)
			$('#pointer').css('opacity', opacity);
		//remove +1s when I figure out how to click "through" the pointer img
	});
	
	//Make pointer disappear when the mouse leaves the viewport
	window.addEventListener('mouseout', function(e) {
		console.log("Mouse out");
		$('#pointer').css('opacity', '0');
		visible = false;
	});
	
	//Simulate everything the mouse does at the new location
	window.addEventListener('click', function(e) {
		if(!on)
			return true;
		if(click) {
			click = false;
			return true;
		}
		e.stopPropagation();
		e.preventDefault();
		e.stopImmediatePropagation();

		var xy = mouseTransform(e.clientX, e.clientY);
		var x = xy[0];
		var y = xy[1];

		click = true;
		var ev = document.createEvent("MouseEvent");
		var el = document.elementFromPoint(x,y);
		ev.initMouseEvent(
			"click",
			true /* bubble */, true /* cancelable */,
			window, null,
			x, y, 0, 0, /* coordinates */
			false, false, false, false, /* modifier keys */
			0 /*left*/, null
		);
		el.dispatchEvent(ev);
	});
	//window.addEventListener('dblclick', function(e) {});
	//window.addEventListener('mousedown', function(e) {});
	//window.addEventListener('mouseup', function(e) {});
	//window.addEventListener('mouseover', function(e) {});
	//window.addEventListener('mouseout', function(e) {});
	
	window.addEventListener('scroll', setWells);
	setInterval(setWells, 100);
	
	//detect cursor changes and suppress them if necessary
	var patt = /cursor:.*/;
	/*$('*').attrchange({
		trackValues: true,
		callback: function(e) {
			if(on)// && patt.test(e.newValue))
				$(this).css('cursor', 'none');
		}
	});*/
});

if(extension)
	chrome.storage.onChanged.addListener(sync);
	
function sync() {
	chrome.storage.sync.get('G', function(obj) {
		if(G != obj['G']) {
			G = obj['G'];
			console.log("G is now " + G);
		}
	});
	
	chrome.storage.sync.get('toggle', function(obj) {
		var toggle = obj['toggle'];
		if(!on && toggle) {
			turnOn();
		}
		if(on && !toggle) {
			turnOff();
		}
	});
}
function turnOn() {
	on = true;
	$('#pointer').css('opacity', opacity);
	$('#pointer').css('z-index', Z_INDEX);
	//$('#backdrop').css('z-index', Z_INDEX);
	$('*').css('cursor','none');
	
	console.log('Gravity on');
}
function turnOff() {
	on = false;
	$('#pointer').css('opacity', '0');
	$('#pointer').css('z-index', '-2');
	//$('#backdrop').css('z-index', '-2');
	$('*').css('cursor','auto');
	
	console.log('Gravity off');
}

function setWells() {
	var wellBox = false;
	if(wellBoxes) {
		wellBox = true;
		wellBoxes = false;
	}
	$('a').each(function(index, elem) {
		rect = this.getBoundingClientRect();
		if(wellBox)
			$('body').prepend('<div style="z-index:1; opacity:.5; background-color:red; position:fixed; width:' + 
					rect.width + 'px; height:' + rect.height + 'px; margin-left:' + (rect.left - offset.left) +
					'px; margin-top:' + (rect.top - offset.top) + 'px;"><//div>');
					
		wells[index] = this.getBoundingClientRect();
	});
}

function mouseTransform(x, y) {
	if(wells.length == 0) {
		opacity = NORM_OPACITY;
		return [x,y];
	}

	//console.log(x,y);
	var lenX = $(window).width();
	var lenY = $(window).height();
	
	//Find which Voronoi region this point (x,y) belongs to
	var well;
	var minDistSq = 1e16;
	for(var i = 0; i < wells.length; i++) {
		var midX = (wells[i].left + wells[i].right)/2;
		var midY = (wells[i].top + wells[i].bottom)/2;
		
		var distSq = (midX - x)*(midX - x) + (midY - y)*(midY - y);
		if(distSq < minDistSq) {
			minDistSq = distSq;
			well = wells[i];
		}
	}
	
	//Find border point of this Voronoi region that is radially aligned with (x,y)
	var cX = (well.left + well.right)/2;	//c: "center" of this Voronoi region
	var cY = (well.top + well.bottom)/2;
	var vX = x - cX;						//v: vector from c to (x,y)
	var vY = y - cY;
	var v = Math.sqrt(vX*vX + vY*vY);
	var uX = vX / v;						//u: unit length version of v
	var uY = vY / v;
	
	var d;									//d: distance to border
	
	//baseline is the viewport border
	if(x < cX)
		d = -cX / uX;
	else
		d = (lenX - cX) / uX;
	if(y < cY)
		d = Math.min(d, -cY / uY);
	else
		d = Math.min(d, (lenY - cY) / uY);
		
	//now check the potential borders due to other wells
	for(var i = 0; i < wells.length; i++) {
		var midX = (wells[i].left + wells[i].right)/2;
		var midY = (wells[i].top + wells[i].bottom)/2;
		
		//skip the well corresponding to this region
		if(midX == cX && midY == cY)
			continue;
		
		var wX = (midX - cX)/2;			//w: vector to closest border point with well i
		var wY = (midY - cY)/2;
		
		var t = (wX*wX + wY*wY) / (wX*uX + wY*uY);
		if(t > 0 && t < d)
			d = t;
	}
	
	var a; 								//a: distance to button edge
	if(x < cX)
		a = (well.left - cX) / uX;
	else
		a = (well.right - cX) / uX;
	if(y < cY)
		a = Math.min(a, (well.top - cY) / uY);
	else
		a = Math.min(a, (well.bottom - cY) / uY);
	
	a = Math.min(a, d);
		
	var b = a*(1 + G*(d-a)/(d-a + G*a)); //b: new button edge distance in mousespace
	var m1 = a/b;
	var m2 = (d - a)/(d - b);
	
	if(v < b) {
		x = cX + m1*vX;
		y = cY + m1*vY;
		opacity = WELL_OPACITY;
	}
	else {
		x = cX + (a + m2*(v - b))*uX;
		y = cY + (a + m2*(v - b))*uY;
		opacity = NORM_OPACITY;
	}
		
	return [Math.round(x), Math.round(y)];
}

function killmouse(e) {
	e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
}

//Code from stackoverflow.com
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}
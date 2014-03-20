/* Copyright Adrian Marple
 * 
 * Let the scroll area be given by a rectangle of width w and height h
 * If the offset of a thumb image is given by real number x,
 * the mid point is placed at f(x) and its height is given by g(x).
 * These values are governed by the following equations:
 *		r = h/w
 *		f(x) = w/(1 + e^ax)
 *		g(x) = he^(-bx^2)
 *		g(.5) = 2f(.5) - w
 * where e is Euler's number.
 *
 * Since w is given, this leave two degrees of freedom.
 * These are specified here.
 */
var b = .2;
var r = .3;

var click_thresh = 5;

var moving = false;
var click;
var startX;
var prevX;
var active_thumbscroll;

$(document).ready(function() {
	//initialization
	$('.thumbscroll *').hide();
	$('.thumb').show();
	$('.thumbscroll').data('offset', 0);
	$('.thumbscroll').css({
		'position': 'relative'
	});
	resize();
	
	//event handlers for scrolling
	$(window).mousedown(function(e) {
		$('.thumbscroll').each(function(i, t) {
			var rect = this.getBoundingClientRect();
			var w = rect.right - rect.left;
			var h = w*r;
			if(rect.left <= e.clientX && rect.right > e.clientX &&
			   rect.top  <= e.clientY && rect.top+h > e.clientY) {
				
				moving = true;
				click = true;
				startX = e.clientX;
				prevX = e.clientX;
				active_thumbscroll = $(t);
			}
		});
		return !moving; //stop default and propagation if moving
	});
	$(window).mouseup(function(e) {
		moving = false;
		
		if(click) {
			var imgs = active_thumbscroll.find('.thumb img');
			imgs.sort(function(a, b) {
				return $(a).css('z-index') - $(b).css('z-index');
			});
			
			imgs.each(function(i, elem) {
				var rect = this.getBoundingClientRect();
				if(rect.left <= e.clientX && rect.right  > e.clientX &&
				   rect.top  <= e.clientY && rect.bottom > e.clientY) {
					
					var a = $(this).parent().find('a');
					if(a.length > 0)
						window.location.href = a.attr('href');
				}
			});
		}
	});
	$(window).mousemove(function(e) {
		if(moving) {
			var diff = prevX - e.clientX;
			prevX = e.clientX;
			if(startX - e.clientX > click_thresh || e.clientX - startX > click_thresh)
				click = false;
			
			var t = active_thumbscroll;
			t.data('offset', t.data('offset') + diff/(r*t.width()));			
			render(t);
		}
		return !moving;
	});
});

function resize() {
	$('.thumbscroll').each(function(i, thumbscroll) {
		render($(thumbscroll));
	});
}

function render(thumbscroll) {
	var thumbs = thumbscroll.find('.thumb');
	var offset = thumbscroll.data('offset');
	var w = thumbscroll.width();
	var h = w*r;
	var a = -2 * Math.log(2/(1 + r*(Math.exp(b/-4))) - 1);
	
	//Display the description of the thumb with focus (if any)
	thumbscroll.find('p').hide();
	offset += .5;
	if(offset >= 0 && offset < thumbs.length) {
		var description = $(thumbs[Math.floor(offset)]).find('p');
		description.css({
			'position': 'absolute',
			'text-align': 'center',
			'width': w - 40,
			'top': h + 10,
			'display': 'block'
		});
		description.find('*').show();
		thumbscroll.height(Math.max(h*1.3, h + description.outerHeight() + 40));
	}
	else
		thumbscroll.height(h*1.3);
	offset -= .5;
	
	//Render each thumb image appropriately
	thumbs.each(function(index, elem) {
		var x = offset - index;
		var f = w/(1 + Math.exp(a*x));
		var g = h * Math.exp(-b*x*x);
		var zindex;
		if(.5 < x)
			zindex = index;
		else
			zindex = 2*thumbs.length - index;
		
		$(this).css('display', 'inline');
		
		var img = $(this).find('img');
		img.css({
			'position': 'absolute',
			//'width': g,
			'height': g,
			'top': (h - g)/2,
			'left': f - g/2,
			'z-index': zindex,
			'display': 'block'
		});
	});
}
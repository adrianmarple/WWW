
var b = .2;
var r = .3;
var thumbs;

$(document).ready(function() {
	//add mouse down, move, and up listeners
	$('.thumbscroll').css('position', 'relative');
	$('.thumbscroll *').hide();
	$('.thumb').show();
	$('.thumbscroll').data('x', 0);
	$('.thumbscroll').css({
		'user-select': 'none',
		'-moz-user-select': 'none',
	});
	
	$('.thumbscroll').mouseover(function(e) {
		$(this).data('startX', e.clientX);
	});
	$('.thumbscroll').mousemove(function(e) {
		var t = $(this);
		var diff = t.data('startX') - e.clientX;
		t.data('x', t.data('x') + diff/(r*t.width()));
		t.data('startX', e.clientX);
			
		render(t);
	});
	
	resize();
});

function resize() {
	$('.thumbscroll').each(function(i, thumbscroll) {
		render($(thumbscroll));
	});
}

function render(thumbscroll) {
	var thumbs = thumbscroll.find('.thumb');
	var x = thumbscroll.data('x');
	var w = thumbscroll.width();
	var h = w*r;
	var a = -2 * Math.log(2/(1 + r*(Math.exp(b/-4))) - 1);
	
	//Display the description of the thumb with focus (if any)
	thumbscroll.find('p').hide();
	x += .5;
	if(x >= 0 && x < thumbs.length) {
		var description = $(thumbs[Math.floor(x)]).find('p');
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
	x -= .5;
	
	//Render each thumb image appropriately
	thumbs.each(function(index, elem) {
		//render elem image based on x and index
		var f = w/(1 + Math.exp(a*(x-index)));
		var g = h * Math.exp(-b*(x-index)*(x-index));
		var zindex;
		if(index < x - .5)
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


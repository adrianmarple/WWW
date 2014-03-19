
var c = document.getElementById("background");
var ctx = c.getContext("2d");
var c1 = document.getElementById("instance1");
var ctx1 = c1.getContext("2d");
var c2 = document.getElementById("instance2");
var ctx2 = c2.getContext("2d");

var w = c1.width;
var h = c1.height;

var img = ctx1.getImageData(0,0,w,h);
randomFractal(img,8);

function draw() {
	ctx1.putImageData(img,0,0);
	applyFilter(img,8);
	applyFilter(img,9);
	applyFilter(img,8);
	ctx2.putImageData(img,0,0);
	applyFilter(img,5);
	applyFilter(img,5);
	applyFilter(img,5);
	tile(img,c,ctx);
}

function applyFilter(img, f) {
	switch(f)
	{
	case 0:							//null op
		break;
	case 1:							//translate
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var src = 4*(w*x + y)+1;
				var dst = 4*(w*((x+w/2)%w) + (y+h/2)%h);
				
				img.data[dst] = img.data[src] ;
			}
		}
		break;
	case 2:							//noise
		for (var i=0; i<img.data.length; i+=4) {
			var x = img.data[i]*.9 + Math.random()*.1;
			img.data[i] = x;
		}
		break;
	case 3:							//threshold
		for (var i=0; i<img.data.length; i+=4) {
			var x = img.data[i] - img.data[i]%16;
			img.data[i] = x;
		}
		break;
	case 4:							//brighten
		for (var i=0; i<img.data.length; i+=4) {
			var x = img.data[i]/256.;
			x = 2*x/(1-x);
			x = x/(1+x);
			x = x*255;
			img.data[i] = x;
		}
		break;
	case 5:							//darken
		for (var i=0; i<img.data.length; i+=4) {
			var x = img.data[i]/256.;
			x = .5*x/(1-x);
			x = x/(1+x);
			x = x*255;
			img.data[i] = x;
		}
		break;
	case 6:							//invert
		for (var i=0; i<img.data.length; i+=4) {
			var x = 255 - img.data[i];
			img.data[i] = x;
		}
		break;
	case 7:							//blur
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var src0 = 4*(w*x         + y)+1;
				var src1 = 4*(w*((x+1)%w) + y)+1;
				var src2 = 4*(w*((x+2)%w) + y)+1;
				var src3 = 4*(w*((x+3)%w) + y)+1;
				var src4 = 4*(w*((x+4)%w) + y)+1;
				var dst = src2-1;
				
				img.data[dst] = (img.data[src0] + 4*img.data[src1] + 6*img.data[src2] + 4*img.data[src3] + img.data[src4])/16;
			}
		}
		makeGrey(img);
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var src0 = 4*(w*x + y      )+1;
				var src1 = 4*(w*x + (y+1)%h)+1;
				var src2 = 4*(w*x + (y+2)%h)+1;
				var src3 = 4*(w*x + (y+3)%h)+1;
				var src4 = 4*(w*x + (y+4)%h)+1;
				var dst = src2-1;
				
				img.data[dst] = (img.data[src0] + 4*img.data[src1] + 6*img.data[src2] + 4*img.data[src3] + img.data[src4])/16;
			}
		}
		break;	
	case 8:							//logistic 1
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var i = 4*(w*x + y);
				var sine1 = Math.sin(2*(w/2-x)/w);
				var sine2 = Math.sin(2*(h/2-y)/h);
				var r = 3.5 +  .5*(sine1*sine1*sine2*sine2);
				img.data[i] = r*img.data[i]*(255-img.data[i])/255.;
			}
		}
		break;
	case 9:							//logistic 2
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var i = 4*(w*x + y);
				var sine1 = Math.sin(2*(w/2-x)/w);
				var sine2 = Math.sin(2*(h/2-y)/h);
				var r = 3   +    (sine1*sine1*sine2*sine2);
				img.data[i] = r*img.data[i]*(255-img.data[i])/255.;
			}
		}
		break;
	case 10:						//logistic 3
		for (var x=0; x<w; x++) {
			for (var y=0; y<h; y++) {
				var i = 4*(w*x + y);
				var sine1 = Math.sin(2*(w/2-x)/w);
				var sine2 = Math.sin(2*(h/2-y)/h);
				var r = 2.5 + 1.5*(sine1*sine1*sine2*sine2);
				img.data[i] = r*img.data[i]*(255-img.data[i])/255.;
			}
		}
		break;
	}
	makeGrey(img);
}


function randomFractal(img, n) {
	var x = Math.random()*256;
	img.data[0] = x;
	img.data[1] = x;
	img.data[2] = x;
	for (var i=1; i<=n ;i++) {
		var pow = Math.pow(2,(i-1));
		var rho = 1/(i*Math.sqrt(i));
		upsample(img,pow,pow);
		for (var j=0; j < img.data.length; j+=4) {
			x = Math.random()*rho*256;
			img.data[j] = x + img.data[j]*(1-rho);
			img.data[j+1] = x + img.data[j+1]*(1-rho);
			img.data[j+2] = x + img.data[j+2]*(1-rho);
		}
	}

}

function upsample(img, d1, d2) {
	
	for (var x=0; x<d1; x++) {
		for (var y=0; y<d2; y++) {
			var src1 = 4*(w*x + y) + 1;
			var src2 = 4*(w*((x+1)%d1) + y) + 1;
			var src3 = 4*(w*x + (y+1)%d2) + 1;
			var src4 = 4*(w*((x+1)%d1) + (y+1)%d2) + 1;
			
			var dst1 = 4*(w*2*x + 2*y);
			var dst2 = 4*(w*(2*x+1) + 2*y);
			var dst3 = 4*(w*2*x + 2*y+1);
			var dst4 = 4*(w*(2*x+1) + 2*y+1);
			
			img.data[dst1] = img.data[src1];
			img.data[dst2] = (img.data[src1] + img.data[src2])/2;
			img.data[dst3] = (img.data[src1] + img.data[src3])/2;
			img.data[dst4] = (img.data[src1] + img.data[src2] + img.data[src3] + img.data[src4])/4;
		}
	}
	makeGrey(img);
}

function makeGrey(img) {
	for (var i=0; i<img.data.length; i+=4) {
		img.data[i+1] = img.data[i];
		img.data[i+2] = img.data[i];
		img.data[i+3] = 255;
	}
}

function tile(img,c,ctx) {
	for (var i=0; i<c.width; i+=w) {
		for (var j=0; j<c.height; j+=h) {
			ctx.putImageData(img,i,j);
		}
	}
}

window.addEventListener("resize", setDimensions);
window.addEventListener("scroll", setDimensions);

function setDimensions() {
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	c.style.left=""+(window.pageXOffset)+"px";
	c.style.top=""+(window.pageYOffset)+"px";
	draw();
}
setDimensions();
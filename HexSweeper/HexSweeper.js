var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var instructions = document.getElementById("instructions");

var logo = new Image();
logo.src = 'HexSweeper/logo.png';
var mine = new Image();
mine.src = 'HexSweeper/mine.png';
var signature = new Image();
signature.src = 'Signature.png';
var background = new Image();
background.src = 'HexSweeper/background.jpg';
var orb1 = new Image();
orb1.src = 'HexSweeper/orb1.png';
var orb2 = new Image();
orb2.src = 'HexSweeper/orb2.png';
var orb4 = new Image();
orb4.src = 'HexSweeper/orb4.png';

grid = new Grid(16, 16, 99);

var click = false;
var move = false;
var instr = false;

var mobile = false;
if(detectmob())
	mobile = true;
	
var x = 0;
var y = 0;

function draw() {
	if(!grid.done)
		grid.endtime = Date.now();

	//background
	if(background.width != 0 && background.height != 0)
		for(var i = 0; i < c.width; i += background.width)
			for(var j = 0; j < c.height; j += background.height)
				ctx.drawImage(background, i, j);
	
	//actual hexes
	grid.draw();
	
	//menu bar
	ctx.fillStyle = "rgba(120,120,120,.7)";
	ctx.fillRect(0,0,c.width, 50);
	ctx.font = "bold 24px courier new";
	//mines left
	ctx.drawImage(mine, -10, -17);
	ctx.fillStyle = "#60F770";
	if(grid.mines - grid.marks < 0)
		ctx.fillStyle = "#FF0000";
	ctx.fillText(grid.mines - grid.marks, 50, 31);
	//reset "button"
	ctx.drawImage(logo, c.width/2 - 70,10);
	//time elapsed
	ctx.fillStyle = "#60F770";
	var elapsed = Math.floor((grid.endtime - grid.starttime)/1000);
	var txt = "";
	if(elapsed >= 3600)
		txt += Math.floor(elapsed/3600)+":";
	if(elapsed%3600 < 600)
		txt += "0";
	txt += Math.floor(elapsed/60)%60+":";
	if(elapsed%60 < 10)
		txt += "0";
	txt += elapsed%60;
	ctx.fillText(txt, c.width - 40 - 14*txt.length, 31);
	//instructions
	ctx.fillStyle = "black";
	ctx.fillText("?", c.width - 25, 31);
	if(instr) {
		ctx.fillStyle = "rgba(0,0,0,.7)";
		ctx.fillRect(0,0,c.width, c.height);
		instructions.style.display = 'block';
	}
	else
		instructions.style.display = 'none';
}

function mousedown(e) {
	if(!e) var e = window.event;
	x = e.pageX;
	y = e.pageY;
	if(y < 50) { //clicked over menu bar
		if(y < 40 && x > c.width/2 - 70  && x < c.width/2 + 85)
			grid.restart();
	}
	else {
		click = true;
		window.onmousemove = mousemove1;
		window.ontouchmove = mousemove1;
		if(e.which == 1) {
			setTimeout(function() {
					if(!move && click)
						grid.processClick(e.pageX, e.pageY, 3);
					click = false;
				}, 200);
		}
	}
}
function mousemove1(e) {
	if(!e) var e = window.event;
	if(move || Math.abs(e.pageX - x) > 20 || Math.abs(e.pageY - y) > 20) {
		move = true;
		grid.x -= x - e.pageX;
		grid.y -= y - e.pageY;
		x = e.pageX;
		y = e.pageY;
	}
}
function mousemove2(e) {
	if(!e) var e = window.event;
	if(e.pageX > c.width-25 && e.pageY < 40)
		instr = true;
	else
		instr = false;
}
	
function mouseup(e) {
	if(!e) var e = window.event;
	if(!move && click)
		grid.processClick(e.pageX, e.pageY, e.which);
			
	click = false;
	move = false;
	window.onmousemove = mousemove2;
	window.ontouchmove = mousemove1;
}
function keypress(e) {
	if(!e) var e = window.event;
	if(e.charCode == 32) //space
		grid.restart();
}


function Hex() {
    this.mine = false;
	this.marked = false;
	this.visible = false;
	this.visible2 = false;
	this.exist = false;
	this.x = 0;
	this.y = 0;
	
	this.neighbormines1 = 0;
	this.neighbormines2 = 0;
	this.neighbormarks1 = 0;
	this.neighbormarks2 = 0;

	this.mark = mark;
    function mark() {
        this.mark = !this.mark;
    }
	this.draw = draw;
	function draw(X, Y) {
		if (!this.exist)
			return;
			
		if(this.marked)
			ctx.drawImage(orb4, this.x + X, this.y + Y);
		else if(!this.visible)
			ctx.drawImage(orb1, this.x + X, this.y + Y);
		
		if(this.visible) {
			if(!this.marked)
				ctx.drawImage(orb2, this.x + X, this.y + Y);
			if(this.mine)
				ctx.drawImage(mine, this.x+9 + X, this.y+5 + Y);
			
			else if(this.visible2) {
				ctx.fillStyle = "rgb(222,222,222)";
				ctx.font = "bold italic 48px Times New Roman";
				var txt = this.neighbormines2 - this.neighbormarks2;
				if(txt == 0)
					{}//do nothing
				else if(txt < 0)
					ctx.fillText("?", this.x + 30 + X, this.y + 59 + Y);
				else if(txt < 10)
					ctx.fillText(txt, this.x + 30 + X, this.y + 59 + Y);
				else
					ctx.fillText(txt, this.x + 19 + X, this.y + 59 + Y);
			}
			else {
				switch(this.neighbormines1)
				{
				case 0:
					return;
				case 1:
					ctx.fillStyle = "rgb(0,120,150)";
					break;
				case 2:
					ctx.fillStyle = "green";
					break;
				case 3:
					ctx.fillStyle = "red";
					break;
				case 4:
					ctx.fillStyle = "#1010C0";
					break;
				case 5:
					ctx.fillStyle = "rgb(136,0,21)";
					break;
				case 6:
					ctx.fillStyle = "black";
					break;
				}
				ctx.font = "bold italic 48px Times New Roman";
				ctx.fillText(this.neighbormines1, this.x + 30 + X, this.y + 59 + Y);
			}
		}
	}
	
	this.ownClick = ownClick;
	function ownClick(x, y, which) {
		var d = (this.x+40-x)*(this.x+40-x) + (this.y+40-y)*(this.y+40-y);
		return d < 1500;
	}
}

function Grid(width, height, mines) {
	this.set = false;
	this.done = true;
	this.mines = mines;
	this.marks = 0;
	this.w = width;
	this.h = height;
	this.x = 80;
	this.y = 60;
	this.starttime = 0;
	this.endtime = 0;
	this.Hexes = [];
	
	this.getHex = getHex;
	function getHex(x,y) {
		return this.Hexes[(this.h+4)*(x+2) + y+2];
	}
	
	this.draw = draw;
	function draw() {
		
		for(var x = 0; x < this.w; x++) {
			for(var y = 0; y < this.h; y++) {
				this.getHex(x,y).draw(this.x,this.y);
			}
		}
	}
	
	this.processClick = processClick;
	function processClick(x, y, which) {
		if(this.done && this.set)
			return;
	
		for(var c = 0; c < this.w; c++) {
			for(var r = 0; r < this.h; r++) {
				var hex = this.getHex(c,r);
				if(hex.ownClick(x-this.x,y-this.y, which)) {
					if(which == 3 && !hex.visible) {
						hex.marked = !hex.marked;
						var change;
						if(hex.marked)
							change = 1;
						else
							change = -1;
							
						this.marks += change;
						this.markNeighbors(r,c,change);
					}
					if(which == 1 && hex.visible) {
						if(hex.neighbormines1 == hex.neighbormarks1) {
							var rows = [r,r,r+1,r-1,r+1,r-1];
							var cols = [c+1,c-1,c,c,c+1-2*(r%2),c+1-2*(r%2)];
						
							for(var i = 0; i < 6; i++) {
								var neighbor = this.getHex(cols[i], rows[i]);
								if(!neighbor.marked) {
									neighbor.visible = true;
									if(neighbor.mine) {
										this.hitObstacle();
										return;
									}
									if(neighbor.neighbormines1 == 0)
										this.propogateZeros(rows[i],cols[i]);
								}
							}
						}
					}
					if(which == 1 && !hex.marked) {
						if(!this.set) {
							this.setMines(r,c,this.mines);
							this.set = true;
						}
						hex.visible = true;
						if(hex.mine) {
							this.hitObstacle();
							return;
						}
						if(hex.neighbormines1 == 0)
							this.propogateZeros(r,c);
					}
				}
			}
		}
		
		if(this.gameComplete()) {
			this.done = true;
		}
		this.findVisible2(); 
	}
	
	this.restart = restart;
	function restart() {
		this.set = false;
		this.marks = 0;
		this.starttime = 0;
		this.endtime = 0;
		this.done = true;
		for(var x = 0; x < this.w; x++) {
			for(var y = 0; y < this.h; y++) {
				var hex = this.getHex(x,y);
				hex.visible = false;
				hex.visible2 = false;
				hex.marked = false;
				hex.mine = false;
				
				hex.neighbormines1 = 0;
				hex.neighbormines2 = 0;
				hex.neighbormarks1 = 0;
				hex.neighbormarks2 = 0;
			}
		}
	}
	
	this.setNeighbors1 = setNeighbors1;
	function setNeighbors1(r,c) {
		var rows = [r,r,r+1,r-1,r+1,r-1];
		var cols = [c+1,c-1,c,c,c+1-2*(r%2),c+1-2*(r%2)];
						
		for(var i = 0; i < 6; i++) {
			var neighbor = this.getHex(cols[i], rows[i]);
			neighbor.neighbormines1++;
		}
	}
	this.setNeighbors2 = setNeighbors2;
	function setNeighbors2(r,c) {
		var rows = [r+2,r+2,r+2,r+1,r+1,r+1,r+1,r,r,r,r,r-1,r-1,r-1,r-1,r-2,r-2,r-2];
		var cols = [c-1,c,c+1,c-1,c,c+1,c+2-4*(r%2),c-2,c-1,c+1,c+2,c-1,c,c+1,c+2-4*(r%2),c-1,c,c+1];
						
		for(var i = 0; i < 18; i++) {
			var neighbor = this.getHex(cols[i], rows[i]);
			neighbor.neighbormines2++;
		}
	}
	this.markNeighbors = markNeighbors;
	function markNeighbors(r, c, change) {
		var rows = [r+2,r+2,r+2,r+1,r+1,r+1,r+1,r,r,r,r,r-1,r-1,r-1,r-1,r-2,r-2,r-2];
		var cols = [c-1,c,c+1,c-1,c,c+1,c+2-4*(r%2),c-2,c-1,c+1,c+2,c-1,c,c+1,c+2-4*(r%2),c-1,c,c+1];
						
		for(var i = 0; i < 18; i++) {
			var neighbor = this.getHex(cols[i], rows[i]);
			neighbor.neighbormarks2 += change;
		}
		
		rows = [r,r,r+1,r-1,r+1,r-1];
		cols = [c+1,c-1,c,c,c+1-2*(r%2),c+1-2*(r%2)];
		
		for(var i = 0; i < 6; i++) {
			var neighbor = this.getHex(cols[i], rows[i]);
			neighbor.neighbormarks1 += change;
		}
	}
	
	this.findVisible2 = findVisible2;
	function findVisible2() {
		for(var r = 0; r < this.h; r++) {
			for(var c = 0; c < this.w; c++) {
				var hex = this.getHex(c,r);
				hex.visible2 = true;

				var rows = [r,r,r+1,r-1,r+1,r-1];
				var cols = [c+1,c-1,c,c,c+1-2*(r%2),c+1-2*(r%2)];

				for(var i = 0; i < 6; i++) {
					var hex2 = this.getHex(cols[i],rows[i]);
					//must be either a marker on a mine or visible
					if(!(hex2.marked && hex2.mine) && !hex2.visible && hex2.exist) {
						hex.visible2 = false;
						break;
					}
				}
			}
		}
	}
	
	this.propogateZeros = propogateZeros;
	function propogateZeros(r, c) {
		if(!this.getHex(c,r).exist)
			return;
	
		var rows = [r,r,r+1,r-1,r+1,r-1];
		var cols = [c+1,c-1,c,c,c+1-2*(r%2),c+1-2*(r%2)];

		for(var i = 0; i < 6; i++) {
			var hex = this.getHex(cols[i],rows[i]);
			if(hex.exist && !hex.visible && hex.neighbormines1 == 0) {			
				hex.visible = true;
				this.propogateZeros(rows[i],cols[i]);
			}
			hex.visible = true;
		}
	}
	
	this.setMines = setMines;
	function setMines(r, c, num) {
		while(num > 0) {
			var x = Math.floor((Math.random()*this.w));
			var y = Math.floor((Math.random()*this.h));
			
			var skip = false;
			var rows = [r,r,r,r+1,r-1,r+1,r-1];
			var cols = [c,c+1,c-1,c,c,c+1-2*(r%2),c+1-2*(r%2)];
			for(var i = 0; i < 7; i++) {
				if(y == rows[i] && x == cols[i]) {
					skip = true;
					break;
				}
			}
			if(skip)
				continue;
				
			if(!this.getHex(x,y).mine) {
				this.getHex(x,y).mine = true;
				this.setNeighbors1(y,x);
				this.setNeighbors2(y,x);
				num -= 1;
			}
		}
		this.starttime = Date.now();
		this.endtime = Date.now();
		this.done = false;
	}
	
	this.hitObstacle = hitObstacle;
	function hitObstacle() {
		this.done = true;
		for(var r = 0; r < this.h; r++) {
			for(var c = 0; c < this.w; c++) {
				var hex = this.getHex(c,r);
				if(!hex.marker || !hex.mine) {
					hex.visible = true;
					//hex.visible2 = true;
				}
			}
		}
	}
	this.gameComplete = gameComplete;
	function gameComplete() {
		for(var r = 0; r < this.h; r++) {
			for(var c = 0; c < this.w; c++) {
				var hex = this.getHex(c,r);
				if((!hex.visible && !hex.mine) || (hex.visible && hex.mine)) {
					return false;
				}
			}
		}
		//mark remaining mines
		for(var r = 0; r < this.h; r++) {
			for(var c = 0; c < this.w; c++) {
				var hex = this.getHex(c,r);
				if(hex.mine && !hex.marked) {
					hex.marked = true;
					this.marks++;
					this.markNeighbors(r,c,1);
				}
			}
		}
		return true;
	}
	
	for(var i = 0; i < (this.w+4)*(this.h+4); i++) {
		this.Hexes[i] = new Hex();
	}
	for(var x = 0; x < this.w; x++) {
		for(var y = 0; y < this.h; y++) {
			var hex = this.getHex(x,y);
			hex.x = 84*x - 42*(y%2);
			hex.y = 68*y;
			hex.exist = true;
		}
	}
}
window.onmousedown = mousedown;
window.onmousemove = mousemove2;
window.onmouseup = mouseup;

window.ontouchstart = mousedown;
window.ontouchmove = mousemove2;
window.ontouchend = mouseup;

window.onkeypress = keypress;
window.oncontextmenu = function(){return false};

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
setInterval(draw, 20);

function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
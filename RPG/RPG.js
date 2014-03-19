var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

CARD_W = 80;
CARD_H = 110;
CARD_GAP = 10;

var won = false;
var victory;
victory = document.createElement('audio');

var deck = new Deck();
var card = new Card("Cube", "Defender of the Polyverse.");
card.top = 1; card.left = 2; card.right = 3; card.bottom = 1;
deck.addCard(card);
card = new Card("Quizzle", "Wakes up a woman and goes to bed a broom.");
card.top = 3; card.left = 2; card.right = 1; card.bottom = 1;
deck.addCard(card);
card = new Card("Cthulhu", "Despair");
card.top = 1; card.left = 2; card.right = 1; card.bottom = 3;
deck.addCard(card);
card = new Card("G-Dragon", "Actually pretty powerful.");
card.top = 1; card.left = 4; card.right = 3; card.bottom = 2;
deck.addCard(card);
card = new Card("Squeee", "Pees uncontrollably with little provocation.");
card.top = 4; card.left = 2; card.right = 3; card.bottom = 1;
deck.addCard(card);
deck.x = 20;
deck.y = 20;

var NPC = new Deck();
card = new Card("Cube", "Defender of the Polyverse.");
card.top = 1; card.left = 2; card.right = 3; card.bottom = 1;
NPC.addCard(card);
card = new Card("Quizzle", "Wakes up a woman and goes to bed a broom.");
card.top = 2; card.left = 2; card.right = 3; card.bottom = 1;
NPC.addCard(card);
card = new Card("Cthulhu", "Despair");
card.top = 1; card.left = 2; card.right = 4; card.bottom = 1;
NPC.addCard(card);
card = new Card("G-Dragon", "Actually pretty powerful.");
card.top = 1; card.left = 1; card.right = 3; card.bottom = 1;
NPC.addCard(card);
card = new Card("Squeee", "Pees uncontrollably with little provocation.");
card.top = 1; card.left = 2; card.right = 3; card.bottom = 2;
NPC.addCard(card);
NPC.y = 20;
NPC.makeOpponent();

var tableau = new Tableau(deck, NPC);

function draw() {
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,c.width, c.height);
	
	if(tableau.PCscore + tableau.NPCscore == 9 && tableau.PCscore > 5 && !won) {
		console.log("check");
		won = true;
		victory.src = "sounds/Experiment 30 (Remix).mp3";
		victory.autoplay = true;
		victory.loop = true;
	}
	
	tableau.draw();
}

function click(e) {
	if(!e) var e = window.event;
	
	if(deck.click(e))
		return;
	if(tableau.click(e))
		return;
}

function Tableau(PC, NPC) {
	this.PC = PC;
	this.NPC = NPC;
	this.cards = [];
	this.gamma = 1;
	this.depth = 4;
	this.PCscore = 0;
	this.NPCscore = 0;
	
	this.x = 0;
	this.y = 0;
	
	this.move = function(player, depth) {
		var deck;
		var opp;
		if(player) {
			deck = this.NPC;
			opp = this.PC;
		}
		else {
			deck = this.PC;
			opp = this.NPC;
		}
			
		if(this.PCscore + this.NPCscore == 9) {
			var realPCscore = this.PCscore + deck.size();
			var realNPCscore = this.NPCscore + opp.size();
			
			if(realPCscore == realNPCscore)
				return 1;			
			if((realPCscore > realNPCscore) == player)
				return Math.exp(this.gamma);
			else
				return Math.exp(-this.gamma);
		}
		
		if(depth >= this.depth) {
			var score = (this.PCscore + deck.size() - (this.NPCscore + opp.size()))/9;
			if(player)
				score *= -1;
			return Math.exp(this.gamma*score);
		}
			
		var owners = [];
		for(var k = 0; k < 9; k++) {
			if(this.cards[k] != null)
				owners[k] = this.cards[k].owner;
		}
		
		var scores = [];
		var sum = 0;
		for(var c = 0; c < deck.size(); c++) {
			for(var i = 0; i < 3; i++) {
				for(var j = 0; j < 3; j++) {
					if(this.cards[3*i + j] != null) {
						scores[9*c + 3*i + j] = 0;
					}
					else {
						//make actual move
						var card = deck.cards[c];
						this.addCard(i,j, card);
						deck.removeCard(card);
						//recurse
						var score = 1/this.move(!player, depth+1);
						scores[9*c + 3*i + j] = score;
						sum += score;
						//restore state
						deck.cards.splice(c, 0, card);
						this.cards[3*i + j] = null;
						for(var k = 0; k < 9; k++) {
							if(this.cards[k] != null)
								this.cards[k].owner = owners[k];
						}
					}
				}
			}
		}
		if(depth > 0)
			return sum;
			
		var x = Math.random();
		for(var k = 0; k < scores.length; k++) {
			var norm_score = scores[k]/sum;
			if(norm_score > x) {
				var c = Math.floor(k/9);
				var i = Math.floor(k/3)%3;
				var j = k%3;
				
				var card = deck.cards[c];
				this.addCard(i,j, card);
				deck.removeCard(card);
				break;
			}
			else {
				x -= norm_score;
			}
		}
	}
	
	this.addCard = function(i, j, card) {
		this.cards[3*i + j] = card;
		
		var compare;
		if(i < 2) {
			compare = this.cards[3*(i+1) + j];
			if(compare != null && card.right > compare.left)
				compare.owner = card.owner;
		}
		if(i > 0) {
			compare = this.cards[3*(i-1) + j];
			if(compare != null && card.left > compare.right)
				compare.owner = card.owner;
		}
		if(j < 2) {
			compare = this.cards[3*i + j+1];
			if(compare != null && card.bottom > compare.top)
				compare.owner = card.owner;
		}
		if(j > 0) {
			compare = this.cards[3*i + j-1];
			if(compare != null && card.top > compare.bottom)
				compare.owner = card.owner;
		}
		
		this.PCscore = 0;
		this.NPCscore = 0;
		for(var i = 0; i < 9; i++) {
			var card = this.cards[i];
			if(card != null) {
				if(card.owner == 0)
					this.PCscore++;
				else
					this.NPCscore++;
			}
		}
	}
	
	this.draw = function() {
		deck.draw();
		NPC.x = c.width - 20 - CARD_W;
		NPC.draw();
		
		ctx.font = "bold 24px courier new";
		ctx.fillStyle = "#4040C0";
		ctx.fillText(this.PCscore + this.PC.size(), c.width/4, 50);
		ctx.fillStyle = "#C04040";
		ctx.fillText(this.NPCscore + this.NPC.size(), c.width*3/4, 50);
	
		this.x = c.width/2 - CARD_W*1.5 - CARD_GAP;
		this.y = c.height/2 - CARD_H*1.5 - CARD_GAP;
		
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				var card = this.cards[3*i + j];
				if(card == null) {
					ctx.fillStyle = "rgba(180,180,180,.3)";
					ctx.fillRect(this.x + i*(CARD_W+CARD_GAP), this.y + j*(CARD_H+CARD_GAP), CARD_W, CARD_H);
				}
				else {
					card.x = this.x + i*(CARD_W+CARD_GAP);
					card.y = this.y + j*(CARD_H+CARD_GAP);
					card.draw();
				}
			}
		}
	}
	
	this.click = function(e) {
		var x = e.pageX;
		var y = e.pageY;
		if(x < this.x || x > this.x+3*(CARD_W+CARD_GAP) || x < this.x || x > this.x+3*(CARD_W+CARD_GAP))
			return false;
			
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				if(x < this.x +i*(CARD_W+CARD_GAP) || x > this.x +i*(CARD_W+CARD_GAP)+CARD_W)
					continue;
				if(y < this.y +j*(CARD_H+CARD_GAP) || y > this.y +j*(CARD_H+CARD_GAP)+CARD_H)
					continue;
					
				var card = this.cards[3*i + j];
				if(card == null) {
					var sel = this.PC.getSelected();
					if(sel != null) {
						sel.selected = false;
						this.addCard(i, j, sel);
						this.PC.removeCard(sel);
						
						this.move(true, 0);
					}
				}
				return true;
			}
		}
		return true;
	}
}

function Deck() {
	this.cards = [];
	
	this.x = 0;
	this.y = 0;
	
	this.addCard = function(card) {
		this.cards[this.cards.length] = card;
	}
	this.removeCard = function(card) {
		var index = this.cards.indexOf(card);
		this.cards.splice(index,1);
	}
	this.size = function() {
		return this.cards.length;
	}
	this.makeOpponent = function() {
		for(var i = 0; i < this.cards.length; i++) {
			this.cards[i].owner = 1;
		}
	}
	this.getSelected = function() {
		for(var i = 0; i < this.cards.length; i++) {
			if(this.cards[i].selected)
				return this.cards[i];
		}
	}
	
	this.draw = function() {
		for(var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			card.x = this.x;
			card.y = this.y + (CARD_H + CARD_GAP)*i;
			card.draw();
		}
	}
	this.click = function(e) {
		var sel = this.getSelected();
		if(sel != null) {
			return sel.click(e);
		}
	
		for(var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			if(card.click(e)) {
				//do nothing for now
				return true;
			}
		}
		return false;
	}
}

function Card(name, description) {
	this.name = name;
	this.description = description;
	this.type = 0;
	this.owner = 0;
	this.selected = false;
	
	this.exp = 0;
	this.top = 0;
	this.left = 0;
	this.right = 0;
	this.bottom = 0;
	
	this.x = 0;
	this.y = 0;
	
	this.draw = function() {
		if(this.selected) {
			ctx.fillStyle = "#A0A010";
			ctx.fillRect(this.x-3,this.y-3, CARD_W+6, CARD_H+6);
		}
		
	
		if(this.owner) {
			ctx.fillStyle = "#7F2020";
		}
		else {
			ctx.fillStyle = "#20207F";
		}
		ctx.fillRect(this.x,this.y, CARD_W, CARD_H);
		
		ctx.fillStyle = "black";
		ctx.fillRect(this.x+2,this.y+2, CARD_W - 4, CARD_H - 4);
		
		ctx.fillStyle = "white";
		ctx.font = "bold 14px courier new";
		ctx.fillText(this.top, this.x + 11, this.y + 14);
		ctx.fillText(this.left, this.x + 4, this.y + 25);
		ctx.fillText(this.right, this.x + 17, this.y + 25);
		ctx.fillText(this.bottom, this.x + 11, this.y + 36);
		ctx.fillText(name, this.x + CARD_GAP/2, this.y + CARD_H - CARD_GAP/2);
	}
	this.click = function(e) {
		var x = e.pageX;
		var y = e.pageY;
		if(x >= this.x && x < this.x+CARD_W && y >= this.y && y < this.y+CARD_H) {
			this.selected = !this.selected;
			return true;
		}
		return false;
	}
}


function drawImage(img, x, y) {
	ctx.drawImage(img, x, y);
}

window.onmouseup = click;

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

function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}
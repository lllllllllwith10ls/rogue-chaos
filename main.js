function change(x,y,char) {
	let game = document.getElementById("game").innerHTML;
	let pos = y*10+x-12;
	game = game.slice(0,pos) + char + game.slice(pos+1);
	document.getElementById("game").innerHTML = game;
	
}

let player = {
	xPos: 5,
	yPos: 5,
	move: function(dir) {
		change(this.xPos,this.yPos,".");
		if(dir === "left") {
			this.xPos -= 1;
		}
		if(dir === "right") {
			this.xPos += 1;
		}
		if(dir === "up") {
			this.yPos -= 1;
		}
		if(dir === "down") {
			this.yPos += 1;
		}
		if(this.x < 0) {
			this.xPos = 0;
		}
		if(this.y < 0) {
			this.yPos = 0;
		}
		if(this.x > 9) {
			this.xPos = 9;
		}
		if(this.y > 9) {
			this.yPos = 9;
		}
		change(this.xPos,this.yPos,"@");
	}
};

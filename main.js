function change(x,y,char) {
	let game = document.getElementById("game").innerHTML;
	let pos = x*10+y;
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
			this.yPos += 1;
		}
		if(dir === "down") {
			this.yPos -= 1;
		}
		change(this.xPos,this.yPos,"@");
	}
};

let camera = {};
for(let i = 1; i <= 9; i++) {
	camera[i] = {};
}

let things = [];
class Thing{
	constructor(char,color,map,x,y) {
		this.char = char;
		this.color = color;
		this.map = map;
		this.map.map[x][y] = this;
		things.push(this);
	}
	move(dx,dy) {
		if(!(this.posX+dx <= 0 || this.posY+dy <= 0 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY)) { 
			let x = this.posX;
			let y = this.posY;
			new Empty(this.map,x,y);
			this.map.map[x+dx][y+dy] = this;
		}
		
	}
	get posX() {
		for(let i in this.map.map) {
			if(Object.values(this.map.map[i]).includes(this)) {
				return parseInt(i);
			}
		}
		return "??";
	}
	get posY() {
		for(let i in this.map.map[this.posX]) {
			if(this.map.map[this.posX][i] === this) {
				return parseInt(i);
			}
		}
	}
	get inCamera() {
		if(this.map === camera.map && this.posX >= camera.x && this.posX < camera.x+9 && this.posY >= camera.y && this.posY < camera.y+9) {
			return true;
		}
		return false;
	}
	get relPosX() {
		if(this.inCamera) {
			return this.posX-camera.x;
		}
		return -1;
	}
	get relPosY() {
		if(this.inCamera) {
			return this.posY-camera.y;
		}
		return -1;
	}
}
class Empty extends Thing{
	constructor(map,x,y) {
		super(".","#ffffff",map,x,y);
	}
}
class Wall extends Thing{
	constructor(color,map,x,y) {
		super("#",color,map,x,y);
	}
}
class Map{
	constructor(sizeX,sizeY) {
		this.map = {};
		for(let i = sizeX; i > 0; i--) {
			this.map[i] = {};
			for(let j = sizeY; j > 0; j--) {
				new Empty(this,i,j);
			}
		}
		this.sizeX = sizeX;
		this.sizeY = sizeY;
	}
}
let map = new Map(11,11);
let player = new Thing("@","#000000",map,6,6);
new Wall("#000000",map,5,5);
camera.map = map;
camera.x = 1;
camera.y = 1;
camera.draw = function() {
	for(let i = 1; i <= 9; i++) {
		for(let j = 1; j <= 9; j++) {
			this[i][j] = this.map.map[this.x+i][this.y+j];
			let el = document.getElementById(""+i+j);
			el.innerHTML = this[i][j].char;
			el.color = this[i][j].color;
		}
	}
}
function move(dir) {
	if(dir === "left") {
		let thing = player.map.map[player.posX-1][player.posY];
		if(!(thing instanceof Wall)) {
			player.move(-1,0);
		}
	}
	if(dir === "right") {
		let thing = player.map.map[player.posX+1][player.posY];
		if(!(thing instanceof Wall)) {
			player.move(1,0);
		}
	}
	if(dir === "up") {
		let thing = player.map.map[player.posX][player.posY-1];
		if(!(thing instanceof Wall)) {
			player.move(0,-1);
		}
	}
	if(dir === "down") {
		let thing = player.map.map[player.posX][player.posY+1];
		if(!(thing instanceof Wall)) {
			player.move(0,1);
		}
	}
	let relpos = 0;
	if(player.relPosX < 3) {
		camera.x+=player.relPosX-3;
	}
	if(player.relPosY < 3) {
		camera.y+=player.relPosY-3;
	}
	if(player.relPosX > 7) {
		camera.x-=player.relPosX-7;
	}
	if(player.relPosY > 7) {
		camera.y-=player.relPosY-7;
	}
	camera.draw();
}

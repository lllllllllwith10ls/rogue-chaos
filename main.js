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
	get posX() {
		let result = 0;
		for(let i in this.map.map) {
			if(Object.values(this.map.map[i]).includes(this)) {
				result = parseInt(i);
				break;
			}
		}
		if(this.map.world) {
			result = result+this.map.posX*11;
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
		if(this.map.world && camera.map.world) {
			if(this.map.world === camera.map.world && this.posX >= camera.x+camera.map.posX*11 && this.posY >= camera.y+camera.map.posY*11 && this.posX < camera.x+camera.map.posX*11+9 &&  this.posY < camera.y+camera.map.posY*11+9) {
				return true;
			}
		} else if(this.map === camera.map && this.posX >= camera.x && this.posX < camera.x+9 && this.posY >= camera.y && this.posY < camera.y+9) {
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
let places = [];
class Map{
	constructor(sizeX,sizeY) {
		this.map = {};
		for(let i = sizeX; i > 0; i--) {
			this.map[i] = {};
			for(let j = sizeY; j > 0; j--) {
				if(Math.random > 0.8) {
					new Wall(this,i,j);
				} else {
					new Empty(this,i,j);
				}
			}
		}
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		places.push(this);
	}
}
class World{
	constructor() {
		this.map = {};
	}
}
class Chunk{
	constructor(x,y,world) {
		this.map = {};
		for(let i = 11; i > 0; i--) {
			this.map[i] = {};
			for(let j = 11; j > 0; j--) {
				if(Math.random > 0.8) {
					new Wall(this,i,j);
				} else {
					new Empty(this,i,j);
				}
			}
		}
		this.world = world;
		if(!world.map[x]) {
			world.map[x] = {};
		}
		world.map[x][y] = this;
	}
	get posX() {
		for(let i in this.world.map) {
			if(Object.values(this.world.map[i]).includes(this)) {
				return parseInt(i);
			}
		}
		return "??";
	}
	get posY() {
		for(let i in this.world.map[this.posX]) {
			if(this.world.map[this.posX][i] === this) {
				return parseInt(i);
			}
		}
	}
}
let world = new World();
let map = new Chunk(0,0,world);
let player = new Thing("@","#000000",map,6,6);
player.move = function(dx,dy) {
	if(!(this.posX+dx < 1 || this.posY+dy < 1 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY)) { 
		let thing = player.map.map[player.posX+dx][player.posY+dy];
		if(!(thing instanceof Wall)) {
			let x = this.posX;
			let y = this.posY;
			new Empty(this.map,x,y);
			this.map.map[x+dx][y+dy] = this;
		}
	}
}
new Wall("#000000",map,5,5);
camera.map = map;
camera.x = 2;
camera.y = 2;
camera.draw = function() {
	if(camera.map.world) {
		for(let i = -1; i <= 1; i++) {
			for(let j = -1; j <= 1; j++) {
				for(let k = 1; k <= 9; k++) {
					for(let l = 1; l <= 9; l++) {
						if(this.map.world.map[this.map.posX+i]) {
							let spot = this.map.world.map[this.map.posX+i][this.map.posY+j].map[k][l];
							let x = spot.relPosX;
							let y = spot.relPosY;
							if(spot.inCamera) {
								this[x][y] = spot;
							}
							let el = document.getElementById(""+x+y);
							el.innerHTML = this[x][y].char;
							el.style.color = this[x][y].color;
						}
					}
				}
			}
		}
	}else {
		for(let i = 1; i <= 9; i++) {
			for(let j = 1; j <= 9; j++) {
				this[i][j] = this.map.map[this.x+i-1][this.y+j-1];
				let el = document.getElementById(""+i+j);
				el.innerHTML = this[i][j].char;
				el.style.color = this[i][j].color;
			}
		}
	}
}
function move(dir) {
	if(dir === "left") {
		player.move(-1,0);
	}
	if(dir === "right") {
		player.move(1,0);
	}
	if(dir === "up") {
		player.move(0,-1);
	}
	if(dir === "down") {
		player.move(0,1);
	}
	let relpos = 0;
	if(camera.map.world) {
		if(player.relPosX < 3) {
			if(camera.x + player.relPosX-3 < 1) {
				new Chunk(player.map.posX-1,player.map.posY,player.map.world);
				camera.x+=player.relPosX-3;
			} else {
				camera.x+=player.relPosX-3;
			}
			if(camera.x < 1) {
				camera.x += 9;
				camera.map = camera.map.world.map[camera.map.posX-1][camera.map.posY];
			}
		}
		if(player.relPosY < 3) {
			if(camera.y + player.relPosY-3 < 1) {
				new Chunk(player.map.posX,player.map.posY-1,player.map.world);
				camera.y+=player.relPosY-3;
			} else {
				camera.y+=player.relPosY-3;
			}
			if(camera.y < 1) {
				camera.y += 9;
				camera.map = camera.map.world.map[camera.map.posX][camera.map.posY-1];
			}
		}
		if(player.relPosX > 7) {
			if(camera.x + player.relPosX+1 < 1) {
				new Chunk(player.map.posX+1,player.map.posY,player.map.world);
				camera.x+=player.relPosX-7;
			} else {
				camera.x+=player.relPosX-7;
			}
			if(camera.x > 9) {
				camera.x -= 9;
				camera.map = camera.map.world.map[camera.map.posX+1][camera.map.posY];
			}
		}
		if(player.relPosY > 7) {
			if(camera.y + player.relPosY+1 < 1) {
				new Chunk(player.map.posX,player.map.posY+1,player.map.world);
				camera.y+=player.relPosY-7;
			} else {
				camera.y+=player.relPosY-7;
			}
			if(camera.y > 9) {
				camera.y -= 9;
				camera.map = camera.map.world.map[camera.map.posX][camera.map.posY+1];
			}
		}
	} else {
		if(player.relPosX < 3) {
			if(!(camera.x + player.relPosX-3 < 1)) {
				camera.x+=player.relPosX-3;
			}
		}
		if(player.relPosY < 3) {
			if(!(camera.y + player.relPosY-3 < 1)) {
				camera.y+=player.relPosY-3;
			}
		}
		if(player.relPosX > 7) {
			if(!(camera.x + player.relPosX+1 > player.map.sizeX)) {
				camera.x+=player.relPosX-7;
			}
		}
		if(player.relPosY > 7) {
			if(!(camera.y + player.relPosY+1 > player.map.sizeX)) {
				camera.y+=player.relPosY-7;
			}
		}
	}
	camera.draw();
}

let camera = {};
camera.size = 29;
for(let i = 1; i <= camera.size; i++) {
	camera[i] = {};
}

let things = [];
function cleanThings() {
	for(let i = things.length-1; i >= 0; i--) {
		if(isNaN(things[i].posX) || isNaN(things[i].posY)) {
			things.splice(i,1);
		}
	}
	for(let i = places.length-1; i >= 0; i--) {
		if(!places[i].map) {
			places.splice(i,1);
		}
	}
}
class Thing{
	constructor(char,color,map,x,y) {
		this.char = char;
		this.color = color;
		this.map = map;
		this.map.map[x][y] = this;
		things.push(this);
	}
	get posX() {
		let result = this.chunkPosX;
		
		if(this.map.world) {
			result = result+this.map.posX*chunkSize;
		}
		return result
	}
	get posY() {
		let result = this.chunkPosY;
		
		if(this.map.world) {
			result = result+this.map.posY*chunkSize;
		}
		return result
	}
	get chunkPosX() {
		for(let i in this.map.map) {
			if(Object.values(this.map.map[i]).includes(this)) {
				return parseInt(i);
			}
		}
	}
	get chunkPosY() {
		for(let i in this.map.map[this.chunkPosX]) {
			if(this.map.map[this.chunkPosX][i] === this) {
				return parseInt(i);
			}
		}
	}
	get inCamera() {
		if(this.map.world && camera.map.world) {
			if(this.map.world === camera.map.world && this.posX >= camera.x+camera.map.posX*chunkSize && this.posY >= camera.y+camera.map.posY*chunkSize && this.posX < camera.x+camera.map.posX*chunkSize+camera.size &&  this.posY < camera.y+camera.map.posY*chunkSize+camera.size) {
				return true;
			}
		} else if(this.map === camera.map && this.posX >= camera.x && this.posX < camera.x+camera.size && this.posY >= camera.y && this.posY < camera.y+camera.size) {
			return true;
		}
		return false;
	}
	get relPosX() {
		if(this.inCamera) {
			if(this.map.world && camera.map.world) {
				return this.posX-(camera.x+camera.map.posX*chunkSize)+1;
			} else {
				return this.posX-camera.x+1;
			}
		}
		return -1;
	}
	get relPosY() {
		if(this.inCamera) {
			if(this.map.world && camera.map.world) {
				return this.posY-(camera.y+camera.map.posY*chunkSize)+1;
			} else {
				return this.posY-camera.x+1;
			}
		}
		return -1;
	}
}
class Tile{
	constructor(char,color,world,type) {
		this.char = char;
		this.color = color;
		this.world = world;
		this.type = type;
		if(!world[this.type]) {
			world[this.type] = this;
		}
	}
}
let places = [];
let chunkSize = 32;
class Map{
	constructor(sizeX,sizeY) {
		this.map = {};
		for(let i = sizeX; i > 0; i--) {
			this.map[i] = {};
			for(let j = sizeY; j > 0; j--) {
				if(Math.random > 0.5) {
					this.map[i][j] = "wall";
				} else {
					this.map[i][j] = "empty";
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
		this.seed = Math.floor(Math.random()*4294967296);
		this.wall = null;
		this.empty = null;
	}
}
class Chunk{
	constructor(x,y,world) {
		this.map = {};
		if(!world.map[x]) {
			world.map[x] = {};
		}
		if(!world.map[x][y]) {
			world.map[x][y] = this;
			noiseSeed(world.seed);
			for(let i = chunkSize; i > 0; i--) {
				this.map[i] = {};
				for(let j = chunkSize; j > 0; j--) {
					
					if(perlin((x*chunkSize+i)/3,(y*chunkSize+j)/3) > 0.5) {
						this.map[i][j] = "wall";
					} else {
						this.map[i][j] = "empty";
					}
				}
			}
		} else {
			this.map = null;
		}
		this.world = world;
		if(!world.map[x]) {
			world.map[x] = {};
		}
		places.push(this);
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
camera.map = map;
camera.x = 2;
camera.y = 2;
let player = new Thing("@","#000000",map,camera.x+(camera.size-1)/2,camera.y+(camera.size-1)/2);
new Tile("#","#777777",world,"wall");
new Tile(".","#ffffff",world,"empty");
player.move = function(dx,dy) {
	if(this.map.world) {
		let x = this.chunkPosX;
		let y = this.chunkPosY;
		if(this.chunkPosX+dx > chunkSize) {
			new Chunk(this.map.posX+1,this.map.posY,this.map.world);
			let thing = this.map.world.map[this.map.posX+1][this.map.posY].map[x+dx-chunkSize][y+dy];
			if(!(thing === "wall")) {
				this.map.map[x][y] = "empty";
				this.map = this.map.world.map[this.map.posX+1][this.map.posY];
				this.map.map[x+dx-chunkSize][y+dy] = this;
			}
		} else if(this.chunkPosY+dy > chunkSize) {
			new Chunk(this.map.posX,this.map.posY+1,this.map.world);
			let thing = this.map.world.map[this.map.posX][this.map.posY+1].map[x+dx][y+dy+chunkSize];
			if(!(thing === "wall")) {
				this.map.map[x][y] = "empty";
				this.map = this.map.world.map[this.map.posX][this.map.posY+1];
				this.map.map[x+dx][y+dy-chunkSize] = this;
			}
		} else if(this.chunkPosX+dx < 1) {
			new Chunk(this.map.posX-1,this.map.posY,this.map.world);
			let thing = this.map.world.map[this.map.posX-1][this.map.posY].map[x+dx+chunkSize][y+dy];
			if(!(thing === "wall")) {
				this.map.map[x][y] = "empty";
				this.map = this.map.world.map[this.map.posX-1][this.map.posY];
				this.map.map[x+dx+chunkSize][y+dy] = this;
			}
		} else if(this.chunkPosY+dy < 1) {
			new Chunk(this.map.posX,this.map.posY-1,this.map.world);
			let thing = this.map.world.map[this.map.posX][this.map.posY-1].map[x+dx][y+dy+chunkSize];
			if(!(thing === "wall")) {
				this.map.map[x][y] = "empty";
				this.map = this.map.world.map[this.map.posX][this.map.posY-1];
				this.map.map[x+dx][y+dy+chunkSize] = this;
			}
		} else {
			let thing = this.map.map[x+dx][y+dy];
			if(!(thing === "wall")) {
				this.map.map[x][y] = "empty";
				this.map.map[x+dx][y+dy] = this;
			}
		}
	} else if(!(this.posX+dx < 1 || this.posY+dy < 1 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY)) { 
		let thing = this.map.map[this.posX+dx][this.posY+dy];
		if(!(thing === "wall")) {
			let x = this.posX;
			let y = this.posY;
			this.map.map[x][y] = "empty";
			this.map.map[x+dx][y+dy] = this;
		}
	}
}
camera.draw = function() {
	if(this.map.world) {
		for(let i = -1; i <= 1; i++) {
			for(let j = -1; j <= 1; j++) {
				for(let k = 1; k <= chunkSize; k++) {
					for(let l = 1; l <= chunkSize; l++) {
						
						new Chunk(this.map.posX+i,this.map.posY+j,this.map.world);
						let spot = this.map.world.map[this.map.posX+i][this.map.posY+j].map[k][l];
						let x = k+(camera.map.posX+i)*chunkSize-(camera.x+camera.map.posX*chunkSize)+1;
						let y = l+(camera.map.posY+j)*chunkSize-(camera.x+camera.map.posX*chunkSize)+1;
						if(x > 0 && x <= camera.size && y > 0 && y <= camera.size) {
							if(typeof spot === "string") {
								this[x][y] = this.map.world[spot];
							} else {
								this[x][y] = spot;
							}
						}
					}
				}
			}
		}
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(this[i][j].ai) {
					this[i][j].ai();
				}
			}
		}
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				let el = document.getElementById(""+i+","+j);
				el.innerHTML = this[i][j].char;
				el.style.color = this[i][j].color;
			}
		}
	} else {
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(typeof spot === "string") {
					this[i][j] = this.map.world[spot];
					let el = document.getElementById(""+i+","+j);
					el.innerHTML = this[i][j].char;
					el.style.color = this[i][j].color;
				} else {
					this[i][j] = spot;
					let el = document.getElementById(""+i+","+j);
					el.innerHTML = this[i][j].char;
					el.style.color = this[i][j].color;
				}
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
		if(player.relPosX < (camera.size-1)/2-3) {
			while(player.relPosX < (camera.size-1)/2-3) {
				camera.x--;
			}
			if(camera.x < 1) {
				camera.x += chunkSize;
				new Chunk(camera.map.posX-1,camera.map.posY,camera.map.world);
				camera.map = camera.map.world.map[camera.map.posX-1][camera.map.posY];
			}
		}
		if(player.relPosY < (camera.size-1)/2-3) {
			while(player.relPosY < (camera.size-1)/2-3) {
				camera.y--;
			}
			if(camera.y < 1) {
				camera.y += chunkSize;
				new Chunk(camera.map.posX,camera.map.posY-1,camera.map.world);
				camera.map = camera.map.world.map[camera.map.posX][camera.map.posY-1];
			}
		}
		if(player.relPosX > (camera.size-1)/2+3) {
			while(player.relPosX > (camera.size-1)/2-3) {
				camera.x++;
			}
			if(camera.x > chunkSize) {
				camera.x -= chunkSize;
				new Chunk(camera.map.posX+1,camera.map.posY,camera.map.world);
				camera.map = camera.map.world.map[camera.map.posX+1][camera.map.posY];
			}
		}
		if(player.relPosY > (camera.size-1)/2+3) {
			while(player.relPosY > (camera.size-1)/2-3) {
				camera.y++;
			}
			if(camera.y > chunkSize) {
				camera.y -= chunkSize;
				new Chunk(camera.map.posX,camera.map.posY+1,camera.map.world);
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
	cleanThings();
}
cleanThings();

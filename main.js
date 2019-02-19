let camera = {};
camera.size = 29;
for(let i = 1; i <= camera.size; i++) {
	camera[i] = {};
}

let things = [];
function cleanThings() {
	for(let i = things.length-1; i >= 0; i--) {
		if(!things[i]) {
			things.splice(i,1);
		} else if(isNaN(things[i].posX) || isNaN(things[i].posY) || things[i].dead) {
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
		if(!this.map.map[x]) {
			this.map.map[x] = {};
		}
		this.map.map[x][y] = this;
		things.push(this);
	}
	get posX() {
		for(let i in this.map.map) {
			if(Object.values(this.map.map[i]).includes(this)) {
				return parseInt(i);
			}
		}
	}
	get posY() {
		for(let i in this.map.map[this.posX]) {
			if(this.map.map[this.posX][i] === this) {
				return parseInt(i);
			}
		}
	}
	get inCamera() {
		if(this.map === camera.map && this.relPosX >= 1 && this.relPosY >= 1 && this.relPosX <= camera.size && this.relPosY <= camera.size) {
			return true;
		}
		return false;
	}
	get relPosX() {
		return this.posX-camera.x+1;
	}
	get relPosY() {
		return this.posY-camera.y+1;
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
class Map{
	constructor(sizeX,sizeY) {
		this.map = {};
		for(let i = sizeX; i > 0; i--) {
			this.map[i] = {};
			for(let j = sizeY; j > 0; j--) {
				if(Math.random() > 0.5) {
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
		places.push(this);
	}
	generate(x,y) {
		if(!this.map[x]) {
			this.map[x] = {};
		}
		if(!this.map[x][y]) {
			if(perlin(x/3,y/3) > 0.5) {
				this.map[x][y] = "wall";
			} else {
				this.map[x][y] = "empty";
				if(Math.random() > 0.99) {
					if(Math.random() > 0.8) {
						new Goblin(x,y,this);
					} else {
						new LargeRat(x,y,this);
					}
				}
			}
		}
	}
}

let map = new World();
camera.map = map;
camera.x = -14;
camera.y = -14;
let player = new Thing("@","#000000",map,0,0);
new Tile("#","#777777",map,"wall");
new Tile(".","#ffffff",map,"empty");
player.move = function(dx,dy) {
	if(!(this.posX+dx < 1 || this.posY+dy < 1 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY) || this.map instanceof World) { 
		if(!this.map.map[this.posX+dx][this.posY+dy]) {
			this.map.generate(this.posX+dx,this.posY+dy);
		}
		let thing = this.map.map[this.posX+dx][this.posY+dy];
		if(thing.fighter) {
			this.attack(thing.fighter);
		} else if(thing !== "wall") {
			let x = this.posX;
			let y = this.posY;
			this.map.map[x][y] = "empty";
			this.map.map[x+dx][y+dy] = this;
		}
	}
}
function lose() {
	log("Rip");
	move = function() {
		log("Rip");
	}
}
camera.update = function() {
	for(let i = 1; i <= this.size; i++) {
		for(let j = 1; j <= this.size; j++) {
			if(!this.map.map[this.x+i]) {
				this.map.generate(this.x+i,this.y+j);
			}
			if(!this.map.map[this.x+i][this.y+j]) {
				this.map.generate(this.x+i,this.y+j);
			}
			let spot = this.map.map[this.x+i][this.y+j];
			if(typeof spot === "string") {
				this[i][j] = this.map[spot];
			} else {
				this[i][j] = spot;
			}
			if((i === 1 || j === 1 || i === this.size || j === this.size) && spot.name === "large rat") {
				this.map.map[this.x+i][this.y+j] = "empty";
				this[i][j] = this.map.empty;
			}
		}
	}
}
camera.draw = function() {
	this.update();
	for(let i = 2; i < this.size; i++) {
		for(let j = 2; j < this.size; j++) {
			let el = document.getElementById(""+i+","+j);
			el.innerHTML = this[i-1][j-1].char;
			el.style.color = this[i-1][j-1].color;
		}
	}
}
let logged = [];

function log(str) {
	if(Array.isArray(str)) {
		logged.push(str[Math.floor(Math.random()*str.length)]);
	} else {
		logged.push(str);
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
	for(let i = 1; i <= camera.size; i++) {
		for(let j = 1; j <= camera.size; j++) {
			if(camera[i][j].ai) {
				camera[i][j].ai.move();
			} else if(camera[i][j] === camera.map.empty && (i <= 2 || i >= camera.size-1) && (j <= 2 || j >= camera.size-1)) {
				if(Math.random() > 0.99) {
					if(Math.random() > 0.8) {
						camera[i][j] = new Goblin(i,j,camera.map);
						camera.map.map[camera.x+i][camera.y+j] = new Goblin(i,j,camera.map);
						camera[i][j].ai.move();
					} else {
						camera[i][j] = new LargeRat(i,j,camera.map);
						camera.map.map[camera.x+i][camera.y+j] = new LargeRat(i,j,camera.map);
						camera[i][j].ai.move();
					}
				}
			}
		}
	}
	
	if(player.relPosX < camera.size/2+.5-3) {
		if(!(camera.x + player.relPosX-camera.size/2+.5-3 < 1) || player.map instanceof World) {
			camera.x+=player.relPosX-(camera.size/2+.5-3);
		}
	}
	if(player.relPosY < camera.size/2+.5-3) {
		if(!(camera.y + player.relPosY-camera.size/2+.5-3 < 1) || player.map instanceof World) {
			camera.y+=player.relPosY-(camera.size/2+.5-3);
		}
	}
	if(player.relPosX > camera.size/2+.5+3) {
		if(!(camera.x + player.relPosX+1 > player.map.sizeX) || player.map instanceof World) {
			camera.x+=player.relPosX-(camera.size/2+.5+3);
		}
	}
	if(player.relPosY > camera.size/2+.5+3) {
		if(!(camera.y + player.relPosY+1 > player.map.sizeX) || player.map instanceof World) {
			camera.y+=player.relPosY-(camera.size/2+.5+3);
		}
	}
	let log = document.getElementById("log");
	log.innerHTML = "";
	for(let i = 0; i < logged.length; i++) {
		log.innerHTML += logged[i]+"</br>";
	}
	logged = [];
	cleanThings();
	
	camera.draw();
	
	player.fighter.regenTime++;
	if(player.fighter.regenTime >= 5) {
		player.fighter.hp++;
	}
	if(player.fighter.hp > player.fighter.maxHp) {
		player.fighter.hp = player.fighter.maxHp;
	}
	document.getElementById("stats").innerHTML = "HP: "+player.fighter.hp+"/"+player.fighter.maxHp;
}
cleanThings();

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
		for(let i in this.map.map[this.chunkPosX]) {
			if(this.map.map[this.chunkPosX][i] === this) {
				return parseInt(i);
			}
		}
	}
	get inCamera() {
		if(this.map === camera.map && this.relPosX > 1 && this.relPosY > 1 && this.relPosX < camera.size && this.relPosY < camera.size) {
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
				this.map[i][j] = "wall";
			} else {
				this.map[i][j] = "empty";
				if(Math.random() > 0.99) {
					new LargeRat(x,y,this);
				}
			}
		}
	}
}

let map = new World();
camera.map = map;
camera.x = 2;
camera.y = 2;
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
camera.draw = function() {
	for(let i = 1; i <= this.size; i++) {
		for(let j = 1; j <= this.size; j++) {
			if(!this.map[this.x+i]) {
				this.map.generate(this.x+i,this.y+j);
			}
			if(!this.map[this.x+i][this.y+j]) {
				this.map.generate(this.x+i,this.y+j);
			}
			let spot = this.map[this.x+i][this.y+j];
			let x = i + this.x;
			let y = j + this.y;
			if(typeof spot === "string") {
				this[x][y] = this.map[spot];
			} else {
				this[x][y] = spot;
			}
			if((i === 1 || j === 1 || i === this.size || j === this.size) && spot.name === "large rat") {
				this.map[this.x+i][this.y+j] = "empty";
				this[x][y] = this.map.empty;
			}
		}
	}
	for(let i = 2; i <= this.size; i++) {
		for(let j = 2; j <= this.size; j++) {
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
			} else if(camera[i][j] === camera.map.empty) {
				if(Math.random() > 0.99) {
					camera[i][j] = new LargeRat(i,j,this);
					camera[i][j].ai.move();
				}
			}
		}
	}
	
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
	let log = document.getElementById("log");
	log.innerHTML = "";
	for(let i = 0; i < logged.length; i++) {
		log.innerHTML += logged[i]+"</br>";
	}
	logged = [];
	cleanThings();
	
	camera.draw();
	document.getElementById("stats").innerHTML = "HP: "+player.fighter.hp+"/"+player.fighter.maxHp;
}
cleanThings();

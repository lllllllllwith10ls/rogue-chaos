let marker = new Tile("#","#0000ff",world,"debug");
function pathfind(object,target) {
	if(object.inCamera) {
		let array = [];
		for(let i = 1; i <= camera.size; i++) {
			array[i] = [];
			for(let j = 1; j <= camera.size; j++) {
				array[i][j] = camera[i][j];
			}
		}
		let x = object.relPosX;
		let y = object.relPosY;

		for(let i = 1; i < array.length; i++) {
			for(let j = 1; j < array.length; j++) {
				if(array[i][j]) {
					if(array[i][j].type === "wall" || array[i][j].ai) {
						array[i][j] = 9**9;
					}
				}
			}
		}
		console.log(array);
		
		array[x][y] = 0;
		let arrayCoords = [[x,y]];
		for(let i = 0; i < arrayCoords.length; i++) {
			arrayCoords = arrayCoords.concat(pathfindHelper(array,arrayCoords[i][0],arrayCoords[i][1]));
		}
		let path = [target.relPosX,target.relPosY];
		let path2 = [];
		if(typeof array[path[0]][path[1]] === "number") {
			while(true) {
				if(array[path[0]][path[1]] > 0) {
					path2 = [].concat(path);
					path = pathfindHelper2(array,path[0],path[1]);
					if(!path) {
						break;
					}
				} else {
					break;
				}
			}
		}
		object.move(path2[0],path2[1]);
	}
}
function pathfindHelper(array,x,y) {
	let coords = [];
	if(array[x-1]) {
		if(array[x-1][y]) {
			if(typeof array[x-1][y] != "number") {
				array[x-1][y] = array[x][y]+1;
				coords.push([x-1,y]);
			}
		}
	}
	if(array[x+1]) {
		if(array[x+1][y]) {
			if(typeof array[x+1][y] != "number") {
				array[x+1][y] = array[x][y]+1;
				coords.push([x+1,y]);
			}
		}
	}
	if(array[x][y-1]) {
		if(typeof array[x][y-1] != "number") {
			array[x][y-1] = array[x][y]+1;
			coords.push([x,y-1]);
		}
	}
	if(array[x][y+1]) {
		if(typeof array[x][y+1] != "number") {
			array[x][y+1] = array[x][y]+1;
			coords.push([x,y+1]);
		}
	}
	return coords;
}

function pathfindHelper2(array,x,y) {
	let coords = [];
	if(array[x-1]) {
		if(array[x-1][y]) {
			if(array[x-1][y] === array[x][y]-1) {
				coords.push([x-1,y]);
			}
		}
	}
	if(array[x+1]) {
		if(array[x+1][y]) {
			if(array[x+1][y] === array[x][y]-1) {
				coords.push([x+1,y]);
			}
		}
	}
	if(array[x][y-1]) {
		if(array[x][y-1] === array[x][y]-1) {
			coords.push([x,y-1]);
		}
	}
	if(array[x][y+1]) {
		if(array[x][y+1] === array[x][y]-1) {
			coords.push([x,y+1]);
		}
	}
	return coords[Math.floor(Math.random()*coords.length)];
}
class Monster extends Thing {
	constructor(char,color,map,x,y,ai,thePlayer,fighter,name) {
		super(char,color,map,x,y);
		this.ai = function() {
			ai(this,thePlayer);
		}
		this.fighter = fighter;
		this.name = name;
		this.move = function(dx,dy) {
			if(this.map.world) {
				let x = this.chunkPosX;
				let y = this.chunkPosY;
				if(this.chunkPosX+dx > chunkSize) {
					new Chunk(this.map.posX+1,this.map.posY,this.map.world);
					let thing = this.map.world.map[this.map.posX+1][this.map.posY].map[x+dx-chunkSize][y+dy];
					if(thing.fighter) {
						this.fighter.attack(thing.fighter);
					} else if(!(thing === "wall")) {
						this.map.map[x][y] = "empty";
						this.map = this.map.world.map[this.map.posX+1][this.map.posY];
						this.map.map[x+dx-chunkSize][y+dy] = this;
					}
				} else if(this.chunkPosY+dy > chunkSize) {
					new Chunk(this.map.posX,this.map.posY+1,this.map.world);
					let thing = this.map.world.map[this.map.posX][this.map.posY+1].map[x+dx][y+dy+chunkSize];
					if(thing.fighter) {
						this.fighter.attack(thing.fighter);
					} else if(!(thing === "wall")) {
						this.map.map[x][y] = "empty";
						this.map = this.map.world.map[this.map.posX][this.map.posY+1];
						this.map.map[x+dx][y+dy-chunkSize] = this;
					}
				} else if(this.chunkPosX+dx < 1) {
					new Chunk(this.map.posX-1,this.map.posY,this.map.world);
					let thing = this.map.world.map[this.map.posX-1][this.map.posY].map[x+dx+chunkSize][y+dy];
					if(thing.fighter) {
						this.fighter.attack(thing.fighter);
					} else if(!(thing === "wall")) {
						this.map.map[x][y] = "empty";
						this.map = this.map.world.map[this.map.posX-1][this.map.posY];
						this.map.map[x+dx+chunkSize][y+dy] = this;
					}
				} else if(this.chunkPosY+dy < 1) {
					new Chunk(this.map.posX,this.map.posY-1,this.map.world);
					let thing = this.map.world.map[this.map.posX][this.map.posY-1].map[x+dx][y+dy+chunkSize];
					if(thing.fighter) {
						this.fighter.attack(thing.fighter);
					} else if(!(thing === "wall")) {
						this.map.map[x][y] = "empty";
						this.map = this.map.world.map[this.map.posX][this.map.posY-1];
						this.map.map[x+dx][y+dy+chunkSize] = this;
					}
				} else {
					let thing = this.map.map[x+dx][y+dy];
					if(thing.fighter) {
						this.fighter.attack(thing.fighter);
					} else if(!(thing === "wall")) {
						this.map.map[x][y] = "empty";
						this.map.map[x+dx][y+dy] = this;
					}
				}
			} else if(!(this.posX+dx < 1 || this.posY+dy < 1 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY)) { 
				let thing = this.map.map[this.posX+dx][this.posY+dy];
				if(thing.fighter) {
					this.fighter.attack(thing.fighter);
				} else if(!(thing === "wall")) {
					let x = this.posX;
					let y = this.posY;
					this.map.map[x][y] = "empty";
					this.map.map[x+dx][y+dy] = this;
				}
			}
		}
	}
}
class Fighter {
	constructor(hp,power) {
		this.hp = hp;
		this.power = power;
		this.attack = function(enemy) {
			enemy.hp -= this.power;
		}
	}
}
player.fighter = new Fighter(30,3);
class LargeRat extends Monster{
	constructor(x,y) {
		super("%","#000000",map,x,y,pathfind,player,new Fighter(10,1),"Large Rat");
	}
}

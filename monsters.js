let marker = new Tile("#","#0000ff",world,"debug");
function dijkstra(target,desire,init) {
	if(target.inCamera) {
		let array = [];
		if(init) {
			array = init;
		} else {
			for(let i = 1; i <= camera.size; i++) {
				array[i] = [];
				for(let j = 1; j <= camera.size; j++) {
					array[i][j] = camera[i][j];
				}
			}
			let x = target.relPosX;
			let y = target.relPosY;

			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					if(array[i][j]) {
						if(array[i][j].type === "wall" || array[i][j].ai) {
							array[i][j] = NaN;
						} else {
							array[i][j] = 9^9;
						}
					}
				}
			}
		}
		let changed = false;
		while(changed) {
			changed = false;
			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					if(dijkstraHelper(array,i,j)) {
						changed = true;
					}
				}
			}
		}
		if(desire < 0) {
			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					array[i][j] *= -1.2;
				}
			}
			return dijkstra(target,-desire,array);
		} else {
			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					array[i][j] *= desire;
				}
			}
			return array;
		}
		
	}
	
}
function dijkstraHelper(array,x,y) {
	let numbers = [];
	if(array[x-1]) {
		if(array[x-1][y]) {
			if(typeof array[x-1][y] != "number") {
				numbers.push(array[x-1][y]);
			}
		}
	}
	if(array[x+1]) {
		if(array[x+1][y]) {
			if(typeof array[x+1][y] != "number") {
				numbers.push(array[x-1][y]);
			}
		}
	}
	if(array[x][y-1]) {
		if(typeof array[x][y-1] != "number") {
			numbers.push(array[x][y-1]);
		}
	}
	if(array[x][y+1]) {
		if(typeof array[x][y+1] != "number") {
			numbers.push(array[x][y+1]);
		}
	}
	let number = array[x][y];
	for(let i = 0; i < numbers.length; i++) {
		if(numbers[i] < number) {
			number = numbers[i];
		}
	}
	if(number === array[x][y]) {
		return false;
	} else {
		array[x][y] = number+1;
		return true;
	}
}

class Monster extends Thing {
	constructor(char,color,map,x,y,thePlayer,name) {
		super(char,color,map,x,y);
		this.name = name;
	}
	move(dx,dy) {
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
				this.ai.attack(thing.fighter);
			} else if(!(thing === "wall")) {
				let x = this.posX;
				let y = this.posY;
				this.map.map[x][y] = "empty";
				this.map.map[x+dx][y+dy] = this;
			}
		}
	}
}
class Fighter {
	constructor(hp,power,parent,die) {
		this.hp = hp;
		this.power = power;
		this.die = die;
		this.parent = parent;
	}
}
class RatAi {
	constructor(parent) {
		this.parent = parent;
		this.ratsDead = 0;
		this.timeSinceLastDeath = 0;
		this.notables = [];
		this.noted = [];
	}
	observe() {
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(this.noted.includes(camera[i][j]) || camera[i][j] === this.parent) {
					
				} else if(camera[i][j] instanceof LargeRat) {
					this.notables.push({thing:camera[i][j],desire:0.2});
					this.noted.push(camera[i][j]);
				} else if(camera[i][j] === player) {
					this.notables.push({thing:camera[i][j],desire:1});
					this.noted.push(camera[i][j]);
				}
			}
		}
		this.timeSinceLastDeath--;
		if(this.timeSinceLastDeath <= 0) {
			this.ratsDead--;
		}
		if(this.notables[this.noted.indexOf(player)]) {
			this.notables[this.noted.indexOf(player)].desire = 1-this.ratsDead*0.30;
			if(this.parent.fighter.hp < 25) {
				this.notables[this.noted.indexOf(player)].desire -= 2;
			}
		}
	}
	move() {
		this.observe();
		if(this.notables[0]) {
			let array = dijkstra(this.parent,this.notables[0].thing,this.notables[0].desire);
			for(let i = 1; i < this.notables.length; i++) {
				let array2 = dijkstra(this.parent,this.notables[i].thing,this.notables[i].desire)
				for(let j = 1; j < array.length; j++) {
					for(let k = 1; k < array.length; k++) {
						array[j][k] += array2[j][k];
					}
				}
			}
			let x = this.parent.relPosX;
			let y = this.parent.relPosY;
			let number = 9**9;
			let choose = [];
			if(array[this.parent-1]) {
				if(array[x-1][y]) {
					if(array[x-1][y] < number) {
						number = array[x-1][y];
						choose = [1];
					}
				}
			}
			if(array[x+1]) {
				if(array[x+1][y]) {
					if(array[x+1][y] < number) {
						number = array[x+1][y];
						choose = [2];
					} else if(array[x+1][y] === number){
						choose.push(2);
					}
				}
			}
			if(array[x][y-1]) {
				if(array[x][y-1] < number) {
					number = array[x][y-1];
					choose = [3];
				} else if(array[x][y-1] === number){
					choose.push(3);
				}
			}
			if(array[x][y+1]) {
				if(array[x][y+1] < number) {
					number = array[x][y+1];
					choose = [4];
				} else if(array[x][y+1] === number){
					choose.push(4);
				}
			}
			choose = choose[Math.floor(Math.random()*choose.length)];
			if(choose === 1) {
				this.parent.move(-1,0);
			} else if(choose === 2) {
				this.parent.move(1,0);
			} else if(choose === 3) {
				this.parent.move(0,-1);
			} else if(choose === 3) {
				this.parent.move(0,1);
			}
		}
	}
	attack(enemy) {
		if(!enemy instanceof LargeRat) {
			enemy.hp -= this.parent.fighter.power;
			if(enemy === player) {
				log(["The large rat bites you!","The large rat scratches you!","You get bitten by the large rat!"]);
			} else {
				log(["The large rat bites the "+enemy.parent.name+"!","The large rat scratches the "+enemy.parent.name+"!", "The "+enemy.parent.name+" gets bitten by the large rat!"]);
			}
			if(enemy.hp <= 0) {
				enemy.die();
				log("The "+enemy.parent.name+" dies!");
			}
		}
	}
}

player.fighter = new Fighter(30,3,"",player);
player.attack = function(enemy) {
	enemy.hp -= this.power;
	if(enemy.parent.size === "small") {
		log("You kick the "+enemy.parent.name+".");
	}
	if(enemy.hp <= 0) {
		enemy.die();
		log("The "+enemy.parent.name+" dies!");
	}
}
class LargeRat extends Monster{
	constructor(x,y) {
		super("%","#000000",map,x,y,player,"large rat");
		this.ai = new RatAi(this);
		function ded() {
			for(let i = 1; i <= camera.size; i++) {
				for(let j = 1; j <= camera.size; j++) {
					if(camera[i][j] instanceof LargeRat) {
						camera[i][j].ai.ratsDead++;
						camera[i][j].ai.timeSinceLastDeath = 5;
					}
				}
			}
		}
		this.fighter = new Fighter(10,1,this,ded);
		this.size = "small";
	}
}
monstersDefined = true;
for(let k = 0; k < places.length; k++) {
	if(places[k] instanceof Chunk) {
		let place = places[k] 
		for(let i = chunkSize; i > 0; i--) {
			for(let j = chunkSize; j > 0; j--) {
				if(Math.random() > 0.95 && place.map[i][j] === "empty") {
					new LargeRat(i,j);
				}
			}
		}
	}
}

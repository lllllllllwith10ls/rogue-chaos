let marker = new Tile("#","#0000ff",camera.map,"debug");
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
						if(array[i][j].type === "wall") {
							array[i][j] = undefined;
						} else {
							array[i][j] = 200;
						}
					}
				}
			}
			array[x][y] = 0;
		}
		let changed = true;
		while(true) {
			changed = false;
			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					let before = array[i][j];
					array[i][j] = dijkstraHelper(array,i,j);
					if(array[i][j] !== before) {
						changed = true;
					}
				}
			}
			if(changed === false) {
				break;
			}
		}
		if(desire < 0) {
			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					if(array[i][j] !== undefined) {
						array[i][j] *= -1.2
					}
				}
			}
			return dijkstra(target,-desire,array);
		} else {
			for(let i = 1; i < array.length; i++) {
				for(let j = 1; j < array.length; j++) {
					if(array[i][j] !== undefined) {
						array[i][j] *= desire;
					}
				}
			}
			return array;
		}
		
	}
	
}
function dijkstraHelper(array,x,y) {
	if(array[x][y] !== undefined) {
		let number = array[x][y];
		if(array[x-1]) {
			if(array[x-1][y] !== undefined) {
				if(array[x-1][y] < number) {
					number = array[x-1][y];
				}
			}
		}
		if(array[x+1]) {
			if(array[x+1][y] !== undefined) {
				if(array[x+1][y] < number) {
					number = array[x+1][y];
				}
			}
		}
		if(array[x][y-1] !== undefined) {
			if(array[x][y-1] < number) {
				number = array[x][y-1];
			}
		}
		if(array[x][y+1] !== undefined) {
			if(array[x][y+1] < number) {
				number = array[x][y+1];
			}
		}
		
		if(number >= array[x][y]) {
			return array[x][y];
		} else {
			return number+1;
		}
	}
}

class Monster extends Thing {
	constructor(char,color,map,x,y,thePlayer,name) {
		super(char,color,map,x,y);
		this.name = name;
	}
	move(dx,dy) {
		if(!(this.posX+dx < 1 || this.posY+dy < 1 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY) || this.map instanceof World) { 

			let x = this.posX;
			let y = this.posY;
			if(!this.map.map[x+dx][y+dy]) {
				this.map.generate(x+dx,y+dy);
			}
			let thing = this.map.map[x+dx][y+dy];
			if(thing.fighter) {
				this.ai.attack(thing.fighter);
			} else if(thing !== "wall") {
				this.map.map[x][y] = "empty";
				this.map.map[x+dx][y+dy] = this;
			}
		}
	}
}
class Fighter {
	constructor(hp,power,parent,die) {
		this.hp = hp;
		this.maxHp = hp;
		this.power = power;
		this.die = die;
		this.parent = parent;
		this.regenTime = 0;
	}
}
class MonsterAi {
	constructor(parent,loveDeviation,fearDeviation,fearOnKill,fearOnKillDeviation,hateDeviation,lovesAndHates) {
		this.parent = parent;
		this.notables = [];
		this.noted = [];
		this.fearOnKill = fearOnKill+(Math.random()-0.5)*2*fearOnKillDeviation;
		this.loveDeviation = loveDeviation;
		this.fearDeviation = fearDeviation;
		this.hateDeviation = hateDeviation;
		this.percievedStrength = 1;
		this.things = lovesAndHates;
	}
	observe() {
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(this.noted.includes(camera[i][j]) || camera[i][j] === this.parent) {
					
				} else if(camera[i][j].fighter) {
					this.notables.push({thing:camera[i][j]});
					this.noted.push(camera[i][j]);
				}
			}
		}
		this.percievedStrength = this.parent.fighter.hp*this.parent.fighter.power/5;
		for(let i = 0; i < this.notables.length; i++) {
			let name = this.noted.name;
			let friend = false;
			for(let j = 0; j < this.things.length; j++) {
				if(this.things[j].name === name && this.things[j].friend) {
					friend = true;
					break;
				}
			}
			if(friend) {
				let thing = this.noted[i];
				this.percievedStrength += thing.fighter.hp*thing.fighter.power/(Math.abs(this.parent.relPosX-thing.relPosX+thing.parent.relPosY-thing.relPosY)*20);
				
			}
		}
		for(let i = 0; i < this.notables.length; i++) {	
			let name = this.noted.name;
			let friend;
			let thingy;
			for(let j = 0; j < this.things.length; j++) {
				if(this.things[j].name === name && this.things[j].friend) {
					friend = true;
					thingy = this.things[j];
					break;
				}
				if(this.things[j].name === name && this.things[j].enemy) {
					friend = false;
					thingy = this.things[j];
					break;
				}
				if(this.things[j].name) {
					thingy = this.things[j];
					break;
				}
			}
			if(friend) {
				let thing = this.noted[i];
				if(!thing.baseLove) {
					this.notables[i].baseLove = thingy.baseLove+(Math.random()-0.5)*this.loveDeviation*2;
				}
				if(Math.abs(this.parent.relPosX-rat.relPosX+this.parent.relPosY-rat.relPosY) <= 2) {
					this.adjacent = true;
				} 
				if(this.adjacent) {
					this.notables[i].love = 0;
				} else {
					this.notables[i].love = thing.fighter.hp*thing.fighter.power*this.notables[i].baseLove/(this.parent.fighter.maxHp*this.parent.fighter.power);
				}
				
			} else if(!friend) {
				let thing = this.notables[i].thing;
				if(!this.notables[i].baseFear) {
					this.notables[i].baseFear = thingy.baseFear+(Math.random()-0.5)*this.fearDeviation*2;
				}
				if(!this.notables[i].baseHate) {
					this.notables[i].baseHate = thingy.baseHate+(Math.random()-0.5)*this.hateDeviation*2;
				}
				if(!this.notables[i].killed) {
					this.notables[i].killed = 0;
				}
				this.notables[i].fear = this.notables[i].baseFear * thing.fighter.hp*thing.fighter.power-this.percievedStrength+this.notables[i].killed*this.fearOnKill;
				this.notables[i].hate = this.notables[i].baseHate;
			}
			if(this.notables[i].love) {
				this.notables[i].desire = this.notables[i].love;
			} else if(this.notables[i].fear && this.notables[i].hate) {
				this.notables[i].desire = this.notables[i].hate-this.notables[i].fear;
			}
		}
	}
	cleanThings() {
		for(let i = this.noted.length-1; i >= 0; i--) {
			if(isNaN(this.noted[i].posX) || isNaN(this.noted[i].posY) || this.noted[i].dead) {
				this.noted.splice(i,1);
				this.notables.splice(i,1);
			}
		}
	}
	move() {
		camera.update();
		this.observe();
		this.cleanThings();
		if(this.notables[0]) {
			let array = dijkstra(this.notables[0].thing,this.notables[0].desire);
			for(let i = 1; i < this.notables.length; i++) {
				let array2 = dijkstra(this.notables[i].thing,this.notables[i].desire);
				if(array) {
					for(let j = 1; j < array.length; j++) {
						for(let k = 1; k < array.length; k++) {
							if(array2) {
								if(array[j] && array2[j]) {
									if(array[j][k] !== undefined && array2[j][k] !== undefined) {
										array[j][k] += array2[j][k];
									}
								}
							}
						}
					}
				} else {
					array = array2;
				}
			}
			let x = this.parent.relPosX;
			let y = this.parent.relPosY;
			if(this.parent.inCamera) {
				let number = 1000000000000000;
				let choose = [];
				if(array[x-1]) {
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
				} else if(choose === 4) {
					this.parent.move(0,1);
				}
			}
		}
		this.parent.fighter.regenTime++;
		if(this.parent.fighter.regenTime >= 5) {
			this.parent.fighter.hp++;
		}
		if(this.parent.fighter.hp > this.parent.fighter.maxHp) {
			this.parent.fighter.hp = this.parent.fighter.maxHp;
		}
	}
	attack(enemy) {
		let friend = false;
		for(let i = 0; i < this.things.length; i++) {
			if(this.things[i].name === name && this.things[i].friend) {
				friend = true;
				break;
			}
		}
		if(!friend) {
			enemy.hp -= this.parent.fighter.power;
			let string = " -"+this.parent.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
			if(enemy.parent === player) {
				log(this.getMessage(player,string));
			} else {
				log(this.getMessage(enemy.parent,string));
			}
			if(enemy.hp <= 0) {
				enemy.die();
				log("The "+enemy.parent.name+" dies!");
			}
			enemy.regenTime = 0;
		}
	}
	getMessage(enemy,string) {
		if(enemy === player) {
			return "you"+string;
		} else {
			return enemy.name+string;
		}
	}
}
class RatAi extends MonsterAi {
	constructor(parent) {
		let things = [
			{
				name: "player",
				enemy: true,
				baseHate: 3,
				baseFear: 0,
			},
			{
				name: "goblin",
				enemy: true,
				baseHate: 3,
				baseFear: 0,
			},
			{
				name: "large rat",
				friend: true,
				baseLove: 2,
			}
		]
		super(parent,3,4,3,2,3,things);
	}
	getMessage(enemy,string) {
		if(enemy === player) {
			return ["The large rat bites you!"+string,"The large rat scratches you!"+string,"You get bitten by the large rat!"+string];
		} else {
			return ["The large rat bites the "+enemy.name+"!"+string,"The large rat scratches the "+enemy.name+"!"+string,"The "+enemy.name+" gets bitten by the large rat!"+string];
		}
	}
	
}
class GoblinAi extends MonsterAi{
	constructor(parent) {
		let things = [
			{
				name: "player",
				enemy: true,
				baseHate: 5,
				baseFear: 0,
			},
			{
				name: "large rat",
				enemy: true,
				baseHate: 3,
				baseFear: 0,
			},
			{
				name: "goblin",
				friend: true,
				baseLove: 4,
			}
		]
		super(parent,2,3,4,2,2,things);
	}
	getMessage(enemy,string) {
		if(enemy === player) {
			return ["The goblin bites you!"+string,"The goblin kicks you!"+string,"The goblin bodyslams you!"+string];
		} else {
			if(enemy.size === "small") {
				return "The goblin kicks the "+enemy.parent.name+"!"+string;
			} else {
				return ["The goblin bites the "+enemy.parent.name+"!"+string,"The goblin kicks the "+enemy.parent.name+"!"+string,"The goblin bodyslams the "+enemy.parent.name+"!"+string];
			}
		}
	}
}


player.fighter = new Fighter(30,3,"",lose);
player.attack = function(enemy) {
	enemy.hp -= this.fighter.power;
	let string = " -"+this.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
	if(enemy.parent.size === "small") {
		log("You kick the "+enemy.parent.name+"!"+string);
	} else if(enemy.parent.size === "medium") {
		log(["You punch the "+enemy.parent.name+"!"+string,"You kick the "+enemy.parent.name+"!"+string,"You bodyslam the "+enemy.parent.name+"!"+string]);
	}
	if(enemy.hp <= 0) {
		enemy.die(this);
		log("The "+enemy.parent.name+" dies!");
	}
	enemy.regenTime = 0;
}
function ded(thing) {
	for(let i = 1; i <= camera.size; i++) {
		for(let j = 1; j <= camera.size; j++) {
			let thing2 = camera[i][j];
			let friend = false;
			for(let i = 0; i < thing.ai.things.length; i++) {
				if(thing.ai.things[i].name === thing2.name && thing.ai.things[i].friend) {
					friend = true;
					break;
				}
			}
			if(friend) {
				if(thing2.ai.noted.includes(thing)) {
					thing2.ai.notables[thing2.ai.noted.indexOf(thing)].killed+=(thing.fighter.maxHp+thing.fighter.power)/(thing2.fighter.maxHp+thing2.fighter.power);
				}
			}
		}
	}
	thing.parent.dead = true;
	thing.parent.map.map[thing.parent.posX][thing.parent.posY] = "empty";

}
class LargeRat extends Monster{
	constructor(x,y,map) {
		super("%","#000000",map,x,y,player,"large rat");
		this.ai = new RatAi(this);
		
		this.dead = false;
		this.fighter = new Fighter(10,1,this,ded);
		this.size = "small";
	}
}

class Goblin extends Monster{
	constructor(x,y,map) {
		super("g","#000000",map,x,y,player,"goblin");
		this.ai = new GoblinAi(this);
		
		this.dead = false;
		this.fighter = new Fighter(20,2,this,ded);
		this.size = "medium";
	}
}

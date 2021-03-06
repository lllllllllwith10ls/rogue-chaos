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
function path(ai) {
	let x = ai.parent.relPosX;
	let y = ai.parent.relPosY;
	let array = ai.pathfind();
	let array2 = [];
	for(let i = 1; i < array.length; i++) {
		array2[i] = []
		for(let j = 1; j < array[i].length; j++) {
			array2[i][j] = 0;
		}
	}
	while(true) {
		if(x < 1 || x > 29 || y < 1 || y > 29) {
			break;
		}
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
			array2[x][y] = 1;
			x = x-1;
		} else if(choose === 2) {
			array2[x][y] = 1;
			x = x-1;
		} else if(choose === 3) {
			array2[x][y] = 1;
			y = y-1;
		} else if(choose === 4) {
			array2[x][y] = 1;
			y = y+1;
		} else {
			array2[x][y] = 2;
			break;
		}
	}
	return array2;
}
class Monster extends Thing {
	constructor(char,color,map,x,y,thePlayer,name) {
		super(char,color,map,x,y);
		this.name = name;
		this.cooldown = 0;
		this.on = "empty";
	}
	move(dx,dy) {
		if(!(this.posX+dx < 1 || this.posY+dy < 1 || this.posX+dx > this.map.sizeX || this.posY+dy > this.map.sizeY) || this.map instanceof World) { 
			if(this.cooldown <= 0) {
				let x = this.posX;
				let y = this.posY;
				if(!this.map.map[x+dx][y+dy]) {
					this.map.generate(x+dx,y+dy);
				}
				let thing = this.map.map[x+dx][y+dy];
				if(thing.fighter) {
					this.ai.attack(thing.fighter);
				} else if(thing !== "wall") {
					this.map.map[x][y] = this.on;
					if(this.map.map[x+dx][y+dy] instanceof LootPile && this.ai.intelligent) {
						this.fighter.inventory = this.fighter.inventory.concat(this.map.map[x+dx][y+dy].stuff);
					} else if(this.map.map[x+dx][y+dy] instanceof LootPile && !this.ai.intelligent) {
						this.on = this.map.map[x+dx][y+dy]
					}
					this.map.map[x+dx][y+dy] = this;
				}
				if(this.map.map[x+dx*2][y+dy*2].fighter && this.fighter.weapon.weapon === "spear") {
					this.ai.attack(thing.fighter,true);
				}
			} else {
				this.cooldown--;
			}
		}
	}
}
class Fighter {
	constructor(hp,power,parent,die) {
		this.hp = hp;
		this.maxHp = hp;
		this.basePower = power;
		this.die = die;
		this.parent = parent;
		this.regenTime = 0;
		this.regenTime = 0;
		this.inventory = [];
		this.weapon = null;
	}
	get power() {
		if(this.weapon) {
			return this.basePower + this.weapon.damage;
		} else {
			return this.basePower;
		}
	}
	equip(weapon) {
		if(this.inventory.includes(weapon)) {
			this.weapon = weapon;
		}
	}
}
class MonsterAi {
	constructor(parent,loveDeviation,fearDeviation,fearOnKill,fearOnKillDeviation,hateDeviation,lovesAndHates,intelligent) {
		this.parent = parent;
		this.notables = [];
		this.noted = [];
		this.fearOnKill = fearOnKill+(Math.random()-0.5)*2*fearOnKillDeviation;
		this.loveDeviation = loveDeviation;
		this.fearDeviation = fearDeviation;
		this.hateDeviation = hateDeviation;
		this.percievedStrength = 1;
		this.things = lovesAndHates;
		this.intelligent = intelligent;
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
			let name = this.noted[i].name;
			let friend = false;
			for(let j = 0; j < this.things.length; j++) {
				if(this.things[j].name === name && this.things[j].friend) {
					friend = true;
					break;
				}
			}
			if(friend && this.noted[i].fighter) {
				let thing = this.noted[i];
				this.percievedStrength += thing.fighter.hp*thing.fighter.power/((Math.abs(this.parent.relPosX-thing.relPosX)+Math.abs(this.parent.relPosY-thing.relPosY))*20);
				
			}
		}
		this.adjacent = false;
		for(let i = 0; i < this.notables.length; i++) {	
			let name = this.noted[i].name;
			let friend;
			let thingy;
			for(let j = 0; j < this.things.length; j++) {
				if(this.things[j].name === name && this.things[j].friend) {
					friend = true;
					thingy = this.things[j];
					break;
				} else if(this.things[j].name === name && this.things[j].enemy) {
					friend = false;
					thingy = this.things[j];
					break;
				}
			}
			if(friend && this.noted[i].fighter) {
				let thing = this.noted[i];
				if(!thing.baseLove) {
					this.notables[i].baseLove = thingy.baseLove+(Math.random()-0.5)*this.loveDeviation*2;
				}
				if(Math.abs(this.parent.relPosX-thing.relPosX)+Math.abs(this.parent.relPosY-thing.relPosY) <= 2) {
					this.adjacent = true;
					for(let k = 0; k < this.notables.length; k++) {
						let friend2;
						for(let l = 0; l < this.things.length; l++) {
							if(this.things[l].name === name && this.things[l].friend) {
								friend2 = true;
								break;
							} else if(this.things[l].name === name && this.things[l].enemy) {
								friend2 = false;
								break;
							}
						}
						if(friend2) {
							this.notables[k].love = 0;
						}
					}
				} 
				if(this.adjacent) {
					this.notables[i].love = 0;
				} else {
					this.notables[i].love = thing.fighter.hp*thing.fighter.power*this.notables[i].baseLove/(this.parent.fighter.maxHp*this.parent.fighter.power);
				}
				this.notables[i].fear = undefined;
				this.notables[i].hate = undefined;
				
			} else if(friend && !this.noted[i].fighter) {
				this.notables[i].love = this.notables[i].baseLove;
				this.notables[i].fear = undefined;
				this.notables[i].hate = undefined;
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
				this.notables[i].love = undefined;
			}
			if(typeof(this.notables[i].love) === "number") {
				this.notables[i].desire = this.notables[i].love;
			} else if(typeof(this.notables[i].fear) === "number" && typeof(this.notables[i].hate) === "number") {
				this.notables[i].desire = this.notables[i].hate-this.notables[i].fear;
			}
		}
		let fighter = this.parent.fighter;
		if(fighter.weapon === null) {
			fighter.equip(fighter.inventory[0]);
		}
		for(let i = 0; i < fighter.inventory.length; i++) {
			let quality = 0;
			if(fighter.inventory[i].weapon = "axe") {
				quality = fighter.inventory[i].damage/2;
			} else {
				quality = fighter.inventory[i].damage;
			}
			let quality2 = 0;
			if(fighter.weapon.weapon = "axe") {
				quality2 = fighter.inventory[i].damage/2;
			} else {
				quality2 = fighter.inventory[i].damage;
			}
			if(quality2 < quality) {
				equip(fighter.inventory[i]);
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
	pathfind() {
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
			return array
		}
	}
	move() {
		let array = this.pathfind();
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
		this.parent.fighter.regenTime++;
		if(this.parent.fighter.regenTime >= 20) {
			this.parent.fighter.hp++;
		}
		if(this.parent.fighter.hp > this.parent.fighter.maxHp) {
			this.parent.fighter.hp = this.parent.fighter.maxHp;
		}
	}
	attack(enemy,charging=false) {
		let friend = false;
		for(let i = 0; i < this.things.length; i++) {
			if(this.things[i].name === enemy.parent.name && this.things[i].friend) {
				friend = true;
				break;
			}
		}
		if(!friend) {
			let parried;
			if(enemy.weapon.weapon === "sword" && Math.random() > 0.25) {
				parried = true;
			} else {
				enemy.hp -= this.parent.fighter.power;
			}
			let string = "! -"+this.parent.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
			log(this.getMessage(enemy.parent,string,parried,charging));
			if(enemy.hp <= 0) {
				enemy.die(enemy.parent);
				log("The "+enemy.parent.name+" dies!");
			}
			enemy.regenTime = 0;
			if(this.weapon.weapon === "axe") {
				this.parent.cooldown = 1;
			}
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
		super(parent,3,4,3,2,3,things,false);
	}
	getMessage(enemy,string,parried) {
		if(enemy === player) {
			if(parried) {
				string = ", but you parry the attack!";
			}
			return ["The large rat bites you"+string,"The large rat scratches you"+string];
		} else {
			if(parried) {
				string = ", but the "+enemy.name+" parries the attack!";
			}
			return ["The large rat bites the "+enemy.name+string,"The large rat scratches the "+enemy.name+string];
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
			},
			{
				name: "loot pile",
				friend: true,
				baseLove: 6,
			}
		]
		super(parent,2,3,4,2,2,things,true);
	}
	getMessage(enemy,string,parried,charging) {
		if(enemy === player) {
			if(parried) {
				string = ", but you parry the attack!";
			}
			if(enemy.size === "medium" && !this.fighter.weapon) {
				return ["The goblin bites you"+string,"The goblin kicks you"+string,"The goblin bodyslams you!"+string];
			} else if(this.fighter.weapon.weapon === "axe") {
				log(["The goblin swings at you"+string,"The goblin axes you"+string]);
			} else if(this.fighter.weapon.weapon === "sword") {
				log(["The goblin swings at you"+string,"The goblin slashes at you"+string]);
			} else if(this.fighter.weapon.weapon === "spear") {
				if(charging) {
					log(["The goblin charges at you"+string]);
				} else {
					log(["The goblin stabs at you"+string]);
				}
			}
		} else {
			if(parried) {
				string = ", but the "+enemy.name+" parries the attack!";
			}
			if(enemy.size === "small" && !this.fighter.weapon) {
				return "The goblin kicks the "+enemy.name+string;
			} else if(enemy.size === "medium" && !this.fighter.weapon) {
				return ["The goblin bites the "+enemy.name+string,"The goblin kicks the "+enemy.name+string,"The goblin bodyslams the "+enemy.name+string];
			} else if(this.fighter.weapon.weapon === "axe") {
				log(["The goblin swings at the "+enemy.parent.name+string,"The goblin axes the "+enemy.parent.name+string]);
			} else if(this.fighter.weapon.weapon === "sword") {
				log(["The goblin swings at the "+enemy.parent.name+string,"The goblin slashes at the "+enemy.parent.name+string]);
			} else if(this.fighter.weapon.weapon === "spear") {
				if(charging) {
					log(["The goblin charges at the "+enemy.parent.name+string]);
				} else {
					log(["The goblin stab at the "+enemy.parent.name+string]);
				}
			}
		}
	}
}


player.fighter = new Fighter(30,3,player,lose);
player.attack = function(enemy,charging=false) {
	let parried = false;
	if(enemy.weapon.weapon === "sword" && Math.random() > 0.25) {
		parried = true;
	} else {
		enemy.hp -= this.fighter.power;
	}
	let string = "! -"+this.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
	if(parried) {
		string = ", but the " + enemy.parent.name + " parries the attack!";
	}
	if(enemy.parent.size === "small" && !this.fighter.weapon) {
		log("You kick the "+enemy.parent.name+"!"+string);
	} else if(enemy.parent.size === "medium" && !this.fighter.weapon) {
		log(["You punch the "+enemy.parent.name+string,"You kick the "+enemy.parent.name+string,"You bodyslam the "+enemy.parent.name+"!"+string]);
	} else if(this.fighter.weapon.weapon === "axe") {
		log(["You swing at the "+enemy.parent.name+string,"You axe the "+enemy.parent.name+string]);
	} else if(this.fighter.weapon.weapon === "sword") {
		log(["You swing at the "+enemy.parent.name+string,"You slash at the "+enemy.parent.name+string]);
	} else if(this.fighter.weapon.weapon === "spear") {
		if(charging) {
			log(["You charge at the "+enemy.parent.name+string]);
		} else {
			log(["You stab at the "+enemy.parent.name+string]);
		}
	}
	if(enemy.hp <= 0) {
		enemy.die(enemy.parent);
		log("The "+enemy.parent.name+" dies!");
	}
	enemy.regenTime = 0;
	if(this.weapon.weapon === "axe") {
		this.cooldown = 1;
	}
}
player.cooldown = 0;
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
	thing.dead = true;
	thing.map.map[thing.posX][thing.posY] = thing.on;
	if(thing.on === "empty" && thing.fighter.inventory.length > 0) {
		thing.map.map[thing.posX][thing.posY] = new LootPile(thing.fighter.inventory.length);
	} else if(thing.on instanceof LootPile) {
		thing.map.map[thing.posX][thing.posY].stuff = thing.map.map[thing.posX][thing.posY].stuff.concat(thing.fighter.inventory);
	}

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

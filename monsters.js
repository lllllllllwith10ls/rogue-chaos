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
			let x = target.relPosX-1;
			let y = target.relPosY-1;
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
class RatAi {
	constructor(parent) {
		this.parent = parent;
		this.notables = [];
		this.noted = [];
		this.fearOnKill = Math.random()*10+3;
		this.baseFear = Math.random()/4;
		this.percievedStrength = 1;
	}
	observe() {
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(this.noted.includes(camera[i][j]) || camera[i][j] === this.parent) {
					
				} else if(camera[i][j].name === "large rat") {
					this.notables.push({thing:camera[i][j],baseLove:0.3+Math.random()});
					this.noted.push(camera[i][j]);
				} else if(camera[i][j].fighter) {
					this.notables.push({thing:camera[i][j],hate:2+Math.random()-0.5,baseFear:this.baseFear,killed:0});
					this.noted.push(camera[i][j]);
				}
			}
		}
		this.timeSinceLastDeath--;
		if(this.timeSinceLastDeath <= 0) {
			this.ratsDead--;
		}
		this.percievedStrength = this.parent.fighter.hp*this.parent.fighter.power/5;
		for(let i = 0; i < this.notables.length; i++) {
			if(this.notables[i].thing.name === "large rat") {
				let rat = this.notables[i].thing;
				this.percievedStrength += rat.fighter.hp*rat.fighter.power/(Math.abs(this.parent.relPosX-rat.relPosX+this.parent.relPosY-rat.relPosY)*20);
				
			}
		}
		for(let i = 0; i < this.notables.length; i++) {	
			if(this.notables[i].thing.name === "large rat") {
				let rat = this.notables[i].thing;
				if(Math.abs(this.parent.relPosX-rat.relPosX+this.parent.relPosY-rat.relPosY) <= 2) {
					this.notables[i].love = 0;
				} else {
					this.notables[i].love = rat.fighter.hp*rat.fighter.power*this.notables[i].baseLove/20;
				}
				
			} else {
				this.notables[i].fear = this.baseFear * player.fighter.hp*player.fighter.power-this.percievedStrength+this.notables[i].killed*this.fearOnKill;
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
			let x = this.parent.relPosX-1;
			let y = this.parent.relPosY-1;
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
	}
	attack(enemy) {
		if(enemy.parent.name !== "large rat") {
			enemy.hp -= this.parent.fighter.power;
			let string = " -"+this.parent.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
			if(enemy.parent === player) {
				log(["The large rat bites you!"+string,"The large rat scratches you!"+string,"You get bitten by the large rat!"+string]);
			} else {
				log(["The large rat bites the "+enemy.parent.name+"!"+string,"The large rat scratches the "+enemy.parent.name+"!"+string, "The "+enemy.parent.name+" gets bitten by the large rat!"+string]);
			}
			if(enemy.hp <= 0) {
				enemy.die();
				log("The "+enemy.parent.name+" dies!");
			}
		}
	}
}
class GoblinAi {
	constructor(parent) {
		this.parent = parent;
		this.notables = [];
		this.noted = [];
		this.fearOnKill = Math.random()*10+3;
		this.baseFear = Math.random()/2;
		this.percievedStrength = 1;
	}
	observe() {
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(this.noted.includes(camera[i][j]) || camera[i][j] === this.parent) {
					
				} else if(camera[i][j].name === "goblin") {
					this.notables.push({thing:camera[i][j],baseLove:0.3});
					this.noted.push(camera[i][j]);
				} else if(camera[i][j].fighter) {
					let strength = camera[i][j].fighter
					this.notables.push({thing:camera[i][j],baseFear:this.baseFear,killed:0});
					this.noted.push(camera[i][j]);
				}
			}
		}
		this.percievedStrength = this.parent.fighter.hp*this.parent.fighter.power/5;
		for(let i = 0; i < this.notables.length; i++) {
			if(this.notables[i].thing.name === "goblin") {
				let thing = this.notables[i].thing;
				this.percievedStrength += thing.fighter.hp*thing.fighter.power/(Math.abs(this.parent.relPosX-thing.relPosX+this.parent.relPosY-thing.relPosY)*20);
				
			}
		}
		for(let i = 0; i < this.notables.length; i++) {
			
			if(this.notables[i].thing.name === "goblin") {
				let thing = this.notables[i].thing;
				if(Math.abs(this.parent.relPosX-thing.relPosX+this.parent.relPosY-thing.relPosY) <= 2) {
					this.notables[i].love = 0;
				} else {
					this.notables[i].love = thing.fighter.hp*thing.fighter.power*this.notables[i].baseLove/20;
				}
			} else {
				let thing = this.notables[i].thing;
				this.notables[i].fear = this.baseFear * thing.fighter.hp*thing.fighter.power/5-this.percievedStrength+this.notables[i].killed*this.fearOnKill;
				if(this.noted[i] === player && !this.notables[i].hate) {
					this.notables[i].hate = Math.random()*3;
				} else if(!this.notables[i].hate){
					this.notables[i].hate = Math.random();
				}
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
			let x = this.parent.relPosX-1;
			let y = this.parent.relPosY-1;
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
	}
	attack(enemy) {
		if(enemy.parent.name !== "goblin") {
			enemy.hp -= this.parent.fighter.power;
			let string = " -"+this.parent.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
			if(enemy.parent === player) {
				log(["The goblin bites you!"+string,"The goblin kicks you!"+string,"The goblin bodyslams you!"+string]);
			} else {
				if(enemy.parent.size === "small") {
					log("The goblin kicks the "+enemy.parent.name+"!"+string);
				} else {
					log(["The goblin bites the "+enemy.parent.name+"!"+string,"The goblin kicks the "+enemy.parent.name+"!"+string,"The goblin bodyslams the "+enemy.parent.name+"!"+string]);
				}
			}
			if(enemy.hp <= 0) {
				enemy.die();
				log("The "+enemy.parent.name+" dies!");
			}
		}
	}
}
/*class Debug {
	constructor(parent) {
		this.parent = parent;
		this.notables = [];
		this.noted = [];
		this.fearOnKill = Math.random()*10+3;
		this.baseFear = Math.random()/4;
		this.percievedStrength = 1;
	}
	observe() {
		for(let i = 1; i <= camera.size; i++) {
			for(let j = 1; j <= camera.size; j++) {
				if(this.noted.includes(camera[i][j]) || camera[i][j] === this.parent) {
					
				} else if(camera[i][j].name === "large rat") {
					this.notables.push({thing:camera[i][j],baseLove:0.3});
					this.noted.push(camera[i][j]);
				} else if(camera[i][j] === player) {
					this.notables.push({thing:camera[i][j],hate:2,baseFear:this.baseFear,killed:0});
					this.noted.push(camera[i][j]);
				}
			}
		}
		this.timeSinceLastDeath--;
		if(this.timeSinceLastDeath <= 0) {
			this.ratsDead--;
		}
		this.percievedStrength = this.parent.fighter.hp*this.parent.fighter.power;
		for(let i = 0; i < this.notables.length; i++) {
			if(this.notables[i].thing.name === "large rat") {
				let rat = this.notables[i].thing;
				this.percievedStrength += rat.fighter.hp*rat.fighter.power/(Math.abs(this.parent.relPosX-rat.relPosX+this.parent.relPosY-rat.relPosY)*20);
				
			}
		}
		for(let i = 0; i < this.notables.length; i++) {
			if(this.notables[i].thing === player) {
				this.notables[i].fear = this.baseFear * player.fighter.hp*player.fighter.power-this.percievedStrength+this.notables[i].killed*this.fearOnKill;
			}
			if(this.notables[i].thing.name === "large rat") {
				let rat = this.notables[i].thing;
				this.notables[i].love = rat.fighter.hp*rat.fighter.power*this.notables[i].baseLove/10;
				
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
			let x = this.parent.relPosX-1;
			let y = this.parent.relPosY-1;
			let thingy = [x,y];
			while(true) {
				let thingy2 = [thingy[0],thingy[1]];
				thingy = this.moveHelp(thingy[0],thingy[1],array);
				if(!thingy) {
					break;
				} else if(thingy2 === thingy) {
					break;
				} else if(thingy[0] < 1 || thingy[1] < 1 || thingy[0] >= camera.size || thingy[1] >= camera.size) {
					break;
				}
			}
		}
	}
	moveHelp(x,y,array) {
		if(this.parent.inCamera) {
			let number = 100000000;
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
				if(this.parent.map.map[camera.x+x-1]) {
					if(this.parent.map.map[camera.x+x-1][camera.y+y] === "empty") {
						this.parent.map.map[camera.x+x-1][camera.y+y] = "debug";
						return [x-1,y];
					}
				}
			} else if(choose === 2) {
				if(this.parent.map.map[camera.x+x]) {
					if(this.parent.map.map[camera.x+x+1][camera.y+y] === "empty") {
						this.parent.map.map[camera.x+x+1][camera.y+y] = "debug";
						return [x+1,y];
					}
				}
			} else if(choose === 3) {
				if(this.parent.map.map[camera.x+x]) {
					if(this.parent.map.map[camera.x+x][camera.y+y-1] === "empty") {
						this.parent.map.map[camera.x+x][camera.y+y-1] = "debug";
						return [x,y-1];
					}
				}
			} else if(choose === 4) {
				if(this.parent.map.map[camera.x+x]) {
					if(this.parent.map.map[camera.x+x][camera.y+y+1] === "empty") {
						this.parent.map.map[camera.x+x][camera.y+y+1] = "debug";
						return [x,y+1];
					}
				}
			}
		}
	}
	attack(enemy) {
		if(enemy.parent.name !== "large rat") {
			enemy.hp -= this.parent.fighter.power;
			let string = " -"+this.parent.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
			if(enemy.parent === player) {
				log(["The large rat bites you!"+string,"The large rat scratches you!"+string,"You get bitten by the large rat!"+string]);
			} else {
				log(["The large rat bites the "+enemy.parent.name+"!"+string,"The large rat scratches the "+enemy.parent.name+"!"+string, "The "+enemy.parent.name+" gets bitten by the large rat!"+string]);
			}
			if(enemy.hp <= 0) {
				enemy.die();
				log("The "+enemy.parent.name+" dies!");
			}
		}
	}
}*/

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
}
class LargeRat extends Monster{
	constructor(x,y,map) {
		super("%","#000000",map,x,y,player,"large rat");
		this.ai = new RatAi(this);
		function ded(thing) {
			for(let i = 1; i <= camera.size; i++) {
				for(let j = 1; j <= camera.size; j++) {
					if(camera[i][j].name === "large rat") {
						let rat = camera[i][j];
						if(rat.ai.noted.includes(thing)) {
							rat.ai.notables[rat.ai.noted.indexOf(thing)].killed++;
						}
					}
				}
			}
			this.parent.dead = true;
			this.parent.map.map[this.parent.posX][this.parent.posY] = "empty";
			
		}
		this.dead = false;
		this.fighter = new Fighter(10,1,this,ded);
		this.size = "small";
	}
}
class Goblin extends Monster{
	constructor(x,y,map) {
		super("g","#000000",map,x,y,player,"goblin");
		this.ai = new GoblinAi(this);
		function ded(thing) {
			for(let i = 1; i <= camera.size; i++) {
				for(let j = 1; j <= camera.size; j++) {
					if(camera[i][j].name === "goblin") {
						let thing = camera[i][j];
						if(thing.ai.noted.includes(thing)) {
							thing.ai.notables[thing.ai.noted.indexOf(thing)].killed++;
						}
					}
				}
			}
			this.parent.dead = true;
			this.parent.map.map[this.parent.posX][this.parent.posY] = "empty";
			
		}
		this.dead = false;
		this.fighter = new Fighter(20,2,this,ded);
		this.size = "medium";
	}
}

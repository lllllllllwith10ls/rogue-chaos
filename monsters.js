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
			if(!this.map.map[this.posX+dx][this.posY+dy]) {
				this.map.generate(this.posX+dx,this.posY+dy);
			}
			let thing = this.map.map[this.posX+dx][this.posY+dy];
			if(thing.fighter) {
				this.ai.attack(thing.fighter);
			} else if(thing !== "wall") {
				let x = this.posX;
				let y = this.posY;
				this.map.map[x][y] = "empty";
				this.map.map[x+dx][y+dy] = this;
			} else {
				console.log(this.map.map[this.posX+dx][this.posY+dy]);
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
			let x = this.parent.relPosX;
			let y = this.parent.relPosY;
			if(this.parent.inCamera) {
				let number = array[x][y];
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
				if(this.parent.relPosX === x && this.parent.relPosY === y) {
					if(choose === 1) {
						console.log(camera[x-1][y]);
						console.log(this.parent.map.map[this.parent.posX-1][this.parent.posY]);
					} else if(choose === 2) {
						console.log(camera[x+1][y]);
						console.log(this.parent.map.map[this.parent.posX+1][this.parent.posY]);
					} else if(choose === 3) {
						console.log(camera[x][y-1]);
						console.log(this.parent.map.map[this.parent.posX][this.parent.posY-1]);
					} else if(choose === 4) {
						console.log(camera[x][y+1]);
						console.log(this.parent.map.map[this.parent.posX][this.parent.posY+1]);
					}
					console.log(x);
					console.log(y);
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
}

player.fighter = new Fighter(30,3,"",lose);
player.attack = function(enemy) {
	enemy.hp -= this.fighter.power;
	let string = " -"+this.fighter.power+"hp ("+enemy.hp+"/"+enemy.maxHp+")";
	if(enemy.parent.size === "small") {
		log("You kick the "+enemy.parent.name+"."+string);
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

let marker = new Tile("#","0000ff",world,"debug");
function pathfind(object,target) {
	if(object.inCamera) {
		let array = [];
		for(let i = 1; i <= camera.size; i++) {
			array[i] = [];
			for(let j = 1; j<= camera.size; j++) {
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
		array[x][y] = 0;
		let arrayCoords = [[x,y]];
		for(let i = 0; i < arrayCoords.length; i++) {
			arrayCoords = arrayCoords.concat(pathfindHelper(array,arrayCoords[i][0],arrayCoords[i][1]));
		}
		let path = [target.relPosX,target.relPosY];
		if(typeof array[path[0]][path[1]] === "number") {
			while(true) {
				if(array[path[0]][path[1]] > 0) {
					path = pathfindHelper2(array,path[0],path[1]);
					if(path) {
						camera[path[0]][path[1]] = marker;
						console.log(camera[path[0]][path[1]]);
					} else {
						break;
					}
				} else {
					break;
				}
			}
		}
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
	constructor(char,color,map,x,y,ai,thePlayer) {
		super(char,color,map,x,y);
		this.ai = function() {
			ai(this,thePlayer);
		}
	}
}
new Monster("%","#000000",map,18,18,pathfind,player);

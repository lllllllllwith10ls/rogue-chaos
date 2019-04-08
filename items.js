class Item{
	constructor(name,onUse,properties) {
		if(onUse) {
			this.onUse = onUse;
		}
		for(let i in properties) {
			this[i] = properties[i];
		}
	}
}
let commonMaterials = [
{
	material:"iron",
	damageLow:2,
	damageHigh:3
},
{
	material:"bronze",
	damageLow:-1,
	damageHigh:3
},
{
	material:"stone",
	damageLow:-2,
	damageHigh:3
}];
let rareMaterials = [{
	material:"gold",
	damageLow:-1,
	damageHigh:5
},{
	material:"silver",
	damageLow:0,
	damageHigh:4
},{
	material:"butter",
	damageLow:-5,
	damageHigh:5
},{
	material:"steel",
	damageLow:3,
	damageHigh:4
}];
let weapons = [{
	weapon:"axe",
	baseDamage:6
},{
	weapon:"sword",
	baseDamage:2
},{
	weapon:"spear",
	baseDamage:3
}];
function getItem() {
	let materials = [];
	for(let i = 0; i < commonMaterials.length; i++) {
		materials.push(commonMaterials[i]);
		materials.push(commonMaterials[i]);
	}
	for(let i = 0; i < rareMaterials.length; i++) {
		materials.push(rareMaterials[i]);
	}
	let material = materials[Math.floor(Math.random()*materials.length)];
	let weapon = weapons[Math.floor(Math.random()*weapons.length)];
	let damage = weapon.baseDamage+material.damageLow+Math.floor(Math.random()*(material.damageHigh-material.damageLow));
	return new Item(material.material+" "+weapon.weapon,{damage:damage,weapon:weapon.weapon,material:material.material});
}

class LootPile extends Thing{
	constructor(map,x,y,stuff) {
		super("$","#00ff00",map,x,y);
		this.stuff = stuff;
		this.name = "loot pile".
	}
}

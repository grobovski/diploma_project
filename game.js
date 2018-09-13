'use strict';

class Vector{
    constructor( x = 0, y = 0 ){
      this.x = x;
      this.y = y;
    }
    
    plus(vector){

        if( vector instanceof Vector ){
          let x = this.x + vector.x;
          let y = this.y + vector.y;  
          return new Vector( x, y );
        }
        throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        

    }
    
    times(time){
      let x = this.x * time;
      let y = this.y * time;
      return new Vector(x, y);
    }
}
///////////////////////
/*
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

//const finish2 = start.plus(5);
//console.log(`Текущее расположение: ${finish2.x}:${finish2.y}`);
*/
///////////////
class Actor{
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0) ){

      if( pos instanceof Vector &&  size instanceof Vector &&  speed instanceof Vector ){
        this.pos = pos;
        this.size = size;
        this.speed = speed;
      } else {
        throw new Error('Можно прибавлять к вектору только вектор типа Vector')
      }

  }
  get top(){
    return this.pos.y;
  }
  get bottom(){
    return this.pos.y + this.size.y;
  }
  get left(){
    return this.pos.x;
  }
  get right(){
    return this.pos.x + this.size.x;
  }
  get type(){
    return 'actor';
  }
  
  
  act(){ }

  isIntersect(actor){

      if( actor instanceof Actor &&  actor ){
        if( Object.is(this, actor) ){
          return false;
        }
        
        if( (this.right <= actor.left) ||
          (this.left >= actor.right) ||
          (this.bottom <= actor.top) ||
          (this.top >= actor.bottom) ){
            return false;
        } else {
          return true;
        }

      } else {
        throw new Error('Неправильные параметр')
      }

  }


}
///////////
/*
const items = new Map();
const player1 = new Actor();
items.set('Игрок', player1);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player1.pos = player1.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player1.isIntersect(item)) {
    console.log(`--- Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
*/
/////////////

class Level{
  constructor(grid, actors){
    this.grid = grid; //сетка игрового поля
    this.actors = actors; // список движущихся объектов
    this.status = null;
    this.finishDelay = 1;
    
  }
  get height() {
      if(!this.grid){
          return 0;
      }
    return this.grid.length;
  }
  get width() {
      if(!this.grid){
          return 0;
      }
        return this.grid.reduce((max, val) => {
            return Math.max(max, val.length);
            //return max < val.length ? val.length : max;
        }, 0);
  }
  get player() {
    return this.actors.find(actor => actor.type === 'player');
  }
  
  isFinished(){
    if(this.status !== null && this.finishDelay < 0){
      return true;
    }
    return false;
  }
  
  actorAt(actor){
      
      if( actor instanceof Actor &&  actor ){
        if(!this.actors){
            return undefined;
        }  
        return this.actors.find( 
          (act) => { 
            return  actor.isIntersect(act) ;
          } 
        );
      } else {
        throw new Error('Actor не задан или не является объектом Actor')
      }

  }

  obstacleAt(vector, size){

      if( vector instanceof Vector &&  vector && size instanceof Vector && size ){
        const left = Math.floor(vector.x);
        const top = Math.floor(vector.y);
        const right = Math.ceil(vector.plus(size).x);
        const bottom = Math.ceil(vector.plus(size).y);
        
        if(right > this.width || left < 0 || top < 0){
          return 'wall';
        }
        if(bottom > this.height){
          return 'lava';
        }
        for( let x = top ; x < bottom ; x++ ){
          for(let y = left ; y < right ; y++){
            if(this.grid[x][y])
              return this.grid[x][y];
          }
        }

        return undefined;
      } else {
        throw new Error('Не является объектом Vector')
      }

  }

  removeActor(actor){
    let indexActor = this.actors.indexOf(actor);
    if( indexActor >= 0 ){
      this.actors.splice(indexActor, 1);
    }
  }

  noMoreActors(type){
    if( !this.actors){
          return true;
      }  
    let actor = this.actors.find( 
      (actorOne) => { 
        if( actorOne.type === type ){
          return true; 
        }
         
      } 
    );
    
    if(actor){
        return false;
    }
    return true;
  }
  playerTouched( obstacle, actor){
    if( this.status === null){
      if( obstacle === 'lava' || obstacle === 'fireball' ){
        this.status = 'lost';
      }
      if( obstacle === 'coin' ){
        this.removeActor(actor);
        
        if(this.noMoreActors(obstacle)){
          this.status = 'won';
        }
      }
    }
  }
}

////////
/*
const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
*/
//////////

class LevelParser{
   constructor(dictionary){
     this.dictionary = dictionary;
   }
  actorFromSymbol(symbol){
    if(!symbol) return undefined;
    return this.dictionary[symbol] ? this.dictionary[symbol] : undefined;
  }
  obstacleFromSymbol(symbol){
    if(symbol === "x"){
      return "wall";
    } else if(symbol === "!"){
      return "lava";
    } else {
      return undefined;
    }
  }

  //Принимает массив строк и преобразует его в массив массивов
  createGrid(array){
    let newArray = array.map( myString => {
      return myString.split("").map( value => {
        return this.obstacleFromSymbol(value)
        });
    });

    return newArray;
  }

  //Принимает массив строк и преобразует его в массив движущихся объектов
  createActors(arrayString){
    let arrayActors = [];
    let newArray = arrayString.map( value => {
      return value.split("");
    });
    if(!this.dictionary){
        return [];
    }
    newArray.forEach((array, y) => {
      array.forEach((item, x) => {
        if (typeof this.dictionary[item] === 'function') {
          let vector = new Vector(x, y);
          let actor = new this.dictionary[item](vector);
          if (actor instanceof Actor) {
            arrayActors.push(actor);
          }
        }
      })
    });

    return arrayActors;

  }

  parse(arrayString){
    let grid = this.createGrid(arrayString);
    let actors = this.createActors(arrayString);
    return new Level(grid, actors);
  }
}
/////////////////////
/*
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));
*/
/////////////////////////

class Fireball extends Actor{
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)){
    let size = new Vector(1,1);
    super(pos, size, speed);

  }
  get type(){
    return 'fireball';
  }

  getNextPosition( time = 1 ){
    return this.speed.times(time).plus(this.pos);
  }

  handleObstacle(){
    this.speed.x = - this.speed.x;
    this.speed.y = - this.speed.y;
  }

  act(time, level){
    let nextPosition = this.getNextPosition(time);
    
    if(!level.obstacleAt(nextPosition, this.size)){
      this.pos = nextPosition;
    } else {
      this.handleObstacle();
    }
    console.log(this);
  }
}
//////////////////
/*
const time = 5;
const speed = new Vector(1, 0);
const position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
*/
//////////////////

class HorizontalFireball extends Fireball{
  constructor(pos = new Vector(0, 0)){
    super(pos);
    this.size = new Vector(1,1); 
    this.speed = new Vector(2, 0);
  }
}
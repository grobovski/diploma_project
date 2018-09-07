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
      this.x = this.x * time;
      this.y = this.y * time;
      return this;
    }
}
///////////////////////
/*
const start = new Vector(30, 50);
console.log(start);
const moveTo = new Vector(5, 10);
console.log(moveTo);
const finish = start.plus(moveTo.times(5));

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
      }else{
        throw new Error('Можно прибавлять к вектору только вектор типа Vector')
      }


    Object.defineProperty(this, "bottom", {
      get: () => {
        return this.pos.y + this.size.y;
      }
    });
    Object.defineProperty(this, "top", {
      get: () => {
        return this.pos.y;
      }
    });
    Object.defineProperty(this, "left", {
      get: () => {
        return this.pos.x;
      }
    });
    Object.defineProperty(this, "right", {
      get: () => {
        return this.pos.x + this.size.x;
      }
    });
    Object.defineProperty(this, "type", {
        value: 'actor',
        writable: false
    });
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
        }else{
          return true;
        }

      }else{
        throw new Error('Неправильные параметр')
      }

  }


}
///////////
/*
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
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
            return max < val.length ? val.length : max;
        }, 0);
  }
  get player() {
    return this.actors.find(actor => actor.type === 'player');
  }
  
  isFinished(){
    if(status !== null && finishDelay < 0){
      return true;
    }
    return false;
  }
  
  actorAt(actor){

      if( actor instanceof Actor &&  actor ){
        return this.actors.find( 
          (act) => { 
            return  actor.isIntersect(act) ;
          } 
        );
      }else{
        throw new Error('Actor не задан или не является объектом Actor')
      }

  }

  obstacleAt(vector, size){

      if( vector instanceof Vector &&  vector && size instanceof Vector && size ){
        
        let vectorSize = vector.plus(size);
        vector;

        for( let x = vector.x ; x <= vectorSize.x ; x++ ){
          for(let y = vector.y ; y <= vectorSize.y ; y++){
            if(this.grid[x][y])
              return this.grid[x][y];
          }
        }
        if(vectorSize.y > this.width){
          return 'lava';
        }
        if(vectorSize.x > this.height){
          return 'wall';
        }

        return undefined;
      }else{
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

    return this.actors.find( 
      (actorOne) => { 
        if( actorOne.type === type )
         return true; 
      } 
    );

    return false;
  }
  playerTouched( obstacle, actor){
    if( this.status === null){
      if( obstacle === 'lava' && obstacle === 'fireball' ){
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
console.log(level.player);
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
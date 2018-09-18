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

  createGrid(array){
    let newArray = array.map( myString => {
      return [...myString].map( value => {
        return this.obstacleFromSymbol(value)
        });
    });

    return newArray;
  }

  createActors(arrayString){
    let arrayActors = [];
    let newArray = arrayString.map( value => {
      return [...value];
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
    this.speed = this.speed.times(-1);
    //this.speed.x = - this.speed.x;
    //this.speed.y = - this.speed.y;
  }

  act(time, level){
    let nextPosition = this.getNextPosition(time);
    
    if(!level.obstacleAt(nextPosition, this.size)){
      this.pos = nextPosition;
    } else {
      this.handleObstacle();
    }

  }
}

class HorizontalFireball extends Fireball{
  constructor(pos = new Vector(0, 0)){
    super(pos);
    this.size = new Vector(1,1); 
    this.speed = new Vector(2, 0);
  }
}

class VerticalFireball extends Fireball{
  constructor(pos = new Vector(0, 0)){
    super(pos);
    this.size = new Vector(1,1); 
    this.speed = new Vector(0, 2);
  }
}

class FireRain extends Fireball{
  constructor(pos = new Vector(0, 0)){
    super(pos);
    this.originalPos = pos;
    this.size = new Vector(1,1); 
    this.speed = new Vector(0, 3);
  }
  handleObstacle(){
    this.pos = this.originalPos;
  }
}

class Coin extends Actor{
  constructor(position = new Vector(0, 0)){

    let originalPos = position.plus(new Vector(0.2, 0.1));
    
    super(originalPos, new Vector(0.6, 0.6)); 
    
    this.originalPos = originalPos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }
  get type() {
    return 'coin';
  }
  
  updateSpring(time = 1){
    this.spring += this.springSpeed * time;
  }
  getSpringVector(){
    let y = Math.sin(this.spring) * this.springDist;
    return new Vector(0, y);
  }
  getNextPosition(time){
    this.updateSpring(time);
    return this.originalPos.plus(this.getSpringVector());

  }
  act(time){
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor{
  constructor(position = new Vector(0, 0)){
    let originalPos = position.plus(new Vector(0, -0.5));
    super(originalPos, new Vector(0.8, 1.5), new Vector(0, 0));
  }
  get type() {
    return 'player';
  }
}

const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
}

const parser = new LevelParser(actorDict);
loadLevels().then(schemas => {
    runGame(JSON.parse(schemas), parser, DOMDisplay)
        .then(() => alert('Вы выиграли приз!'));
});

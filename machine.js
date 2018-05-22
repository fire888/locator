/**
|*********************************************;
*  Project        : Machine
*  Program name   : Server  
*  Author         : www.otrisovano.ru
*  Date           : 15.05.2018 
*  Purpose        : check brain   
|*********************************************/


/*********************************************;
 *  CREATE APPLICATION
 *********************************************/

var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('www'));
var server = app.listen(3050);
io.listen(server);
console.log('Machine start');

const game = {
  users: [],
  cars: [],
  bullets: []
}



/*********************************************;
 *  GET OBJECTS FROM USERS
 *********************************************/

io.on( 'connection', function( socket ) {
  socket.on( 'clientData', function( data ) {
  
    createNewUserIsNew( data )
    updateUserPosition( data )

    if ( data.carsDamaged ) checkCarDamage( data.carsDamaged )
    removeCarIfLifeIsNone()
    setPositionsCars( data.cars )
  })
})



/*********************************************;
 *  UPDATE game FROM SINGLE USER 
 *********************************************/


/** INIT NEW USER AND CAR ********************/ 

const createNewUserIsNew = data => {

  if ( data.userState != 'connect' ) return
  
  let u = {
    id: data.userId,
    timerDisconnect: 15,
    state: 'init',
    position: {
      x: Math.floor( Math.random()*250 ),
      z: Math.floor( Math.random()*250 ),
      rotation: 0
    },
    destroy: 0,
    lost: 0
  }

  game.users.push( u )
  
  createNewCar( { x: u.position.x, z: u.position.z } )
}

const checkIsUserNew = d => {

  let isNew = true
  game.users.forEach(( u, i, arr ) => {
    if ( u.id == d.userId ) isNew = false
  }) 
  if ( isNew ) return true   
} 


/** UPDATE USER POSITION *********************/

const updateUserPosition = data => {

  if ( data.userState != 'heroGo' ) return

  let u = getUserObjFromgame( data )
  if ( ! u ) return 
  
  u.timerDisconnect = 15
  u.state = 'heroGo'  
  u.position.x = data.position.x
  u.position.z = data.position.z
  u.position.rotation = data.position.rotation
} 

const getUserObjFromgame = d => {

  for( let i = 0; i < game.users.length; i ++ ) {
    if ( game.users[i].id == d.userId ) return game.users[i]
  }
}


/** UPDATE CARS ********************************/

const createNewCar = position => {

  let c = {
    id: Math.floor( Math.random()*10000 ),
    position: { 
      x: position.x,
      z: position.z
    },
    state: 'init',
    lives: 5 
  }

  game.cars.push( c )
}

const checkCarDamage  = carsDamaged => {
  
  if ( ! carsDamaged ) return
  if ( carsDamaged.length == 0 ) return 

  for ( let d = 0; d < carsDamaged.length; d ++ ) {
    for ( let i = 0; i < game.cars.length; i ++ ) {
      if ( carsDamaged[d] ==  game.cars[i].id ){
        game.cars[i].lives --
        console.log(  'CarID ' +  game.cars[i].id + " L: " + game.cars[i].lives )
      }
    }
  } 
}

const removeCarIfLifeIsNone = () => {
  
  for ( let i = 0; i < game.cars.length; i ++ ) {
    if ( game.cars[i].lives < 0 ) {
      console.log( 'deleteCar' +  game.cars[i].id  )      
      game.cars.splice( i, 1 )
      i --
    }
  } 
}

const setPositionsCars = cars => {
  for ( let i = 0; i < game.cars.length; i ++ ) {
    for ( let c = 0; c < cars.length; c ++ ) {
      if ( game.cars[i].id == cars[c].id ) {
        game.cars[i].position.x = cars[c].position.x
        game.cars[i].position.z = cars[c].position.z        
      }
    }
  }
}
 

/*********************************************;
 *  SEND GAME OBJECT TO USERS
 *********************************************/

const sendToUsersGameData = () => {

  io.sockets.emit( 'message', game );
}

const updateGame = () => {

  sendToUsersGameData()
  updateCarsStates()

  timerUpdate = setTimeout( updateGame, 200 )
}

let timerUpdate = setTimeout( updateGame, 200 )



/*********************************************;
 *  UPDATE game AFTER SEND
 *********************************************/

const updateCarsStates = () => {

  game.cars.forEach(( car, i, arr ) => {
    if ( car.state == 'init' ) car.state = 'drop'
  })
  
  for ( let i = 0; i < game.users.length; i ++ ) {
    game.users[i].timerDisconnect --
    if ( game.users[i].timerDisconnect < 0 ) {
      game.users.splice( i, 1 )
      i --
    }
  }
}



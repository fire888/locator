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

const gameObj = {
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
  })
})



/*********************************************;
 *  UPDATE GAMEOBJ FROM SINGLE USER 
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

  gameObj.users.push( u )
  
  createNewCar( { x: u.position.x, z: u.position.z } )
}

const checkIsUserNew = d => {

  let isNew = true
  gameObj.users.forEach(( u, i, arr ) => {
    if ( u.id == d.userId ) isNew = false
  }) 
  if ( isNew ) return true   
} 

const createNewCar = position => {

  let c = {
    id: Math.floor( Math.random()*10000 ),
    position: { 
      x: position.x,
      z: position.z
    },
    state: 'init' 
  }

  gameObj.cars.push( c )
}


/** UPDATE USER POSITION *********************/

const updateUserPosition = data => {

  if ( data.userState != 'heroGo' ) return

  let u = getUserObjFromGameObj( data )
  if ( ! u ) return 
  
  u.timerDisconnect = 15
  u.state = 'heroGo'  
  u.position.x = data.position.x
  u.position.z = data.position.z
  u.position.rotation = data.position.rotation
} 

const getUserObjFromGameObj = d => {

  for( let i = 0; i < gameObj.users.length; i ++ ) {
    if ( gameObj.users[i].id == d.userId ) return gameObj.users[i]
  }
}
 
 

/*********************************************;
 *  SEND GAME OBJECT TO USERS
 *********************************************/

const sendToUsersGameData = () => {

  io.sockets.emit( 'message', gameObj );
}

const updateGame = () => {

  sendToUsersGameData()
  updateCarsStates()

  timerUpdate = setTimeout( updateGame, 200 )
}

let timerUpdate = setTimeout( updateGame, 200 )



/*********************************************;
 *  UPDATE GAMEOBJ AFTER SEND
 *********************************************/

const updateCarsStates = () => {

  gameObj.cars.forEach(( car, i, arr ) => {
    if ( car.state == 'init' ) car.state = 'drop'
  })
  
  for ( let i = 0; i < gameObj.users.length; i ++ ) {
    gameObj.users[i].timerDisconnect --
    if ( gameObj.users[i].timerDisconnect < 0 ) {
      gameObj.users.splice( i, 1 )
      i --
    }
  }
}



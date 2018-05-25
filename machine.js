/**
|*********************************************;
*  Project        : Machine
*  Program name   : Server  
*  Author         : www.otrisovano.ru
*  Date           : 15.05.2018 
*  Purpose        : check brain   
|*********************************************/

'use strict'




/*********************************************;
 *  CREATE APPLICATION
 *********************************************/

var express = require("express")
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
app.use(express.static('www'))
var server = app.listen(3050)
io.listen(server)

console.log('Machine start')




/*********************************************;
 *  SERVER GAME OBJECTS
 *********************************************/

const game = {
  users: [],
  cars: [],
  bullets: [],
  bombs: []
}


const userProto = {
  id: null,
  timerDisconnect: 15,
  state: null,
  posX: null,
  posZ: null,
  rotation: null,

  destroyEmptyCars: 0,
  destroyCarsWithEnemies: 0,
  lostCars: 0,

  isCar: null
}


const carProto = {
  id: null,
  timerRemove: 2000,
  state: null,
  posX: null,
  posZ: null,
  rotation: null,  
  lives: 5,
  killer: null,
  
  isUser: null
}


const bombProto = {
  id: null,
  timerRemove: 20,
  isCar: null,
  isUser: null
}




/*********************************************;
 *  GET DATA FROM CLIENTS
 *********************************************/

io.on( 'connection', function( socket ) {
  socket.on( 'clientData', function( client ) {
  
    let serverUser = getUserServerData( client.user.id )     
    createNewUserIfNew( client.user, serverUser )
    updateServerUser( client.user, client.car.id, serverUser )

    let serverUserCar = getCarServerData( client.car.id ) 
    updateServerUserCar( client.car, client.user.id, serverUserCar )
    
    setCarIsEmtyIfUserCarIsNull( client.user.id, client.car.id )
    checkCarsDamage( client.carsDamaged )
    checkBombs( client.bombs )
    removeCarIfLifeIsNone()
  })
})




/***********************************************;
 *  UPDATE GAME FROM SINGLE EVERY CLIENT 
 ***********************************************/


/** FUNCTIONS USER **********************/ 

const getUserServerData = clientId => {
  
  for( let i = 0; i < game.users.length; i ++ ) {
    if ( game.users[i].id == clientId ) return game.users[i]
  }
  return null
}


const createNewUserIfNew = ( clientU, serverU ) => {
 
  if ( clientU.state != 'connect' ) return
  if ( serverU != null ) return
  
  let u = Object.assign( {}, userProto )
  u.id = clientU.id
  u.state = 'init'
  u.posX = Math.floor( Math.random()*250 )
  u.posZ = Math.floor( Math.random()*250 )
  u.rotation = 0

  game.users.push( u )
  
  createNewCar( { x: u.posX, z: u.posZ } )
}


const updateServerUser = ( clientU, clientCarId, serverU ) => {

  if ( clientU.state == 'connect' ) return
  if ( serverU == null ) return

  serverU.timerDisconnect = 15
  serverU.state = clientU.state
  serverU.isCar = clientCarId
  serverU.posX = clientU.posX
  serverU.posZ = clientU.posZ
  serverU.rotation = clientU.rotation
} 


/** FUNCTIONS CARS ********************************/

const getCarServerData = id => {

  if ( id == null ) return null 
  
  for ( let i = 0; i < game.cars.length; i ++  ) {
    if ( game.cars[i].id == id ) {
      return game.cars[i] 
    }
  }

  return null
} 


const createNewCar = position => {

  let c = Object.assign( {}, carProto )
  c.id =  Math.floor( Math.random()*10000 ) 
  c.posX = position.x
  c.posZ = position.z

  game.cars.push( c )
}


const updateServerUserCar = ( clientUserCar, clientUserCarId, serverUserCar ) => {

  if ( clientUserCar == null ) return
  if ( serverUserCar == null ) return
  
  serverUserCar.isUser = clientUserCarId 
  serverUserCar.timerRemove = 2000
  serverUserCar.posX = clientUserCar.posX
  serverUserCar.posZ = clientUserCar.posZ
  serverUserCar.rotation = clientUserCar.rotation            
}


const setCarIsEmtyIfUserCarIsNull = ( clientUserId, clientUserCarId ) => {

  for ( let c = 0; c < game.cars.length; c ++ ) {
    if ( game.cars[c].isUser == clientUserId ) {
      if ( clientUserCarId == null ) {
        game.cars[c].isUser = null
      }
    }
  }
}


/** ADD DAMAGES FROM BULLETS *************************************/

const checkCarsDamage  = carsDamaged => {
  
  if ( ! carsDamaged ) return
  if ( carsDamaged.length == 0 ) return 

  for ( let d = 0; d < carsDamaged.length; d ++ ) {
    for ( let i = 0; i < game.cars.length; i ++ ) {
      if ( carsDamaged[d].target == game.cars[i].id ) {
        game.cars[i].lives --
        game.cars[i].killer = carsDamaged[d].authorId
      }
    }
  } 
}


const removeCarIfLifeIsNone = () => {
  
  for ( let i = 0; i < game.cars.length; i ++ ) {
    if ( game.cars[i].lives < 0 ) {
      if ( game.cars[i].killer != null ) {
        addBonusToKillerUser( game.cars[i] )
      }   
      game.cars.splice( i, 1 )
      i --
    }
  } 
}


/** CHECK BOMBS ****************************************************/

const checkBombs = bombs => {
   
  if ( ! bombs ) return
  
  for ( let b = 0; b < bombs.length; b ++ ) {
    let bomb = Object.assign( {}, bombProto )
    bomb.isCar = bombs[b].car
    bomb.isUser = bomb[b].user
  }  
}


/** ADD SCORES TO USERS ********************************************/


const addBonusToKillerUser = car => {
  game.users.forEach(( user ) => {
    if ( car.killer == user.id ) {
      if ( car.isUser != null ) {
        removeBonusFromTargetCarUser( car.isUser )
        user.destroyCarsWithEnemies ++
      } else {
        user.destroyEmptyCars ++
      }
    }
  })
}


const removeBonusFromTargetCarUser = userId => {
  game.users.forEach(( user ) => {
    if ( user.id == userId ) {
      user.lostCars ++
    }
  })
}
      



/***********************************************;
 *  SEND GAME OBJECT TO USERS
 ***********************************************/

const sendToUsersGameData = () => {

  updateBombs()
  clearUsersIsDisconnect()
  clearCarsIfLongTimeNotMove() 

  io.sockets.emit( 'message', game )
  timerUpdate = setTimeout( sendToUsersGameData, 200 )  
}


let timerUpdate = setTimeout( sendToUsersGameData, 200 )




/***********************************************;
 *  UPDATE GAME BEFORE SEND
 ***********************************************/

const updateBombs = () => {

  if ( game.bombs.length == 0 ) return
  for ( let b = 0; b < game.bombs.length; b ++ ) {
    game.bombs[b].timerRemove -- 
    if ( game.bombs[b].timerRemove < 0 ) {
      let md = game.bombs[b]
      game.bombs.splice( b, 1 )
      b --
    }
  }
} 


const clearUsersIsDisconnect = () => {

  for ( let i = 0; i < game.users.length; i ++ ) {
    game.users[i].timerDisconnect --
    
    if ( game.users[i].timerDisconnect < 0 ) {
      setCarEmpty( game.users[i].isCar )
      let md = game.users[i]  
      game.users.splice( i, 1 )
      i --
      md = null
    }
  }
}


const setCarEmpty = carId => {

  if ( ! carId ) return 

  for ( let i = 0; i < game.cars.length; i ++ ) {
    if ( game.cars[i].id == carId ) {
      game.cars[i].isUser = null
      return
    }
  }
}



const clearCarsIfLongTimeNotMove = () => {

  for ( let i = 0; i < game.cars.length; i ++ ) {
    game.cars[i].timerRemove -- 

    if ( game.cars[i].timerRemove < 0 ) {
      let md = game.cars[i]
      game.cars.splice( i, 1 )
      i --
      md = null
    }
  }
}







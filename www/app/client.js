/**
|***********************************************; 
*  Project        : Machine
*  Program name   : Client  
*  Author         : www.otrisovano.ru
*  Date           : 14.05.2018 
*  Purpose        : check brain   
|***********************************************;
*/

'use strict'


/** CLIENT OBJ TO SEND TO SERVER **************/

const clientGame = {
  
  user: {
    id: Math.floor( Math.random()*1000 ),
    state: 'connect',
    posX: null,
    posZ: null,
    rotation: null 
  },

  car: {
    id: null,
    posX: null,
    posZ: null,
    rotation: null
  },
  
  bombs: [],
  carsDamaged: [] 
}




/***********************************************;
 *  INIT CLIENT
 ***********************************************/

let socket, timerSendDataClient
socket = io()

const initClient = () => {

  sendDataToServer()
  getDataFromServer()	
}

const sendDataToServer = () => {

  setUserDataInClientObj()
  socket.emit( 'clientData', clientGame )
  clearArrsInClientGameAfterSend() 
  timerSendDataClient = setTimeout( sendDataToServer, 500 )

}

const getDataFromServer = () => {
  
  socket.on( 'message', function ( serverData ) {  
    checkServerData( serverData ) 
  })
}




/***********************************************;
 *  UPDATE USER GAME OBJ
 ***********************************************/

const checkServerData = serverData => {
  
  let serverCurrentUser = takeawayUserData( serverData.users )  

  s.initHeroIfNone( serverCurrentUser )
  
  s.setDataEnemiesFromServer( serverData.users )
  s.setDataCarsFromServer( serverData.cars )
  s.setDataBombsFromServer( serverData.bombs )  
  ui.setUserScores( serverCurrentUser, serverData.users.length  )
}

const takeawayUserData = users => {

  for ( let i = 0; i < users.length; i ++ ) {
    if ( users[i].id == clientGame.user.id ) {
      let u = users[i]
      users.splice( i, 1 ) 
      return u
    }
  }
}




/*********************************************************;
 * SET DATA IN CLIENT OBJ 
 *********************************************************/

const  setUserDataInClientObj = () => {
  
  if ( ! hero ) return 

  clientGame.user.posX = hero.cam.position.x
  clientGame.user.posZ = hero.cam.position.z
  clientGame.user.rotation = hero.cam.rotation

  if ( cope.car == null ) {
    clientGame.car.id = null 
  } else { 
    clientGame.car.id = cope.car.id
    clientGame.car.posX = cope.car.model.position.x
    clientGame.car.posZ = cope.car.model.position.z
    clientGame.car.rotation = cope.car.model.rotation      
  }   
}


const clientGameputIdDamagedCar = id => {

  clientGame.carsDamaged.push( id )
}


const addBombInClientObj = car => {

  if ( car.isBomb == true ) return 

  for ( let i = 0; i < g.bombs.length; i ++ ) {
    if ( g.bombs[i].carId == car.id ) {
      return
    }
  }
  
  car.isBomb = true  

  clientGame.bombs.push( { car: car.id, user: clientGame.user.id } )
  buttAddBomb.style.opacity = 0	
}




/***********************************************;
 *  CLEAR CLIENT OBJ 
 ***********************************************/

const clearArrsInClientGameAfterSend = () => {
  
  clientGame.carsDamaged = []
  clientGame.bombs = []
}




/***********************************************; 
 *  Project        : Poligon
 *  Program name   : Client  
 *  Author         : www.otrisovano.ru
 *  Date           : 14.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

'use strict'




/** CLIENT OBJ TO SEND TO SERVER *************************/

const clientGame = {
  user: {
    id: Math.floor( Math.random()*1000 ),
    state: 'connect',
    posX: null,
    posZ: null,
    rotation: null,
    isGetNewCar: false  
  },
  car: {
    id: null,
    posX: null,
    posZ: null,
    rotation: null
  },
  bombs: [], 
  bullets: [],
  carsDamaged: []
}




/*********************************************************;
 *  INIT CLIENT
 *********************************************************/

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
  clearUserGetNewCar()

  timerSendDataClient = setTimeout( sendDataToServer, 500 )
}

const getDataFromServer = () => {
  
  socket.on( 'message', function ( serverData ) {  
    updateGameFromServerData( serverData ) 
  })
}




/*********************************************************;
 *  UPDATE USER GAME FROM SERVER
 *********************************************************/

const updateGameFromServerData = serverData => {
  
  let serverCurrentUser = takeawayUserData( serverData.users )  

  //s.initHeroIfNone( serverCurrentUser )
  
  //removeEnimiesWhichNotInGame( serverData.users, serverData.cars )

  s.setDataEnemiesFromServer( serverData.users )
  s.setDataCarsFromServer( serverData.cars )
  s.setDataBombsFromServer( serverData.bombs )
  s.setDataBulletsFromServer( serverData.bullets )
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


const removeEnimiesWhichNotInGame = ( users, cars ) => {

  for ( let i = 0; i < users.length; i ++ ) {
    if ( users[i].state != 'play' ) {
      removeUserCarWichDriverNotInGame( cars, users[i].id )
      users.splice( i, 1 )
      i --
    }
  }
} 

const removeUserCarWichDriverNotInGame = ( cars, uId ) => {
  for ( let c = 0; c < cars.length; c ++  ) {
    if ( cars[c].isUser == uId ) {
      cars.splice( c, 1 )
      c --
    }
  }
} 



/*********************************************************;
 * SET DATA IN CLIENT OBJ TO SEND TO SERVER 
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
    clientGame.car.rotationGun = cope.car.modelGun.rotation    
  }   
}


const clientGameputIdDamagedCar = id => clientGame.carsDamaged.push( id )


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


const addBulletInClientObj = bullet => clientGame.bullets.push( bullet )


let isBlockUserToGetNewCar = false

const getNewCar = () => {
  
  keys.C = false

  if ( isBlockUserToGetNewCar == true ) return
  isBlockUserToGetNewCar = true

  clientGame.user.isGetNewCar = true
  getNewCarButt.style.display = 'none'

  setTimeout ( ()=>{ 
      isBlockUserToGetNewCar = false
      getNewCarButt.style.display = 'block'       
    }, 15000 )
 }




/***********************************************;
 *  CLEAR TEMPS FROM CLIENT OBJ 
 ***********************************************/

const clearArrsInClientGameAfterSend = () => {
  
  clientGame.carsDamaged = []
  clientGame.bombs = []
  clientGame.bullets = []
}


const clearUserGetNewCar = () => clientGame.user.isGetNewCar = false




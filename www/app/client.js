
"use strict"



/**
|***********************************************; 
*  Project        : Machine
*  Program name   : Client  
*  Author         : www.otrisovano.ru
*  Date           : 14.05.2018 
*  Purpose        : check brain   
|***********************************************;
*/


/** obj to send no server and get data from server */
const clientGame = {

  userId: Math.floor( Math.random()*1000 ),
  userState: 'connect', //init, heroGo
  position: {
    x: null,
    z: null,
    rotation: null
  },
  users: [],
  cars: [],
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

  socket.emit( 'clientData', clientGame )
  clearArrsInClientGameAfterSend() 
  timerSendDataClient = setTimeout( sendDataToServer, 500 )

}

const clearArrsInClientGameAfterSend = () => {
  
  clientGame.carsDamaged = []
}

const getDataFromServer = () => {

  socket.on( 'message', function ( data ) {
    checkServerData( data ) 
  })
}



/***********************************************;
 *  UPDATE USER GAME OBJ
 ***********************************************/

const checkServerData = data => {
  
  updateCurrentUser( data )
  updateAnoterUsers( data )
  updateCars( data.cars ) 
}


/** UPDATE CURRENT USER ************************/

const updateCurrentUser = d => {

  let u = getCurrentUserFromDataAndRemove( d )
  if ( ! u ) return
 
  createThisUserIfNew( u )
  setUserLocationInGameObj()
}

const getCurrentUserFromDataAndRemove = d => {

  for ( let i = 0; i < d.users.length; i++ ) {
    if ( d.users[i].id == clientGame.userId ) {
      let u = d.users[i] 
      d.users.splice( i, 1 )
      return u
    }
  }
}

const createThisUserIfNew = u => {

  if ( u.state != 'init' ) return

  clientGame.position.x = u.position.x
  clientGame.position.z = u.position.z 
  s.putUserInPosition( clientGame.position )
  clientGame.userState = 'heroGo'
}

const setUserLocationInGameObj = () => {

  clientGame.position = hero.getPosition()
}


/** UPDATE ANOTER USERS ************************/

const updateAnoterUsers = d => {

  let a = traceArrayTargetFromSource( clientGame.users, d.users )

  if ( a.newObjects.length > 0 ) {
    for ( let i = 0; i < a.newObjects.length; i ++ ) {
     s.createNewAnotherUser( a.newObjects[i] )
    }
  }

  if ( a.mustRemove.length > 0 ) {

    for( let i = 0; i < a.mustRemove.length; i ++ ) {
      for ( let n = 0; n < g.arrUsers.length; n ++ ) {
        if ( a.mustRemove[i].id == g.arrUsers[n].id ) {
          g.arrUsers[n].remove()
          g.arrUsers.splice( n, 1 )
          n --
        }
      }
    }
  }
  
  for ( let i = 0; i < a.targetArrRemovedOld.length; i ++ ) {
    for ( let n = 0; n < g.arrUsers.length; n ++ ) {	
      if ( a.targetArrRemovedOld[i].id == g.arrUsers[n].id ) {
        g.arrUsers[n].updateParamsFromServer( a.targetArrRemovedOld[i] )			  
      }
    }
  }

  clientGame.users = a.targetArrRemovedOldAddNew
} 


/** UPDATE CARS AFTER GET SERVER *************************/

const updateCars = serverCars => {

  let c = traceArrayTargetFromSource( clientGame.cars, serverCars )
   
  if ( c.newObjects.length > 0 ) {
    for ( let i = 0; i < c.newObjects.length; i ++ ) {
	    s.createNewCar( c.newObjects[i] )
	  }
  }
  
  if ( c.mustRemove.length > 0 ) {
	  
    for ( let i = 0; i < c.mustRemove.length; i ++ ) {
      console.log( ' c.mustRemove.length ' +  c.mustRemove.length )
      for ( let d = 0; d < g.arrCars.length; d ++ ) {
        if ( c.mustRemove[i].id == g.arrCars[d].id ) {
          g.arrCars[d].startExplosive()
          chancheArrayByPropertyId( g.arrCars, g.arrCarsMustRemoved, c.mustRemove[i].id )
          d --
          s.rendererStartFlash()		  
		    }		  
	    }
	  }	  
  }
  
  console.log( c.targetArrRemovedOld.length )  
  if ( c.targetArrRemovedOld.length > 0 ) {
    for ( let i = 0; i < c.targetArrRemovedOld.length; i ++ ){
      for ( let car = 0; car < g.arrCars.length; car ++ ) {
          console.log( 'UPDATECAR CLIENT' )              
          if ( c.targetArrRemovedOld[i].id == g.arrCars[car].id ) {
            g.arrCars[car].updateParamsFromServer( c.targetArrRemovedOld[i] )
          }		
      }	  
    }
  }  
  
  clientGame.cars = c.targetArrRemovedOldAddNew
} 


/** SET PROPS CAR TO SEND SERVER *************************/

const clientGameputIdDamagedCar = id => {

  clientGame.carsDamaged.push( id )
}

const clientGameSetCarParams = car => {

  for ( let i = 0; i < clientGame.cars.length; i ++ ) {
    if ( clientGame.cars[i] == car.id ) {
      clientGame.cars[i].position = {
        x: car.model.position.x,
        z: car.model.position.z 
      }
    }
  }
}



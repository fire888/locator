
"use strict"



/**
|***************************************; 
*  Project        : Machine
*  Program name   : Client  
*  Author         : www.otrisovano.ru
*  Date           : 14.05.2018 
*  Purpose        : check brain   
|***************************************;
*/



const clientGame = {

  userId: Math.floor( Math.random()*1000 ),
  userState: 'connect', //init, heroGo
  position: {
    x: null,
    z: null,
    rotation: null
  },
  users: [],
  cars: []
}



/***************************************;
 *  INIT CLIENT
 ***************************************/

let socket, timerSendDataClient
socket = io()

const initClient = () => {

  sendDataToServer()
  getDataFromServer()	
}

const sendDataToServer = () => {

  socket.emit( 'clientData', clientGame )
  timerSendDataClient = setTimeout( sendDataToServer, 500 )
}

const getDataFromServer = () => {

  socket.on( 'message', function ( data ) {
    checkServerData( data ) 
  })
}



/***************************************;
 *  UPDATE USER GAME OBJ
 ***************************************/

const checkServerData = data => {
  
  updateCurrentUser( data )
  updateAnoterUsers( data )
}


/** UPDATE CURRENT USER ****************/

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


/** UPDATE ANOTER USERS ****************/

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
          console.log( 'remove' )
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

const updateAnoterUser = u => {}



/***************************************;
 * FUNCTION RETURN SORT ARRAY
 ***************************************/

const traceArrayTargetFromSource = ( targetArr, sourceArr ) => {

  let newTargetArrRemovedOld = []
  let newTargetArrRemovedOldAddNew = []

  for ( let s = 0; s < sourceArr.length; s++ ) {
    for ( let t = 0; t < targetArr.length; t ++ ) {
      if ( s > -1 ) {

        if ( targetArr[t].id == sourceArr[s].id ) {

          newTargetArrRemovedOld.push( sourceArr[s] )
          newTargetArrRemovedOldAddNew.push( sourceArr[s] )

          targetArr.splice( t, 1 )
          t --
          sourceArr.splice( s, 1 )
          s --
        }
      } 
    }
  }

  for ( let s = 0; s < sourceArr.length; s ++ ) {
    newTargetArrRemovedOldAddNew.push( sourceArr[s] )
  }

  return {
    mustRemove: targetArr,
    newObjects: sourceArr,
    targetArrRemovedOld: newTargetArrRemovedOld,
    targetArrRemovedOldAddNew: newTargetArrRemovedOldAddNew
  }
}



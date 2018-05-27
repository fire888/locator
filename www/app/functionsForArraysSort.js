
/***********************************************; 
 *  Project        : Poligon
 *  Program name   : Arrays Functions
 *  Author         : www.otrisovano.ru
 *  Date           : 14.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

'use strict'




/***********************************************;
 * CHANGE TARGET ARR FROM SOURCE DATA  
 ***********************************************/

const transformTargetArrFromSourceArrData = ( 
      targetArr, sourceArr,
      createObj, deleteObj, updateObj 
    ) => {

  let newTargetArr = []

  for ( let s = 0; s < sourceArr.length; s ++ ) {
    for ( let t = 0; t < targetArr.length; t ++ ) {
      if ( s > -1 ) {

        if ( targetArr[t].id == sourceArr[s].id ) {
          
          updateObj( targetArr[t], sourceArr[s] )

          newTargetArr.push( targetArr[t] )

          targetArr.splice( t, 1 )
          t --
          sourceArr.splice( s, 1 )
          s --
        }
      } 
    }
  }

  for ( let s = 0; s < sourceArr.length; s ++ ) {
    let newObj = createObj( sourceArr[s] )
    newTargetArr.push( newObj )
  }

  for ( let t = 0; t < targetArr.length; t ++ ) {
    deleteObj( targetArr[t] )
    targetArr.splice( t, 1 )
    t --
  }

  return newTargetArr
}




/***********************************************;
 * GET FROM ONE ARR,REMOVE / PUT IN SECOND 
 ***********************************************/

const chancheArrayByPropertyId = ( sourceArr, targetArr, prop ) => {

  for ( let i = 0; i < sourceArr.length; i ++ ) {
    if ( sourceArr[i].id == prop ) {
      let obj = sourceArr[i]
      sourceArr.splice( i, 1 )
      targetArr.push( obj )
      return 
    }
  }
} 




/***********************************************;
 * REMOVE ITEM FROM ARRAY 
 ***********************************************/

const removeObjectFromArr = ( item, i, arr ) => {

  arr.splice( i, 1 )
  item = null
}
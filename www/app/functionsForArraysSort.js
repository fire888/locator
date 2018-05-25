/***********************************************;
 * FUNCTION RETURN SORT ARRAY
 ***********************************************/

fArrs = {
  newObjects: null,
  mustRemoveObjects: null,
  sortedObjects: null,
  complitedObjects: null
}

fArrs.sortArrs = ( arrTarget, arrSource ) => {
   
  let targetsId = []
  for ( let i = 0; i < arrTarget.length; i ++ ) {
    targetsId.push( arrTarget[i].id) 
  }
  let sourceId = []
  for ( let i = 0; i < arrSource.length; i ++ ) {
    sourceId.push( arrSource[i].id) 
  }

  for ( let s = 0; s < sourceId.length; s ++ ) {
    for ( let t = 0; t < targetsId.length; t ++ ) {
      if ( s > -1 ) {
        if ( targetsId[t] == sourceId[s] ) {
         targetsId.splice( t, 1 )
         t --
         sourceId.splice( s, 1 )
         s -- 
        }
      }
    }
  }

  let newObjs = []
  for ( let s = 0; s < sourceId.length; s ++ ) {
    for ( let aS = 0; aS < arrSource.length; aS ++ ) {
      if ( sourceId[s] == arrSource[aS].id ) {
        newObjs.push( arrSource[aS] )
      }
    }
  }

  fArrs.newObjects = newObjs
}


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
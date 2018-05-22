/***********************************************;
 * FUNCTION RETURN SORT ARRAY
 ***********************************************/

const traceArrayTargetFromSource = ( targetArr, sourceArr ) => {

    let newTargetArrRemovedOld = []
    let newTargetArrRemovedOldAddNew = []
  
    for ( let s = 0; s < sourceArr.length; s ++ ) {
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

/***********************************************; 
 *  Project        : Poligon
 *  Program name   : Class Enemy 
 *  Author         : www.otrisovano.ru
 *  Date           : 14.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

'use strict'




/**************************************************;
 * Enemy
 **************************************************/

class Enemy {

  constructor( h ) {

    this.id = h.id
    this.speedX = 0
    this.speedZ = 0

    this.obj = new THREE.Mesh(
      s.geomHuman,
      new THREE.MeshBasicMaterial({ color: 0x000000 }) 
    )
    this.obj.position.set( h.posX, -30, h.posZ )
    s.scene.add( this.obj )
  }

  render() {

    this.obj.position.x += this.speedX	
    this.obj.position.z += this.speedZ	
  }

  remove() {

    this.id = null
    this.newPosition = null
    s.scene.remove( this.obj )
    this.obj = null
  }

  updateParamsFromServer( data ) {
    
    if ( data.isCar != null ) {
      
      this.obj.position.y = 100000

    } else {

      if (  this.obj.position.y == 100000 ) {
        this.obj.position.y = -30
        this.obj.position.x = data.posX
        this.obj.position.z = data.posZ
      }
      
      this.speedX = calckSpeed( this.obj.position.x, data.posX )
      this.speedZ = calckSpeed( this.obj.position.z, data.posZ )
      this.obj.rotation.copy( data.rotation )	      
    }
  }
}




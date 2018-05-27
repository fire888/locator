
/************************************************;
 *  Project        : Poligon
 *  Program name   : Class Bomb 
 *  Author         : www.otrisovano.ru
 *  Date           : 15.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

'use strict'




/**************************************************;
 * BOMB
 **************************************************/
 
class Bomb {
	
  constructor( car ) {
		
    this.isRemovable = false	
    this.timer = 300
    this.car = car		

    this.mesh = new THREE.Mesh(
	  new THREE.BoxGeometry( 5, 5, 5 ),
	  new THREE.MeshBasicMaterial( { color: 0xff0000 } )
    )

    this.mesh.position.set( 0, -15, 0 )
    car.model.add( this.mesh )
  }

  boom() {

    this.car.model.remove( this.mesh )
    this.mesh = null
    this.car = null
    this.isRemovable = true	
  }
}	




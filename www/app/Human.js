
"use strict"


/**************************************************;
 * HUMAN
 **************************************************/

class Human {

  constructor( h ) {

    this.id = h.id
    this.newPosition = {
      x: h.position.x,
      z: h.position.z  	  
    }
    this.speedX = 0
    this.speedZ = 0

    this.obj = new THREE.Mesh(
      s.geomHuman,
      new THREE.MeshBasicMaterial({ color: 0x000000 }) 
    )
    this.obj.position.set( h.position.x, -30, h.position.z )
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
    
    this.speedX = calckSpeed( this.obj.position.x, data.position.x )
    this.speedZ = calckSpeed( this.obj.position.z, data.position.z )
    this.obj.rotation.copy( data.position.rotation )	
  }
    
}



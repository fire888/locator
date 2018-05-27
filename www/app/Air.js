
/************************************************;
 *  Project        : Poligon
 *  Program name   : Class Air 
 *  Author         : www.otrisovano.ru
 *  Date           : 15.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

'use strict'




/**************************************************;
 * AIR
 **************************************************/
 
class Air {
  
  constructor( car, targetPositionDrop ) {
	
    this.targetPositionDrop = targetPositionDrop 	
    this.isRemovable = false	
    this.mesh = new THREE.Mesh(
      s.geomAir,
      new THREE.MeshPhongMaterial( { color: 0x00aa00 } )
    )

    this.mesh.position.set( this.targetPositionDrop.x, 300, this.targetPositionDrop.z - 1500 )
    if ( car.startUserId != null ) this.mesh.position.z = this.targetPositionDrop.z - 5000 
   
    s.scene.add( this.mesh )

    this.car = car	
  }
  
  render() {
    
    this.mesh.position.z += 5
	
    if ( this.mesh.position.z > this.targetPositionDrop.z + 3000 ) { 
      this.remove()
      return
    }

    if ( this.car ) {
      if ( this.mesh.position.z < this.targetPositionDrop.z - 500 ) {
        this.carFlyWithAir()
      } else {
        s.startCarDrop( this.car )
        this.car = null		
      }		  
    }    
  }
  
  carFlyWithAir() {
	  
    this.car.model.position.set( this.mesh.position.x, this.mesh.position.y - 20, this.mesh.position.z )  			
  }
  
  remove() {
	  
    s.scene.remove( this.mesh )
    this.isRemovable = true	
  }
}




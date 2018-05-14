
/**************************************************;
 * Parashute
 **************************************************/
 
class Parashute {
	
  constructor( car ) {
				
    this.car = car
    this.objGeom = prepearGeometryToAnimate( s.geomParashute )	
    this.mesh = new THREE.Mesh(
      this.objGeom.geom,
      new THREE.MeshPhongMaterial({ 
        color: 0x00aa00, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0			
      })
    )
    this.mesh.position.set( 0, 5, 0 )
    this.car.model.add( this.mesh )
  }
  
  render() {
	  
    if ( this.mesh.material.opacity < 0 ) {
      this.remove()
      return
    }	 
    animationClose( this.objGeom )
    this.mesh.material.opacity -= 0.02
  }
  
  remove() {
	  
    this.car.model.remove( this.mesh )
    this.objGeom.geom = null
    this.objGeom = null
	
    this.car.parashute = null
    this.car = null
  }
}



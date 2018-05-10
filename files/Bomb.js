
/**************************************************;
 * HERO BOMB
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
		
		this.mesh.position.set( 0, -21, 0 )
		car.model.add( this.mesh )
	}
	
	update() {
		
		this.timer --
		if (this.timer < 0 ) this.boom() 
	}
	
	boom() {
		
		this.car.model.remove( this.mesh )		
		this.car.state = 'explosive'
		this.car = null
		this.isRemovable = true
		g.heroBomb = null	
	}
}	
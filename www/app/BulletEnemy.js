
/**************************************************;
 * BULLET ENEMY
 **************************************************/

class BulletEnemy {

	constructor( params ) {
				
		this.id = params.id		
		this.isRemovable = false
		
		this.userId = params.userId
		this.carId = params.carId
		this.lifeTimer = 100
		
		this.spdX = params.spdX
		this.spdZ = params.spdZ
		
		this.mesh = new THREE.Mesh (
			new THREE.SphereGeometry( 2, 7, 7 ),
			new THREE.MeshBasicMaterial( { color: 0xffff88 } )  	
		)
		 
		this.mesh.position.set( params.posX, -5, params.posZ )		
		s.scene.add( this.mesh )
	}
	
	render() {

		this.mesh.position.x += this.spdX
		this.mesh.position.z += this.spdZ	
        this.mesh.position.y -= 0.2
        this.lifeTimer--
        
		if ( this.lifeTimer < 0 ) this.deleteObj()
	}
	
	deleteObj() {

		s.scene.remove( this.mesh )
		this.mesh = null
		this.isRemovable = true
	}
}

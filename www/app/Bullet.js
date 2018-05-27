/**************************************************;
 * BULLET
 **************************************************/

class Bullet {

	constructor( car ) {
				
		this.id = Bullet.ID ++		
		this.isRemovable = false
		
		this.userId = clientGame.user.id
		this.carId = car.id		
		this.lifeTimer = 100
		this.kvadrant = { x: 0, z: 0 }
		
		this.spd = 8.0
		this.spdXCar = car.spdForBullet.x
		this.spdZCar = car.spdForBullet.z
		
		this.mesh = new THREE.Mesh (
			new THREE.SphereGeometry( 2, 7, 7 ),
			new THREE.MeshBasicMaterial( { color: 0xffff88 } )  	
		)
		
		let gun = car.modelGun 
		this.mesh.setRotationFromQuaternion( gun.getWorldQuaternion() )
		this.mesh.position.set( gun.getWorldPosition().x, -5, gun.getWorldPosition().z )		
		this.mesh.translateZ( -10 )
		s.scene.add( this.mesh )
	}

	getParamsForClient() {

        this.mesh.translateZ( -this.spd )
		this.mesh.position.x -= this.spdXCar
		this.mesh.position.z -= this.spdZCar
		let pX = this.mesh.position.x
		let pZ = this.mesh.position.z
		this.mesh.position.x += this.spdXCar
		this.mesh.position.z += this.spdZCar									
		this.mesh.translateZ( this.spd )

		let spdX = pX - this.mesh.position.x 
		let spdZ = pZ - this.mesh.position.z 

		return {
			id: this.id,
			userId: this.userId,
			carId: this.carId,
			posX: this.mesh.position.x,
			posZ: this.mesh.position.z, 
			spdX: spdX,
			spdZ: spdZ 
		}
	}
	
	render() {
		
		this.mesh.translateZ( -this.spd )
		this.mesh.position.x -= this.spdXCar
		this.mesh.position.z -= this.spdZCar	
		this.mesh.position.y -= 0.2
		
		this.kvadrant = checkKvadrant( this.mesh )
		
		this.lifeTimer--
		if ( this.lifeTimer < 0 ) this.deleteObj()
	}
	
	deleteObj() {
		s.scene.remove( this.mesh )
		this.mesh = null
		this.isRemovable = true
	}
}

Bullet.ID = 0
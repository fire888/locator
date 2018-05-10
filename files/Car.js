

/**************************************************;
 * CAR
 **************************************************/	

class Car {
	 
	constructor( carParams ) {

		/** PARAMS *******************************/
		
		this.id = Car.ID ++
		this.lives = 3
		this.health = {
			gun: 20,
			cope: 20,
			base: 20,
			weels: 20
		}
		this.copeParams = {
			gun: 0,
			front: 0,
			back: 0,
			left: 0,
			right: 0,
			health: 0,
			locator: 0,		
			ammo: true,
			fuel: true,
			compas: true,
			rotations: true,			
		}
		this.allFuel = 4000
		this.currentFuel = 4000
		this.ammo = 30
		this.spdMax = 5
		this.spdBackMax = -3
		this.spd = 0
		this.spdRot = 0
		this.gunSpdRot = 0
		this.isHeroIn = false
		this.isRemovable = false
		this.timerExplosion = 300
		this.timerRemove = 200
		
		this.state = 'none'		

		this.spdForBullet = {
			pX: 0, pZ:0,
			pXold: 0, pZold: 0,
			x: 0, z: 0
		}
				
		
		/** MODEL ******************************/
		
		/** pivot */ 
		this.geoms = {}
		
		this.model = new THREE.Mesh(
			new THREE.BoxGeometry( 0.001, 0.001, 0.001 ),
			new THREE.MeshPhongMaterial( { color: 0x000000 } )	
		)
		this.model.position.set ( carParams.pos.x, 0, carParams.pos.z )
		s.scene.add( this.model )
		
		/** cleate label for locators */
		sv.createNewLabel( this )

		this.kvadrant = checkKvadrant( this.model )
		
		/** prepear base */
		this.geoms.base = prepearGeometryToExploisive( s.geomCar.clone() )	
		this.modelBase = new THREE.Mesh(
			this.geoms.base.geom,
			new THREE.MeshPhongMaterial( { color: 0x00aa00 } )
		)
		this.modelBase.position.y = -22 
		this.model.add(this.modelBase)
		
		/** prepear gun */
		this.geoms.gun =  prepearGeometryToExploisive( s.geomCarGun.clone() ) 
		this.modelGun = new THREE.Mesh(
			this.geoms.gun.geom,
			new THREE.MeshPhongMaterial( { color: 0x00aa00 } )
		)
		this.modelGun.position.y = -22
		this.model.add( this.modelGun )	
	}
	
	enterHero() {
		
		this.model.add( s.carCameras.pivot )
		this.isHeroIn = true
	}
	
	move() {
		
		if ( ! this.isHeroIn ) return
		
		this.kvadrant = checkKvadrant( this.model )
				
		/** local spd for bullet */
		this.spdForBullet = {
			pXold: this.spdForBullet.pX,
			pZold: this.spdForBullet.pZ,
			pX: this.model.position.x,			
			pZ: this.model.position.z,
			x: this.spdForBullet.pXold - this.spdForBullet.pX,
			z: this.spdForBullet.pZold - this.spdForBullet.pZ 	
		}			
		
		/** update rotation gun */ 
		if ( keys.A ) this.modelGun.rotation.y += 0.01
		if ( keys.D ) this.modelGun.rotation.y -= 0.01
		if ( this.modelGun )
			s.carCameras.gun.rotation.y = this.modelGun.rotation.y  		
		
		
		/** rotation car */	
		if ( keys.left ) if ( this.spdRot < 0.01 ) this.spdRot += 0.0001		
		if ( keys.right ) if ( this.spdRot > -0.01 ) this.spdRot -= 0.0001
		if ( Math.abs( this.spdRot ) < 0.0001 ) this.spdRot = 0
	
	
		/** MOVE ****************************/
		
		/** move forward*/
		if (keys.up && this.currentFuel > 0 ) {
			
			this.spd < this.spdMax ? this.spd += 0.03 : this.spd = this.spdMax
			this.model.translateZ( -this.spd )			
			
			this.spd > 0 ?
					this.model.rotation.y += this.spdRot * Math.abs( this.spd )
				:
					this.model.rotation.y -= this.spdRot * Math.abs( this.spd )				
			
		} else { 
		
			if (this.spd > 0 && ! keys.down ) {
				this.spd -= 0.01				
				this.model.translateZ( -this.spd )
				this.model.rotation.y += this.spdRot * Math.abs( this.spd )					
			}
		}					

		/** move backward */
		if (keys.down && this.currentFuel > 0 ) {
			
			if (this.spd > 0 ) {
				
				this.spd -= 0.06 
				this.model.translateZ( -this.spd )
				this.model.rotation.y += this.spdRot * Math.abs( this.spd )
				
			} else {
				
				this.spd > this.spdBackMax ? 
					this.spd -= 0.03 : this.spd = this.spdBackMax			
				
				this.model.translateZ( -this.spd )
				this.model.rotation.y -= this.spdRot * Math.abs( this.spd )				
			}
			
		} else {
			
			if ( this.spd < 0 && ! keys.up ){
				this.model.translateZ( -this.spd )
				this.model.rotation.y -= this.spdRot * Math.abs( this.spd )					
				this.spd += 0.01 			
			}		
		}
		
		if ( Math.abs( this.spd ) > 0.1 && this.currentFuel > 0 ) this.currentFuel -= 1
	}
	
	checkLife() {
		
		if ( this.lives < 0 && this.state == "none" ) { 
			this.state ='explosive'
			//console.log('B!')
			s.rendererCreateBoomScreen()
			cope.boomForScreens()
		}	
	}

	shoot() {
		
		if ( this.ammo > 0 ) {
			this.ammo --			
			return true 
		} else { 
			this.ammo = 0
			return false 
		} 
	}		
	
	render() {
		
		if ( this.state == 'explosive' ) this.animateExplosive()
		if ( this.state == "afterExplosive" ) this.timerRemove --
		if ( this.timerRemove < 0 ) this.deleteObj()
	}

	animateExplosive() {
		
		if ( this.timerExplosion < 0 ) this.state = 'afterExplosive'
		
		geomAnimateExplosive( this.geoms.base )
		geomAnimateExplosive( this.geoms.gun )	
		
		this.timerExplosion --
	}

	deleteObj() {
		
		this.spdForBullet = null
		s.scene.remove( this.model )
		this.model = null
		this.geoms.base = null
		this.geoms.gun = null
		this.geoms = null
		this.isRemovable = true
	}

	hit( updateCopeIfIt ) {
		
		if ( Math.random() > 0.05 ) return //testFunc   
		
		if ( updateCopeIfIt ) updateCopeIfIt() 
		
		let dam = Math.floor( Math.random() * 3 )
		
		switch (  Math.floor( Math.random() * 4 ) ) { 
			case 0:	
				this.health.gun = this.minusHealth( this.health.gun, dam )
				cope.damageGun( dam )
				break
			case 1: 
				this.health.base = this.minusHealth( this.health.base, dam )
				cope.damageBase( dam )
				break
			case 2:	 
				this.health.cope = this.minusHealth( this.health.cope, dam )
				cope.damageCope( dam )
				break
			case 3:	
				this.health.weels = this.minusHealth( this.health.weels, dam )
				cope.damageWeels( dam )			
				break
		}	 					
	}

	minusHealth( val, dam ) {
		
		let l = val - dam 
		if ( l > 0 ) { return l } 
		else { return 0 }	
	}
	
	saveCopeParams( params ) {

		for ( let key in params ) this.copeParams[ key ] = params[ key ]  
	}
	
	repair() {
		
		for ( let key in this.copeParams ) {
			
			if ( typeof this.copeParams[ key ] === 'boolean' ) {
				this.copeParams[ key ] = true
			} else {
				this.copeParams[ key ] = 0
			}		
		}
		
		for ( let key in this.health ) this.health[ key ] = 20
	}
	
	checkHealth() {
		
		let h = false
		for ( let key in this.health ) {
			if ( this.health[key] < 20 ) h = true
		}
		return h	
	}		
}

Car.ID = 0	



/**************************************************;
 * CREATE CAR CAMERAS
 **************************************************/
 
initCarCameras = () => {

	s.carCameras.pivot = new THREE.Mesh(
		new THREE.BoxGeometry( 0.01, 0.01, 0.01 ),
		new THREE.MeshBasicMaterial( { color: 0x000000 } )
	)
	
	/** gun */
	let cam = new THREE.PerspectiveCamera( 20, 300 / 200, 1, 10000 )
	cam.position.set( 0, -2.5, 0 )
	s.carCameras.pivot.add( cam )
	s.carCameras.gun = cam
			
	/** front */ 
	cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
	cam.position.set( 0, -15, -30 )
	s.carCameras.pivot.add( cam )
	s.carCameras.front = cam	

	/** back */
	cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
	cam.position.set( 0, -15, 30 )
	cam.rotation.y = Math.PI
	s.carCameras.pivot.add( cam )
	s.carCameras.back = cam	

	/** left */
	cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
	cam.position.set( -20, -15, 30 )
	cam.rotation.y = Math.PI / 2	
	s.carCameras.pivot.add( cam )
	s.carCameras.left = cam	

	/** right */
	cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
	cam.position.set( 20, -15, 30 )
	cam.rotation.y = -Math.PI / 2	
	s.carCameras.pivot.add( cam )
	s.carCameras.right = cam	
}


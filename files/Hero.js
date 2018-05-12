/**************************************************;
 * HERO
 **************************************************/

class Hero {
	
	constructor( sc ) {
		
		/** params */ 	
		this.isOutOfCar = true
		this.kvadrant = { x: 0, z: 0 }
		this.nearCar = null
		
		/** camera */
		this.cam = new THREE.PerspectiveCamera( 70, 300 / 200, 1, 10000 )		
		sc.add( this.cam )
	
		/** renderer */
		this.renderPass = new THREE.RenderPass( sc, this.cam )
		s.composer.addPass( this.renderPass )
		this.renderPass.enabled = false
	
		/** buttons */
		this.htmlElems = document.getElementById( 'heroElems' )
		this.htmlElems.style.display = "none"
	}
	
	render( renderer, sc ) {
		
		this.kvadrant = checkKvadrant( this.cam )

		if ( keys.left ) this.cam.rotation.y += 0.05
		if ( keys.right ) this.cam.rotation.y -= 0.05
		if ( keys.up ) this.cam.translateZ( -0.5 )
		if ( keys.down ) this.cam.translateZ( 0.5 )	
		if ( keys.A ) this.cam.translateX( -0.7 )
		if ( keys.D ) this.cam.translateX( 0.7 )
		
		if ( ! this.nearCar ) return
		
		if ( keys.enter ) enterCope( this.nearCar )
		if ( keys.B ) addBomb( this.nearCar )
		if ( keys.R ) {
			this.nearCar.repair()
			keys.R = false
			if ( ! this.nearCar.checkHealth() ) buttRepairCar.style.opacity = 0				
		}			
	}
	
	hideView() {
		
		this.htmlElems.style.display = "none"	
	}	
	
	showView( p ) {
			
		this.cam.position.set( p.x, -22, p.z )				
		this.htmlElems.style.display = "block"
		this.renderPass.enabled = true		
	}
	
	appendNearCar(car) {
		
		if (!car) {					
			this.nearCar = null	
			setOpasityButtonsHeroNearCar(0)						
		} else {			
			buttEnterCope.style.opacity = 1.0
			if ( ! g.heroBomb ) buttAddBomb.style.opacity = 1.0	
			if ( car.checkHealth() ) buttRepairCar.style.opacity = 1.0 	
			this.nearCar = car
        }						
	}
}

const exitCope = () => {
	
	keys.enter = false	

	hero.isOutOfCar = true	
	
	hero.showView( cope.car.model.position )
	cope.hideView()

	cope.renderPass.enabled = false
	hero.renderPass.enabled = true
}

const enterCope = car => {
	
	keys.enter = false	
	
	hero.isOutOfCar = false	
		
	hero.hideView()
	car.enterHero()
	cope.showView( car )
	
	hero.renderPass.enabled = false
	cope.renderPass.enabled = true
}

const addBomb = car => {
	
	if ( ! g.heroBomb ) g.heroBomb = new Bomb( car )
	buttAddBomb.style.opacity = 0	
}


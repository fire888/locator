 
/**************************************************;
 * VIRTUAL SCENE FOR COPE CLOCKS
 **************************************************/
 
const sv = {} 

sv.spaceVirt = () => {

	
	/** SCENE FOR COPE CLOCKS *********************/
	
	sv.scene = new THREE.Scene()
	sv.scene.background = new THREE.Color( 0x002500 )
	sv.scene.fog = new THREE.FogExp2( 0x002500, 0.0012 )		
	
	sv.ambient = new THREE.AmbientLight( 0x002500, 1.0 )
	sv.scene.add( sv.ambient )	
	
	sv.camera =  new THREE.PerspectiveCamera( 70, 300 / 300, 1, 10000 )
	sv.camera.position.y = 100
	sv.camera.lookAt( sv.scene.position )
	
	sv.cameraParams = new THREE.PerspectiveCamera( 70, 300 / 300, 1, 10000 )
	sv.cameraParams.position.set( 1000, 70, 130 )

	sv.helper = new THREE.PolarGridHelper( 60, 8, 3, 64 );
	sv.scene.add( sv.helper )
	
	
	/** LOCATOR LABELS ****************************/
	
	sv.targetMesh = new THREE.Mesh(
		new THREE.CircleGeometry( 3, 12 ),
		new THREE.MeshBasicMaterial( { color: 0x007733 } )
	)
	sv.targetMesh.rotation.x = -Math.PI / 2
	sv.arrTargets = []
	

	/** HEALTH LABELS ****************************/
	
	sv.lableGun = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 30, 10, 12 ),
		new THREE.MeshBasicMaterial( { color: 0x007733 } )
	)
	sv.lableGun.position.set( 950, 120, 0 )
	sv.scene.add( sv.lableGun ) 

	sv.lableCope = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 30, 10, 12 ),
		new THREE.MeshBasicMaterial( { color: 0x007733 } )
	)
	sv.lableCope.position.set( 950, 90, 0 )
	sv.scene.add( sv.lableCope ) 	
	
	sv.lableBase = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 30, 10, 12 ),
		new THREE.MeshBasicMaterial( { color: 0x007733 } )
	)
	sv.lableBase.position.set( 950, 60, 0 )
	sv.scene.add( sv.lableBase ) 

	sv.lableWeels = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 30, 10, 12 ),
		new THREE.MeshBasicMaterial( { color: 0x007733 } )
	)
	sv.lableWeels.position.set( 950, 30, 0 )
	sv.scene.add( sv.lableWeels )

	sv.lableHealth = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 3, 10, 1 ),
		new THREE.MeshBasicMaterial( { color: 0x007733 } )
	)  	
}


/** FUNCTIONS LABELS LOCATOR ******************/

sv.createNewLabel = car => {
	
	let l = sv.targetMesh.clone()
	sv.scene.add( l )	
	l.position.x = car.model.position.x / 100
	l.position.z = car.model.position.z / 100		
	
	sv.arrTargets.push( {
		id: car.id,
		mesh: l	
	} )
}

sv.removeLabel = car => {
	 
	sv.arrTargets.forEach( ( label, i, arr ) => {
		if ( label.id == car.id ) {
		  sv.scene.remove( label.mesh )	  
		  arr.splice( i, 1 )
		  label = null	
		  return
		}
	} )
}	

sv.update = car => {
	
	/** update labels */
	g.arrCars.forEach( car => { 
		sv.arrTargets.forEach ( ( label, i, arr )=> {
	
			if ( car.id == label.id ) {
				label.mesh.position.x = car.model.position.x / 100
				label.mesh.position.z = car.model.position.z / 100				
			}
										
		} )
	} )
	
	/** update locator */
	sv.camera.position.x = car.model.position.x / 100
	sv.camera.position.z = car.model.position.z / 100
	sv.camera.rotation.z = car.model.rotation.y 
	sv.helper.rotation.y = car.model.rotation.y 
	sv.helper.position.set( sv.camera.position.x, 0, sv.camera.position.z ) 	
}


/** FUNCTIONS LABELS HEALTH *******************/

sv.updateLabelBar = ( 

	d = { 
		width: 100, 
		x: 0, y: 0,
		arr: [],
		parentObj: cope.sc,
		count: 20 
	} ) => {
	
	if ( d.arr.length != 0 ) {
		sv.removeAllBar( d ) 
	} else {
		d.arr = []
	}
		
	for ( let i = 0; i < d.count; i ++ ){
		let ln = sv.lableHealth.clone()
		ln.position.set( d.width / 20 * i + 980, d.y + 70 , 5 )  
		sv.scene.add( ln )
		d.arr.push( ln )
	}	
	return d
}

sv.removeAllBar = d => {

	for ( let i = 0; i < d.arr.length; i ++ ) {
		
		sv.scene.remove( d.arr[ d.arr.length-1 ] )
		d.arr[ d.arr.length-1 ] = null
		d.arr.splice( d.arr.length-1, 1 )
	}
}


/**************************************************;
 * COPE
 **************************************************/

class Cope {
	
	constructor() {
		
		
		/** PARAMS *******************************/	
		
		this.car = null
		this.isCanExit = true
			
	
		/** INIT SCENE CABINE ********************/		

		this.sc = new THREE.Scene()
		this.textureBack = new THREE.TextureLoader().load( "files/assets/back.jpg", 
				() => cope.sc.background = cope.textureBack 	
			)
	
		this.cam = new THREE.PerspectiveCamera( 70, 300 / 200, 1, 10000 )
		this.cam.position.set( 0, 0, 600 )
		this.sc.add( this.cam )
		
		this.light = new THREE.AmbientLight( 0xffffff, 1.0 )
		this.sc.add( this.light )
		
		this.backColor = 0x000300
		this.scrColor = 0x002500
		this.noiseShaderMat = new THREE.ShaderMaterial( NoiseShader )
		this.matClocksLight = new THREE.MeshBasicMaterial( { color: 0x008000 } )
		this.matScreens = new THREE.MeshBasicMaterial( { color: 0x003500 } )		
		this.matBlackFrames = new THREE.MeshBasicMaterial( { color: this.backColor } )			
		
		this.renderPass = new THREE.RenderPass( this.sc, this.cam )
		this.renderPass.enabled = false		
		s.composer.addPass( this.renderPass )


		
		/** BACKGROUND PLANES ********************/
		
		/** health bar */
		let back = new THREE.Mesh(
			new THREE.PlaneGeometry( 230, 150 ),
			this.matBlackFrames
		)
		back.position.set( -280, -240, 50  )
		back.rotation.x = -0.4			
		this.sc.add( back )	
		
		/** rotations bar */
		back = new THREE.Mesh(
			new THREE.CircleGeometry( 55, 32 ),
			this.matBlackFrames	
		) 
		back.position.set( 0, -140, -3 )
		back.rotation.x = 0.2			
		this.sc.add( back )	

		/** compas bar */ 
		back = new THREE.Mesh(
			new THREE.CircleGeometry( 50, 32 ),
			this.matBlackFrames	
		) 
		back.position.set( -250, 140, 45 )
		back.rotation.x = 0.2 
		back.rotation.y = 0.7			
		this.sc.add( back )
		
		/** locator */
		back = new THREE.Mesh(
			new THREE.CircleGeometry( 125, 28 ),
			this.matBlackFrames	
		) 
		back.position.set( -370, 215, 55 )
		back.rotation.x = 0.2 
		back.rotation.y = 0.7			
		this.sc.add( back )				
		
		/** ammo/fuel back plane */
		back = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 115, 230 ),
			this.matBlackFrames				
		) 
		back.position.set( 340, 200, 50 )
		back.rotation.x = 0.2	
		back.rotation.y = -0.7		
		this.sc.add( back )

		/** exit back */
		back = new THREE.Mesh(
			new THREE.PlaneGeometry( 230, 130 ),
			this.matBlackFrames	
		)
		back.position.set( 285, -235, 60 )			
		this.sc.add( back )		
		

		/** BUTTONS INIT **************************/
				
		this.htmlElems = document.getElementById( 'copeElems' )	
		this.htmlElems.style.display = "none"		
		
		
		/** SCREENS INIT *************************/
		
		this.screens = {
			
			gun: {
				type: 'screen',				
				pos: { width: 700, height: 250, x: 0, y: 300, z: -30, rX: 0.2, rY: 0 },
				typeGeom: 'plane',				
				mesh: null, map: null, mat: null, uniforms: null,
				standartNoise: 0.08,
				scene: s.scene,					
				camera: s.carCameras.gun,
				init: ( s ) => { this.createScreen( s ) }	
			},
			front: {
				type: 'screen',						
				pos: { width: 420, height: 260, x: 0, y: -20, z: -30, rX: 0, rY: 0 },
				typeGeom: 'plane',
				mesh: null, map: null, mat: null, uniforms: null, 
				standartNoise: 0.08,					
				scene: s.scene,					
				camera: s.carCameras.front,
				init: ( s ) => { this.createScreen( s ) }	  				
			},
			back: {
				type: 'screen',						
				pos: { width: 440, height: 210, x: 0, y: -280, z:-30, rX: -0.3, rY: 0 },
				typeGeom: 'plane',
				mesh: null, map: null, mat: null, uniforms: null, 	
				standartNoise: 0.08,				
				scene: s.scene,					
				camera: s.carCameras.back,
				init: ( s ) => { this.createScreen( s ) }	   				
			},
			left: {
				type: 'screen',						
				pos: { width: 350, height: 320, x: -380, y: -28, z: -30, rX: 0, rY: 1.0 },
				typeGeom: 'plane',	
				mesh: null, map: null, mat: null, uniforms: null, 
				standartNoise: 0.08,				
				scene: s.scene,					
				camera: s.carCameras.left,
				init: ( s ) => { this.createScreen( s ) }					
			},
			right: {
				type: 'screen',						
				pos: { width: 350, height: 320, x: 380, y: -28, z: 0, rX: 0, rY: -1.0 },
				typeGeom: 'plane',
				mesh: null, map: null, mat: null, uniforms: null, 
				standartNoise: 0.08,				
				scene: s.scene,				
				camera: s.carCameras.right,
				init: ( s ) => { this.createScreen( s ) }						
			},
			locator: {
				type: 'screen',						
				pos: { width: 220, height: 220, x: -370, y: 215, z: 60, rX: 0.2, rY: 0.7 },
				typeGeom: 'circle',
				mesh: null, map: null, mat: null, uniforms: null, 
				standartNoise: 0.0,				
				scene: sv.scene,	
				camera: sv.camera,	
				init: ( s ) => { this.createScreen( s ) }					
			},
			health: {
				type: 'screen',						
				pos: { width: 210, height: 130, x: -280, y: -240, z: 53, rX: -0.4, rY: 0 },
				typeGeom: 'plane',
				mesh: null, map: null, mat: null, uniforms: null, 
				standartNoise: 0.0,				
				scene: sv.scene,	
				camera: sv.cameraParams,
				init: ( s ) => { this.createScreen( s ) },				
				indicators: {
					gun: sv.updateLabelBar( { 
						width: 100, x: -15, y: 40, 
						arr: [],
						count: 20	
					} ),	
					cope: sv.updateLabelBar( { 
						width: 100, x: -15, y: 15, 
						arr: [],
						count: 20		
					} ),	
					base: sv.updateLabelBar( { 
						width: 100, x: -15, y: -10,
						arr: [],	
						count: 20	
					} ),	
					weels: sv.updateLabelBar( { 
						width: 100, x: -15, y: -35, arr: [],
						count: 20	
					} )				
				}					
			},
			ammo: {
				type: 'bar',
				labelProto: null,
				screen: null,
				screenNoiseMap: createNoiseTexture( 35, 200 ),
				obj: null,
				arrChildrens: null,
				init: ( s ) => { this.initAmmoBar( s ) } 
			},
			fuel: {
				type: 'bar',				
				screen: null,
				screenNoiseMap: createNoiseTexture( 35, 200 ),				
				obj: null,
				arrChildrens: null,
				init: ( s ) => { this.initFuelBar( s ) } 
			},
			rotations: {
				type: 'bar',				
				screen: null,
				screenNoiseMap: createNoiseTexture( 100, 100 ),				
				obj: null,
				arrChildrens: null,
				init: ( s ) => { this.initRotationsBar( s ) } 
			},
			compas: {
				type: 'bar',				
				screen: null,
				screenNoiseMap: createNoiseTexture( 100, 100 ),					
				obj: null,
				arrChildrens: null,
				init: ( s ) => { this.initCompasBar( s ) } 			
			}
		}
		
		for ( let key in this.screens ) this.screens[ key ].init( this.screens[ key ] )				
	}

	createScreen( obj ) {
			
		obj.map = new THREE.WebGLRenderTarget( 
			obj.pos.width, obj.pos.height, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		obj.mat = this.noiseShaderMat.clone()
		
		if ( obj.typeGeom == 'plane')	
			obj.mesh = new THREE.Mesh(
				new THREE.PlaneGeometry( obj.pos.width, obj.pos.height ),
				obj.mat
			)

		if ( obj.typeGeom == 'circle')	
			obj.mesh = new THREE.Mesh(
				new THREE.CircleGeometry( obj.pos.width/2, 28 ),
				obj.mat
			)			
			
		obj.uniforms = obj.mat.uniforms
		obj.uniforms.render.value = obj.map.texture
		
		obj.mesh.position.set( obj.pos.x, obj.pos.y, obj.pos.z )
		obj.mesh.rotation.set( obj.pos.rX, obj.pos.rY, 0 )		
		this.sc.add( obj.mesh )			
	}
	
	
	/** UPDATE COPE PER SECOND ********************/
		
	render( scene, renderer, time ) {
		
		if ( ! this.car ) return
		
		if ( this.car.state != 'explosive' ) { 
		  this.car.move() 
		} else  { 
		  return exitCope()
		}		
		
		/** draw Compass */
		this.screens.compas.obj.rotation.z = -this.car.model.rotation.y
		
		/** draw gunRotation */
		this.screens.rotations.laberGunRot.rotation.z = this.car.modelGun.rotation.y
		
		/** draw Locator scene */
		sv.update( this.car )
		
		/** draw Fuel */
		if ( Math.abs( this.car.spd ) > 0.1 && this.car.currentFuel > 0 ) { 
			this.updateFuelBar()
		}
		
		/** draw Weels */ 
		this.updateWeelsBar()
		
		/** update cope buttons */ 
		if ( this.car.spd > 1 ) {
			buttExitCope.style.opacity = 0.3
			this.isCanExit = false
		} else { 
			buttExitCope.style.opacity = 1.0
			this.isCanExit = true
		}
					
		/** render cope screens */	
		this.updateScreens( renderer, time )

		/** exit cope */
		if ( keys.enter && this.isCanExit ) exitCope()

		/** shoot */
		if ( keys.space ) {
			if ( this.car.shoot() ) { 
				this.removeBulletShoot()	
				keys.space = false
				this.screens.gun.uniforms.amountNoise.value = 0.3
				let bullet = new Bullet( this.car )
			}	
		}			
	}


	/** EXIT / ENTER COPE FUNCTIONS ***************/
	
	hideView() {
		
		this.htmlElems.style.display = "none"
		this.car.saveCopeParams( this.saveInCarCopeParams() )	
		this.car = null
		this.dellBullets() 
	}
	
	showView( car ) {
		
		this.htmlElems.style.display = "block"
		this.car = car
		this.setScreensAmountnoise( this.car.copeParams )
		this.createBulletsBar( car )	
		this.updateFuelBar()
	}
	
	saveInCarCopeParams() {
		
		let obj = {}
		for ( let key in this.bars ) obj[ key ] = this.bars[ key ].obj.visible	
		for ( let key in this.screens ) obj[ key ] = this.screens[ key ].standartNoise

		return obj	
	}

	setScreensAmountnoise( ob ) {

		for ( let key in ob ) {

			if ( typeof ob[ key ] == 'boolean' ) {
				
				if ( ob[ key ] === true ) {

					this.showBar( this.screens[ key ] ) 
				} else {
					this.destroyBar( this.screens[ key ] )
				}
				
			} else {
				
				if ( this.screens[ key ].type != "screen" ) break
				this.screens[ key ].standartNoise = this.screens[ key ].uniforms.amountNoise.value = ob[ key ]			
			
			}
		}
	}	


	/** SET DAMAGES TO CLOCKS ************/
	
	damageGun( dam ) {
		
		this.screens.gun.standartNoise = 1.0 - this.car.health.gun / 20
		if ( this.car.health.gun < 5 && this.screens.ammo.obj.visible ) 
			this.destroyBar( this.screens.ammo )
	}	

	damageBase( dam ) {
		
		let minus = 4/20 * dam 		
		switch ( Math.floor( Math.random() * 4 ) ) {
			case 0:
				this.screens.front.standartNoise = this.minusDamage( this.screens.front.standartNoise, minus ) 			
				break
			case 1:
				this.screens.back.standartNoise = this.minusDamage( this.screens.back.standartNoise, minus )		
				break	
			case 2:
				this.screens.left.standartNoise = this.minusDamage( this.screens.left.standartNoise, minus )		
				break	
			case 3:
				this.screens.right.standartNoise = this.minusDamage( this.screens.right.standartNoise, minus ) 			
				break				
		}	
	}
	
	damageCope( dam ) {
		
		let minus = 3/20 * dam 		
		switch ( Math.floor( Math.random() * 3 ) ) {
			case 0:
				this.screens.locator.standartNoise = this.minusDamage( this.screens.locator.standartNoise, minus ) 			
				break
			case 1:
				this.screens.health.standartNoise = this.minusDamage( this.screens.health.standartNoise, minus )		
				break
			case 2:
				if ( this.screens.compas.obj.visible && this.car.health.cope < 5 ) this.destroyBar( this.screens.compas )		
				break			
		}	
	}

	damageWeels( dam ) {
		
		if ( this.car.health.weels < 5 && this.screens.fuel.obj.visible) this.destroyBar( this.screens.fuel )				
		if ( this.car.health.weels < 11 && this.screens.rotations.obj.visible) this.destroyBar( this.screens.rotations )				
	}		

	minusDamage( val, minus ) {
		
		let result = val + minus
		if ( result > 1 ) {
			return 1
		} else {
			return result
		}
	}		

	boomForScreens() {
		
		for ( var key in this.screens ) {
			
			if ( this.screens[ key ].type != "screen" ) break 
			this.screens[key].uniforms.amountNoise.value = Math.random() * 0.5 + 0.2
		}
	}	
	
		
	/** UPDATE VIEWS SCREENS ***************/ 

	updateScreens( renderer, time ) {

		for ( let key in this.screens ) {
			
			if ( this.screens[key].type != "screen" ) break
			
			let obj = this.screens[ key ]			
			obj.uniforms.iTime.value += time * 5
			obj.uniforms.amountNoise.value > obj.standartNoise ? 
				obj.uniforms.amountNoise.value -= 0.01 
				: 
				obj.uniforms.amountNoise.value = obj.standartNoise  			
			
			renderer.render( obj.scene, obj.camera, obj.map )	
		}	
	}
	
	updateHealthScreenBars() {
		
		for ( let key in this.screens.health.indicators ) {
			this.screens.health.indicators[ key ].count = this.car.health[ key ]
			sv.updateLabelBar( this.screens.health.indicators[ key ] )
		}				
	}		

	
	/** AMMO BAR FUNCTIONS ************************/
	
	initAmmoBar( b = {				
					screen: null,
					obj: null,
					arrChildrens: null,
					update: null,
				} ) {
					
		b.screen = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 35, 200 ),
			this.matScreens			
		) 
		b.screen.position.set( 310, 200, 50 )
		b.screen.rotation.x = 0.2	
		b.screen.rotation.y = -0.7			
		this.sc.add( b.screen )	
		
		b.obj = new THREE.Object3D()
		b.screen.add(b.obj)
		
		b.labelProto = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10, 3, 3 ),
			this.matClocksLight
		)
		b.arrChildrens = []
	}		
	
	createBulletsBar( car ) {
	
		for ( let i = 0; i < car.ammo; i ++ ) {
			let b = this.screens.ammo.labelProto.clone()
			b.position.x = 3
			b.position.y = i * 6 - 85
			b.position.z = 2
			this.screens.ammo.obj.add( b )
			this.screens.ammo.arrChildrens.push( b )
		}
	}

	removeBulletShoot() {
	
		this.screens.ammo.obj.remove( this.screens.ammo.arrChildrens[ this.screens.ammo.arrChildrens.length - 1 ] )
		this.screens.ammo.arrChildrens[ this.screens.ammo.arrChildrens.length - 1 ] = null
		this.screens.ammo.arrChildrens.splice( this.screens.ammo.arrChildrens.length - 1, 1 )
	}

	dellBullets() {
	
		for ( let i = 0; i < this.screens.ammo.arrChildrens.length; i ++  ) {
			this.screens.ammo.obj.remove(this.screens.ammo.arrChildrens[ i ] )
			this.screens.ammo.arrChildrens[ this.screens.ammo.arrChildrens.length[ i ] ] = null		
			this.screens.ammo.arrChildrens.splice( i, 1 )
			i --
		}
	}

	
	/** FUEL BAR FUNCTIONS ************************/
	
	initFuelBar( b = {				
					screen: null,
					obj: null,
					arrChildrens: null,
					update: null,
				} ) {
					
		b.screen = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 35, 200 ),
			this.matScreens			
		) 
		b.screen.position.set( 350, 195, 70)
		b.screen.rotation.x = 0.2	
		b.screen.rotation.y = -0.7			
		this.sc.add( b.screen )	
		
		b.obj = new THREE.Object3D()
		b.screen.add(b.obj)
		
		b.label = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10, 170 ),
			this.matClocksLight
		)
		b.label.position.z = 5
		b.label.position.y = 0
		b.obj.add( b.label ) 
	}
	
	updateFuelBar() {
		
		if ( this.car.currentFuel > 1 ) {
			this.screens.fuel.label.scale.y = this.car.currentFuel / this.car.allFuel
			this.screens.fuel.label.position.y =  this.screens.fuel.label.scale.y * 90 - 90
		} else {
			this.screens.fuel.label.scale.y = 0.000001
		}			
	}
	

	/** COMPAS BAR FUNCTIONS ************************/		
	
	initCompasBar( b = {				
					screen: null,
					obj: null,
					arrChildrens: null,
					update: null,
				} ) {
					
		b.screen = new THREE.Mesh(
			new THREE.CircleGeometry( 35, 32 ),
			this.matScreens	
		)
		b.screen.position.set( -250, 140, 50 )
		b.screen.rotation.x = 0.2	
		b.screen.rotation.y = 0.7			
		this.sc.add( b.screen )	
		
		b.obj = new THREE.Object3D()
		b.screen.add(b.obj)
		
		b.label1 = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 3, 30, 1 ),
			this.matClocksLight
		)
		b.label1.rotation.x = 0
		b.label1.position.set( 0, 15, 7 )
		b.obj.add( b.label1 )
		
		b.label2 = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 3, 30, 1 ),
			new THREE.MeshBasicMaterial( { color: 0x000000 } )
		)
		b.label2.rotation.x = 0
		b.label2.position.set( 0, -15, 7 )
		b.obj.add( b.label2 )		
	}	
	
	
	/** ROTATIONS BAR FUNCTIONS ************************/	
	
	initRotationsBar( b = {				
					screen: null,
					obj: null,
					arrChildrens: null,
					update: null,
				} ) {
					
		b.screen = new THREE.Mesh(
			new THREE.CircleGeometry( 45, 32 ),
			this.matScreens		
		) 
		b.screen.position.set( 0, -140, 0 )
		b.screen.rotation.x = 0.2			
		this.sc.add( b.screen )	
		
		b.obj = new THREE.Object3D()
		b.screen.add(b.obj)
		
		b.labelFL = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 9, 25 ),
			this.matClocksLight		
		)
		b.labelFL.position.set( -18, 20, 3 )
		b.obj.add( b.labelFL )

		b.labelFR = b.labelFL.clone()
		b.labelFR.position.set( 18, 20, 3 )
		b.obj.add( b.labelFR )	

		b.labelBL = b.labelFL.clone()
		b.labelBL.position.set( -18, -20, 3 )
		b.obj.add( b.labelBL )	

		b.labelBR = b.labelFL.clone()
		b.labelBR.position.set( 18, -20, 3 )
		b.obj.add( b.labelBR )

		/** gun rotation */
		b.laberGunRot = new THREE.Mesh(
			new THREE.CircleGeometry( 10, 32 ),
			this.matClocksLight	
		)
		b.laberGunRot.position.set( 0, 0, 8 )
		b.obj.add( b.laberGunRot )

		b.labelGun = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 7, 35 ),
			this.matClocksLight		
		)
		b.labelGun.position.set( 0, 10, 9 )
		b.laberGunRot.add( b.labelGun )		
	}	
	
	updateWeelsBar() {
		
		this.screens.rotations.labelFL.rotation.z = this.car.spdRot * 70.0
		this.screens.rotations.labelFR.rotation.z = this.car.spdRot * 70.0		
	}	
	
	
	/** FUNCTIONS FOR ALL BARS **************************/
	
	destroyBar( b ) {
		
		if ( b.obj.visible ) { 
			b.obj.visible = false
			b.screen.material = new THREE.MeshLambertMaterial( { map: b.screenNoiseMap } )
			b.screen.material.needsUpdate = true
		}	
	}

	showBar( b ) {
	
		b.screen.material = this.matScreens	
		b.screen.material.needsUpdate = true
		b.obj.visible = true
	}		
	
}


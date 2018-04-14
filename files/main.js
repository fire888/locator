
"use strict";



/**
 **************************************************; 
 *	Project        	:	LOCATOR 
 *	Program name   	: 	Threejs scene 
 *	Author         	: 	www.otrisovano.ru
 *	Date           	: 	16/03/2018
 *	Purpose        	: 	check brain   
 **************************************************/ 

 
 
/**************************************************;
 * VARS SPACES
 **************************************************/
 
/** obj game */
const g = {
	arrBullets: [],
	arrCars: [],
	heroBomb: null
}

/** obj scene */
const s = {
	loader: new THREE.OBJLoader(),
	geomCar: null,
	geomCarGun: null,
	carCameras: {}	
} 

let cope, hero



/**************************************************;
 * LOAD SCENE
 **************************************************/

const loadAssets = () => {
	
	return new Promise( ( resolve ) => {
		
		s.loader.load( 'files/assets/car.obj', ( obj ) => {
				
			obj.traverse( function ( child ) {
					
				if ( child instanceof THREE.Mesh != true ) return
				if ( typeof child.geometry.attributes.position.array != "object" ) return
					
				s.geomCar = child.geometry
				resolve() 
			} )
		} )	
	} )
	.then( () => {
		
		return new Promise( ( resolve ) => { 
			
			s.loader.load( 'files/assets/carGun.obj', ( obj ) => {	
				
				obj.traverse( ( child ) => {
					
					if ( child instanceof THREE.Mesh != true ) return
					if ( typeof child.geometry.attributes.position.array != "object" ) return
					
					s.geomCarGun = child.geometry
					resolve()
				} )
			} )
		} )
	} )
	.then( () => {
		
		initRenderer()
		s.initScene()
		sv.spaceVirt()		
		initCarCameras()
	
		cope = new Cope()	
		cope.renderPass.enabled = false
		
		hero = new Hero( s.scene )
		hero.renderPass.enabled = true
		
		hero.showView({ x: 0, z: 0 })			
		
		for ( let i = 0; i < 7; i ++  ) {
			
			let car = new Car( {
				pos: { 
					x: Math.random() * 100 - 50,
					z: Math.random() * 1000 - 500 	
				}
			} )
			g.arrCars.push( car )	
		}
				
		animate()			
	} )
}

loadAssets()
  
  
  
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
			new THREE.MeshPhongMaterial( { color: 0xdddd55 } )
		)
		this.modelBase.position.y = -22 
		this.model.add(this.modelBase)
		
		/** prepear gun */
		this.geoms.gun =  prepearGeometryToExploisive( s.geomCarGun.clone() ) 
		this.modelGun = new THREE.Mesh(
			this.geoms.gun.geom,
			new THREE.MeshPhongMaterial( { color: 0x05e099 } )
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

	hit() {
		
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
 

  
/**************************************************;
 * BULLET
 **************************************************/

class Bullet {

	constructor( car ) {
		
		g.arrBullets.push( this )
		
		this.id = Bullet.ID ++		
		this.isRemovable = false

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



/**************************************************;
 * VIRTUAL SCENE FOR COPE CLOCKS
 **************************************************/
 
const sv = {} 

sv.spaceVirt = () => {

	
	/** SCENE FOR COPE CLOCKS *********************/
	
	sv.scene = new THREE.Scene()
	sv.scene.background = new THREE.Color( 0x060c1a )
	sv.scene.fog = new THREE.FogExp2( 0x060c1a, 0.0012 )		
	
	sv.ambient = new THREE.AmbientLight( 0x06253a, 1.0 )
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

sv.update = car => {
	
	/** update labels */
	g.arrCars.forEach( car => { 
		sv.arrTargets.forEach ( ( label, i, arr )=> {
			if ( car.state == "none" ) {
			
				if ( car.id == label.id ) {
					label.mesh.position.x = car.model.position.x / 100
					label.mesh.position.z = car.model.position.z / 100				
				}
				
			} else {
				
				/** delete label if car explosive */
				if ( car.id == label.id ) {
					sv.scene.remove( label.mesh )
					label.mesh = null
					let md = arr[ i ]
					arr.splice( i, 1 )
					i--	
					md = null
				}				
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
 * COPE SCREENS SHADER
 **************************************************/

const NoiseShader = {
	
	uniforms: {
		
		iTime: { value: 0.1 },
		amountNoise: { value: 0.5 },
		render: { value: null } 
	},
	
	vertexShader: [
	
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"), 
	
	fragmentShader: [  
	
		// Gold Noise ©2017-2018 dcerisano@standard3d.com
		// - based on the Golden Ratio, PI and the Square Root of Two
		// - fastest noise generator function
		// - works with all chipsets (including low precision)

		'precision lowp  float;',
		
		'varying vec2 vUv;',
		'uniform float iTime;',
		'uniform sampler2D render;',
		'uniform float amountNoise;',	

		'float PHI = 1.61803398874989484820459 * 00000.1;', // Golden Ratio   
		'float PI  = 3.14159265358979323846264 * 00000.1;', // PI
		'float SQ2 = 1.41421356237309504880169 * 10000.0;', // Square Root of Two

		'float gold_noise(in vec2 coordinate, in float seed){',
			'return fract(sin(dot(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);',
		'}',
		
		'void main(){',   
			'vec2 uv = vUv;',
			'vec4 r = texture2D( render, uv );',
			'float n = gold_noise(uv, iTime);',
			'gl_FragColor  = vec4( n * 0.6, n * 0.6, n * 0.6,  1.0) * amountNoise * 2.0 + r * ( 1.0 - amountNoise );',
		'}'
	].join("\n")
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
		
		this.backColor = 0x080603
		this.scrColor = 0x060c1a
		this.noiseShaderMat = new THREE.ShaderMaterial( NoiseShader )
		this.matClocksLight = new THREE.MeshBasicMaterial( { color: 0x007733 } )
		this.matScreens = new THREE.MeshBasicMaterial( { color: 0x060c1a } )		
		this.matBlackFrames = new THREE.MeshBasicMaterial( { color: this.backColor } )			
		
		this.renderPass = new THREE.RenderPass( this.sc, this.cam )
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
				standartNoise: 0.02,				
				scene: sv.scene,	
				camera: sv.camera,	
				init: ( s ) => { this.createScreen( s ) }					
			},
			health: {
				type: 'screen',						
				pos: { width: 210, height: 130, x: -280, y: -240, z: 53, rX: -0.4, rY: 0 },
				typeGeom: 'plane',
				mesh: null, map: null, mat: null, uniforms: null, 
				standartNoise: 0.02,				
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
			},			
		}
		
		for ( let key in this.screens ) this.screens[ key ].init( this.screens[ key ] )				
	}
	
	
	/** UPDATE COPE PER SECOND ********************/
		
	render( scene, renderer, time ) {
		
		if ( ! this.car ) return
			
		
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
		this.setScreensAmountnoise( car.copeParams )
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
			if ( typeof ob[ key ] === "boolean" ) {
				ob[ key ] == true ? this.showBar( this.screens[ key ] ) : this.destroyBar( this.screens[ key ] )					
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
			
			if ( this.screens[key].type != "screen") break
			
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
	
	
	/** FUNCTIONS FOR ALL SCREENS ************************/	
	
	createScreen( obj ) {
			
			//console.log( obj )
			obj.map = new THREE.WebGLRenderTarget( 
				obj.pos.width, obj.pos.height, { 
					minFilter: THREE.LinearFilter, 
					magFilter: THREE.NearestFilter
				} )
			obj.mat = this.noiseShaderMat.clone()
			
			if ( obj.typeGeom == 'plane')	
				console.log('!')
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



/**************************************************;
 * HERO
 **************************************************/

class Hero {
	
	constructor( sc ) {
		
		/** params */ 	
		this.isMove = true
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
		this.hideButtonsCar()
	}
	
	render( renderer, sc ) {
		
		if ( ! this.isMove ) return		

		/** check position near car and enter */
		this.kvadrant = checkKvadrant( this.cam )

		/** move hero */
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
	}
	
	showButtonsCar( car ) {
		
		buttEnterCope.style.opacity = 1.0
		if ( ! g.heroBomb ) buttAddBomb.style.opacity = 1.0	
		if ( car.checkHealth() ) buttRepairCar.style.opacity = 1.0 	
		this.nearCar = car
	}
	
	hideButtonsCar() {
		
		buttEnterCope.style.opacity = 0
		buttAddBomb.style.opacity = 0
		buttRepairCar.style.opacity = 0 			
		this.nearCar = null	
	}
}



/**************************************************;
 * HERO FUNCTIONS  
 **************************************************/ 
 
const exitCope = () => {
	
	keys.enter = false	

	hero.isMove = true	
	
	hero.showView( cope.car.model.position )
	cope.hideView()

	cope.renderPass.enabled = false
	hero.renderPass.enabled = true
}

const enterCope = car => {
	
	keys.enter = false	
	
	hero.isMove = false	
		
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
 
 
  
/**************************************************;
 * FUNCTIONS FOR SCENE OBJECTS 
 **************************************************/ 

const checkKvadrant = obj => {
	
	return ( { 
		x: Math.floor( obj.position.x / 30 ),
		z: Math.floor( obj.position.z / 30 )	 
	} )
}

const prepearGeometryToExploisive = ob => {
		
	let gObject = {
		constY: [],	
		constZ: [],	
		constX: [],
		spdBoom: [],
		geom: ob 			
	}

	let geometry = new THREE.Geometry().fromBufferGeometry( gObject.geom )
		
	for ( let vi = 0; vi < geometry.vertices.length; vi ++ ) {
			
		gObject.constY.push( geometry.vertices[ vi ].y )   
		gObject.constZ.push( geometry.vertices[ vi ].z ) 		
		gObject.constX.push( geometry.vertices[ vi ].x )

		gObject.spdBoom.push( {
			x: Math.random() - 0.5, 
			y: Math.random(),  
			z: Math.random() - 0.5  				
		} )	
	}	
	
	gObject.geom = geometry 
		
	return gObject	
}

const geomAnimateExplosive = b => {
	
	let { spdBoom, geom, constX, constY, constZ } = b
	
	for ( let i = 0, l = geom.vertices.length; i < l; i += 3 ) {
			
		if ( geom.vertices[ i ].y > -10 ) {
			
			spdBoom[ i ].y -= 0.008
			
		} else {
			
			b.spdBoom[ i ].y = 0
				
			let z = Math.sign( spdBoom[ i ].x )
			let v = Math.abs( spdBoom[ i ].x )
			if ( v > 0 ) spdBoom[ i ].x = ( v - 0.01 ) * z 
				
			z = Math.sign( spdBoom[ i ].z )
			v = Math.abs( spdBoom[ i ].z )
			if ( v > 0 ) spdBoom[ i ].z = ( v - 0.01 ) * z
		}

		geom.vertices[ i ].x = constX[ i ] += spdBoom[ i ].x
		geom.vertices[ i ].y = constY[ i ] += spdBoom[ i ].y
		geom.vertices[ i ].z = constZ[ i ] += spdBoom[ i ].z
		geom.vertices[ i+1 ].x = constX[ i+1 ] += spdBoom[ i ].x
		geom.vertices[ i+1 ].y = constY[ i+1 ] += spdBoom[ i ].y
		geom.vertices[ i+1 ].z = constZ[ i+1 ] += spdBoom[ i ].z	
		geom.vertices[ i+2 ].x = constX[ i+2 ] += spdBoom[ i ].x
		geom.vertices[ i+2 ].y = constY[ i+2 ] += spdBoom[ i ].y
		geom.vertices[ i+2 ].z = constZ[ i+2 ] += spdBoom[ i ].z				
	}
		
	geom.verticesNeedUpdate = true
}

const createNoiseTexture = ( w, h ) => {
	
	const pixelData = []
	for ( let y = 0; y < w; ++y ) {
		for ( let x = 0; x < h; ++x ) {
			const a = Math.floor( Math.random() * 256 )
			pixelData.push( a, a, a, 1 )
		}
	}
	const dataTexture = new THREE.DataTexture(
		Uint8Array.from( pixelData ),
		w,
		h,
		THREE.RGBAFormat,
		THREE.UnsignedByteType,
		THREE.UVMapping
	)
	dataTexture.needsUpdate = true

	return dataTexture
}

 
 
/**************************************************;
 * CREATE THREE CANVAS
 **************************************************/
 
const initRenderer = () => { 
	
	s.renderer = new THREE.WebGLRenderer()
	s.renderer.setPixelRatio( window.devicePixelRatio )
	s.renderer.setSize( window.innerWidth, window.innerHeight )
	s.renderer.setClearColor( 0xffffff )
	document.body.appendChild( s.renderer.domElement )

	s.composer = new THREE.EffectComposer( s.renderer )	

	s.simplePass = new THREE.ShaderPass( SimpleShader )
	s.composer.addPass( s.simplePass )
	s.simplePass.renderToScreen = true 
}
 

 
/**************************************************;
 * CREATE SCENE
 **************************************************/
 
s.initScene = () => { 
	
	/** SCENE */	
	s.scene = new THREE.Scene()
	s.scene.background = new THREE.Color( 0x060c1a )
	s.scene.fog = new THREE.FogExp2( 0x060c1a, 0.0012 )		
	
	s.clock = new THREE.Clock()
	
	/** LIGHTS */
	s.pointF = new THREE.PointLight()
	s.pointF.position.set( 0, 2000, 1000 )
	s.scene.add( s.pointF )
	
	s.ambient = new THREE.AmbientLight( 0x06253a, 1.0 )
	s.scene.add( s.ambient )	
	
	/** FLOOR */
	s.floor = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshBasicMaterial( {
			color: 0x0bd592,
			wireframe: true,
			wireframeLinewidth: 0.5
		} )
	)
	s.floor.rotation.x = -Math.PI / 2
	s.floor.position.y = -30
	s.scene.add( s.floor )
	
	s.clock = new THREE.Clock()
}



/**************************************************;
 * CREATE CAR CAMERAS
 **************************************************/
 
const initCarCameras = () => {

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



/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
const animate = () => {
		
	let time = s.clock.getDelta()	
		
	/** update hero */
	hero.render( s.renderer, s.scene )
	let isCar = false	
	g.arrCars.forEach( ( car, i, arr ) => {
		if ( hero.kvadrant.x == car.kvadrant.x && hero.kvadrant.z == car.kvadrant.z ) {
			if ( car.state == 'none' ) {
				hero.showButtonsCar( car )
				isCar = true
			}			
		}
	} )
	if ( ! isCar ) hero.hideButtonsCar()  
	 
	/** update cope */
	if ( cope ) {
		cope.render( s.scene, s.renderer, time )
		if ( cope.car ) {
			cope.car.state != 'explosive' ? cope.car.move() : exitCope()	
			
			/** hitcar TEST FUNCTION */
			if ( Math.random() * 10 < 1 ) {
				cope.car.hit()
				cope.updateHealthScreenBars()
			}				
		}
	}
		
	/** update bullets */
	g.arrBullets.forEach( ( bullet, i, arr ) => {
		bullet.render()
		g.arrCars.forEach( ( car ) => {
			if ( car.kvadrant.x == bullet.kvadrant.x && car.kvadrant.z == bullet.kvadrant.z ) {
				if ( car.id != bullet.carId && car.state == 'none' ) {
					bullet.deleteObj()
					car.lives --
					car.checkLife()
				}	
			}
		} )	
		if ( bullet.isRemovable ){
			arr.splice( i, 1 )
			i --
			bullet = null
		}			
	} )
	
	/** update cars */
	g.arrCars.forEach( ( car, i, arr ) => {
		if ( car.state != "none" ) car.render()
		if ( car.isRemovable ) {
			arr.splice( i, 1 )
			car = null
			i --
		}
	} )
	
	/** update bomb */
	if ( g.heroBomb ) g.heroBomb.update()
			
		
	/** render */	
	s.composer.render()
		
	/** animate next frame */
	requestAnimationFrame( animate )	
}



/**************************************************;
 * RESIZE SCENE
 **************************************************/

const handleWindowResize = () =>  s.renderer.setSize( window.innerWidth, window.innerHeight )
window.addEventListener( 'resize', handleWindowResize, false )



/**************************************************;
 * INTERFACE
 **************************************************/

 
/** KEYBOARD **************************************/
 
const keys = {
	
	up: false,
	down: false,
	left: false,
	right: false,
	A: false,
	D: false,
	B: false,
	R: false,
	enter: false,
	space: false
}

const keyUpdate = ( keyEvent, down ) => {
	
	switch ( keyEvent.keyCode ) {
		
		case 38:
			keys.up = down
			break
		case 40:
			keys.down = down
			break
		case 37:
			keys.left = down
			break
		case 39:
			keys.right = down
			break
		case 65:
			keys.A = down
			break
		case 68:
			keys.D = down
			break
		case 87:
			keys.W = down
			break
		case 83:
			keys.S = down
			break
		case 13:
			keys.enter = down
			break
		case 32:
			keys.space = down				
			break
		case 66:
			keys.B = down				
			break
		case 82:
			keys.R = down				
			break				
	}
}
 
document.addEventListener( "keydown", event => keyUpdate( event, true ) )
document.addEventListener( "keyup", event => keyUpdate( event, false ) )


/** BUTTONS MOUSE CLICK ****************************/
 
let buttGunLeft = document.getElementById( 'gunLeft' )
buttGunLeft.onmousedown = () => keys.A = true
buttGunLeft.onmouseup = () => keys.A = false

let buttGunRight = document.getElementById( 'gunRight' )
buttGunRight.onmousedown = () => keys.D = true	
buttGunRight.onmouseup = () => keys.D = false

let buttExitCope = document.getElementById( 'exitCope' ) 
buttExitCope.onclick = () => keys.enter = true

let buttEnterCope = document.getElementById( 'enterCope' ) 
buttEnterCope.onclick = () => keys.enter = true

let buttAddBomb = document.getElementById('addBomb') 
buttEnterCope.onclick = () =>  keys.B = true

let buttRepairCar = document.getElementById('repair') 
buttEnterCope.onclick = () =>  { 
	keys.R = true 
}	

let buttFire = document.getElementById( 'gunFire' ) 
buttFire.onclick = () => keys.space = true





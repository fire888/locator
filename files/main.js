
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
		
		if ( this.lives < 0 && this.state == "none" ) this.state ='explosive'
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
		
		let r = Math.floor( Math.random() * 4 )
		if ( r == 0 ) this.health.gun -= Math.floor( Math.random() * 3 )  
		if ( r == 1 ) this.health.cope -= Math.floor( Math.random() * 3 )  
		if ( r == 2 ) this.health.base -= Math.floor( Math.random() * 3 )  	
		if ( r == 3 ) this.health.weels -= Math.floor( Math.random() * 3 ) 					
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
		new THREE.MeshBasicMaterial( { color: 0x888800 } )
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
		ln.position.set( d.width / 20 * i + d.x, d.y, 5 )  
		d.parentObj.add( ln )
		d.arr.push( ln )
	}	
	return d
}

sv.removeAllBar = d => {

	for ( let i = 0; i < d.arr.length; i ++ ) {
		
		d.parentObj.remove( d.arr[ d.arr.length-1 ] )
		d.arr[ d.arr.length-1 ] = null
		d.arr.splice( d.arr.length-1, 1 )
	}
}



/**************************************************;
 * COPE SCREENS SHADER
 **************************************************/

const NoiseShader = {
	
	uniforms: {
		
		iTime: {value: 0.1 }
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

		'float PHI = 1.61803398874989484820459 * 00000.1;', // Golden Ratio   
		'float PI  = 3.14159265358979323846264 * 00000.1;', // PI
		'float SQ2 = 1.41421356237309504880169 * 10000.0;', // Square Root of Two

		'float gold_noise(in vec2 coordinate, in float seed){',
			'return fract(sin(dot(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);',
		'}',
		
		'void main(){',   
			'vec2 uv = vUv;',
			'float n = gold_noise(uv, iTime);',
			'gl_FragColor  = vec4( n*0.1, n*0.1, n*0.25,  1.0);',
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
		
		this.backColor = 0x080603
		this.scrColor = 0x001122
		this.noiseShaderMat = new THREE.ShaderMaterial( NoiseShader )
		this.noiseShaderUniforms = this.noiseShaderMat.uniforms
		
		/** INIT SCENE CABINE ********************/		

		/** init scene  */
		this.sc = new THREE.Scene()
		this.textureBack = new THREE.TextureLoader().load( "files/assets/back.jpg", 
				() => cope.sc.background = cope.textureBack 	
			)
	
		/** init camera */
		let aspect = window.innerWidth / window.innerHeight
		this.cam = new THREE.PerspectiveCamera( 70, 300 / 200, 1, 10000 )
		this.cam.position.set( 0, 0, 600 )
		this.sc.add( this.cam )
		
		/** init renderer */
		this.renderPass = new THREE.RenderPass( this.sc, this.cam )
		s.composer.addPass( this.renderPass )

		
		/** SCREENS INIT **************************/
					
		/** gun screen */	
		this.scrGunTexture = new THREE.WebGLRenderTarget( 
			600, 350, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		this.scrGun = new THREE.Mesh(
			new THREE.PlaneGeometry( 700, 250 ,1 ),
			//new THREE.MeshBasicMaterial( { map: this.scrGunTexture.texture } )
			this.noiseShaderMat
		)
		this.scrGun.position.set( 0, 300, -30 )
		this.scrGun.rotation.x	= 0.2		
		this.sc.add( this.scrGun )
		
		/** front screen */
		this.scrFrontTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		this.scrFront = new THREE.Mesh(
			new THREE.PlaneGeometry( 420, 260, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrFrontTexture.texture } )
		)
		this.scrFront.position.set( 0, -20, -30 )
		this.sc.add( this.scrFront )	

		/** back screen */
		this.scrBackTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		this.scrBack = new THREE.Mesh(
			new THREE.PlaneGeometry( 440, 210, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrBackTexture.texture } )
		)
		this.scrBack.position.set( 0, -280, -30 )
		this.scrBack.rotation.x = -0.3
		this.sc.add( this.scrBack )

		/** left screen */
		this.scrLeftTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		this.scrLeft = new THREE.Mesh(
			new THREE.PlaneGeometry( 350, 320, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrLeftTexture.texture } )
		)
		this.scrLeft.rotation.y = 1.0		
		this.scrLeft.position.set( -380, -28, -30 )
		this.sc.add( this.scrLeft )

		/** right screen */
		this.scrRightTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		this.scrRight = new THREE.Mesh(
			new THREE.PlaneGeometry( 350, 320, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrRightTexture.texture } )
		)
		this.scrRight.position.set( 380, -28, -30 )
		this.scrRight.rotation.y = -1.0
		this.sc.add( this.scrRight )
		
		
		/** LOCATOR SCREEN *******************/
		
		this.scrLocatorTexture = new THREE.WebGLRenderTarget( 
			256, 256, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
		let l = new THREE.Mesh(
			new THREE.CircleGeometry( 120, 32 ),
			new THREE.MeshBasicMaterial( { color: this.backColor } )
		)
		l.position.set( -370, 215, 50 )
		l.rotation.x = 0.2	
		l.rotation.y = 0.7		
		this.sc.add( l )				
			
		this.scrLocator = new THREE.Mesh(
			new THREE.CircleGeometry( 110, 32 ),
			new THREE.MeshBasicMaterial( { map: this.scrLocatorTexture.texture } )
		)
		this.scrLocator.position.set( -365, 210, 60 )
		this.scrLocator.rotation.x	= 0.2	
		this.scrLocator.rotation.y	= 0.7		
		this.sc.add( this.scrLocator )	
		
		
		/** HEALTH SCREEN *************************/
		
		let back = new THREE.Mesh(
			new THREE.PlaneGeometry( 230, 150 ),
			new THREE.MeshBasicMaterial( { color: this.backColor } )
		)
		back.position.set( -280, -240, 50  )
		back.rotation.x = -0.4			
		this.sc.add( back )	
		
		this.scrHealthTexture = new THREE.WebGLRenderTarget( 
			256, 256, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			} )
			
		this.scrHealth = new THREE.Mesh(
			new THREE.PlaneGeometry( 210, 130 ),
			new THREE.MeshBasicMaterial( { map: this.scrHealthTexture.texture } )
		)
		this.scrHealth.position.set( 0, 0, 5 )
		back.add( this.scrHealth ) 
	
		this.health = {}
		
		this.health.gunbar = sv.updateLabelBar( { 
			width: 100,
			x: -15,
			y: 40, 
			arr: [],
			parentObj: this.scrHealth,
			count: 20	
		} )	
		
		this.health.copebar = sv.updateLabelBar( { 
			width: 100,
			x: -15,
			y: 15, 
			arr: [],
			parentObj: this.scrHealth,
			count: 20		
		} )	

		this.health.basebar = sv.updateLabelBar( { 
			width: 100,
			x: -15,
			y: -10,
			arr: [],	
			parentObj: this.scrHealth,
			count: 20	
		} )	

		this.health.weelsbar = sv.updateLabelBar( { 
			width: 100,
			x: -15,
			y: -35, 
			arr: [],
			parentObj: this.scrHealth,
			count: 20	
		} )			
		
	
		/** BARS INIT *****************************/
		
		/** compass */
		this.compass = new THREE.Mesh(
			new THREE.CircleGeometry( 45, 32 ),
			new THREE.MeshBasicMaterial( { color: this.backColor } )
		)
		this.compass.position.set( -250, 140, 50 )
		this.compass.rotation.x = 0.2	
		this.compass.rotation.y = 0.7		
		this.sc.add( this.compass )	
	
		let scr = new THREE.Mesh(
			new THREE.CircleGeometry( 35, 32 ),
			new THREE.MeshBasicMaterial( { color: this.scrColor } )
		) 
		scr.position.set( 0, 0, 3 )		
		this.compass.add( scr )			
		
		this.compasArrow = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 3, 30, 1 ),
			new THREE.MeshBasicMaterial( { color: 0x888800 } )
		)
		this.compasArrow.rotation.x = 0
		this.compasArrow.position.set( 0, 15, 7 )
		this.compass.add( this.compasArrow )	
		
		this.compasArrow2 = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 3, 30, 1 ),
			new THREE.MeshBasicMaterial( { color: 0x008800 } )
		)
		this.compasArrow2.rotation.x = 0
		this.compasArrow2.position.set( 0, -15, 7 )		
		this.compass.add( this.compasArrow2 )	
	
		/** ammo/fuel back plane */
		let p = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 100, 230 ),
			new THREE.MeshBasicMaterial( { color: this.backColor } )			
		) 
		p.position.set( 330, 200, 50 )
		p.rotation.x = 0.2	
		p.rotation.y = -0.7		
		this.sc.add( p )	
		
		/** ammo */
		this.ammoBarBack = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 35, 200 ),
			new THREE.MeshBasicMaterial( { color: 0x001122 } )			
		) 
		this.ammoBarBack.position.set( -20, 0, 5 )	
		p.add( this.ammoBarBack )	
		
		this.ammoLabel = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10, 3, 3 ),
			new THREE.MeshBasicMaterial( { color: 0x999900 } )
		)
		this.arrBulletsLabel = []
		
		/** fuel */
		this.fuelBarBack = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 35, 200 ),
			new THREE.MeshBasicMaterial( { color: 0x001122 } )			
		) 
		this.fuelBarBack.position.set( 25, 0, 5 )	
		p.add( this.fuelBarBack )	

		this.fuelLabel = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10, 170 ),
			new THREE.MeshBasicMaterial( { color: 0x999900 } )			
		)
		this.fuelLabel.position.z = 10
		this.fuelBarBack.add( this.fuelLabel )	
		
		/** wheels */
		let plane = new THREE.Mesh(
			new THREE.CircleGeometry( 55, 32 ),
			new THREE.MeshBasicMaterial( { color: this.backColor } )		
		)
		plane.position.set( 0, -140, -10 )
		plane.rotation.x = -0.2		
		this.sc.add( plane )		
		
		this.weelsBarBack = new THREE.Mesh(
			new THREE.CircleGeometry( 45, 32 ),
			new THREE.MeshBasicMaterial( { color: this.scrColor } )		
		) 
		this.weelsBarBack.position.set( 0, -138, 0 )
		this.weelsBarBack.rotation.x = -0.2		
		this.sc.add( this.weelsBarBack )	

		this.weelsBarL = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 9, 25 ),
			new THREE.MeshBasicMaterial( { color: 0x999900 } )			
		) 
		this.weelsBarL.position.set( -18, 20, 3 )
		this.weelsBarBack.add( this.weelsBarL )	

		this.weelsBarR = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 9, 25 ),
			new THREE.MeshBasicMaterial( { color: 0x999900 } )			
		) 
		this.weelsBarR.position.set( 18, 20, 3 )
		this.weelsBarBack.add( this.weelsBarR )		
		
		this.weelsBarBL = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 9, 25 ),
			new THREE.MeshBasicMaterial( { color: 0x999900 } )			
		) 
		this.weelsBarBL.position.set( -18, -20, 3 )
		this.weelsBarBack.add( this.weelsBarBL )	

		this.weelsBarBR = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 9, 25 ),
			new THREE.MeshBasicMaterial( { color: 0x999900 } )			
		) 
		this.weelsBarBR.position.set( 18, -20, 3 )
		this.weelsBarBack.add( this.weelsBarBR )

		/** gun Rotation */
		this.gunRotation = new THREE.Mesh(
			new THREE.CircleGeometry( 10, 32 ),
			new THREE.MeshBasicMaterial( { color: 0x777700 } )
		) 
		this.gunRotation.position.set( 0, 0, 8 )		
		this.weelsBarBack.add( this.gunRotation )
		
		let arrowRot = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 7, 35 ),
			new THREE.MeshBasicMaterial( { color: 0x777700 } )			
		)  	
		arrowRot.position.set( 0, 10, 9 )
		this.gunRotation.add( arrowRot )
		
		
		/** BUTTONS INIT **************************/
		
		/** exit back */
		let back1 = new THREE.Mesh(
			new THREE.PlaneGeometry( 230, 120 ),
			new THREE.MeshBasicMaterial( { color: this.backColor } )
		)
		back1.position.set( 300, -235, 30 )			
		this.sc.add( back1 )	
		
		this.htmlElems = document.getElementById( 'copeElems' )	
		this.htmlElems.style.display = "none"
	}
		
	render( scene, renderer, time ) {
		
		if ( ! this.car ) return
		
		/** update noiseShader */ 
		this.noiseShaderUniforms.iTime.value += time * 40
		
		/** draw Compass */
		this.compass.rotation.z = -this.car.model.rotation.y
		
		/** draw gunRotation */
		this.gunRotation.rotation.z = this.car.modelGun.rotation.y
		
		/** draw Locator */
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
		renderer.render( sv.scene, sv.camera, this.scrLocatorTexture )	
		renderer.render( sv.scene, sv.cameraParams, this.scrHealthTexture )		
		renderer.render( scene, s.carCameras.gun, this.scrGunTexture )
		renderer.render( scene, s.carCameras.front, this.scrFrontTexture )
		renderer.render( scene, s.carCameras.back, this.scrBackTexture )
		renderer.render( scene, s.carCameras.left, this.scrLeftTexture )
		renderer.render( scene, s.carCameras.right, this.scrRightTexture )

		/** exit cope */
		if ( keys.enter && this.isCanExit ) exitCope()

		/** shoot */
		if ( keys.space ) {
			if ( this.car.shoot() ) { 
				this.removeBulletShoot()	
				keys.space = false
				let bullet = new Bullet( this.car )
			}	
		}			
	}
	
	hideView() {
		
		this.htmlElems.style.display = "none"
		this.car = null
		this.dellBullets()
	}
	
	showView( car ) {
		
		this.htmlElems.style.display = "block"
		this.car = car
		this.createBulletsBar( this.car )	
		this.updateFuelBar()
	}
	
	
	/** BARS FUNCTIONS ************************/
	
	createBulletsBar( car ) {
	
		for ( let i = 0; i < car.ammo; i ++ ) {
			let b = this.ammoLabel.clone()
			b.position.x = 3
			b.position.y = i * 6 - 85
			b.position.z = 2
			this.ammoBarBack.add( b )
			this.arrBulletsLabel.push( b )
		}
	}

	removeBulletShoot() {
	
		this.ammoBarBack.remove( this.arrBulletsLabel[ this.arrBulletsLabel.length - 1 ] )
		this.arrBulletsLabel[ this.arrBulletsLabel - 1 ] = null
		this.arrBulletsLabel.splice( this.arrBulletsLabel.length - 1, 1 )
	}

	dellBullets() {
	
		for ( let i = 0; i < this.arrBulletsLabel.length; i ++  ) {
			this.ammoBarBack.remove( this.arrBulletsLabel[ i ] )
			this.arrBulletsLabel[ this.arrBulletsLabel[ i ] ] = null		
			this.arrBulletsLabel.splice( i, 1 )
			i --
		}
	}

	updateFuelBar() {
		
		if ( this.car.currentFuel > 1 ) {
			this.fuelLabel.scale.y = this.car.currentFuel / this.car.allFuel
			this.fuelLabel.position.y =  this.fuelLabel.scale.y * 90 - 90
		} else {
			this.fuelLabel.scale.y = 0.000001
		}			
	}

	updateWeelsBar() {
		
		this.weelsBarL.rotation.z = this.car.spdRot * 70.0
		this.weelsBarR.rotation.z = this.car.spdRot * 70.0		
	}

	updateHealthBars() {
		
		this.health.gunbar.count = this.car.health.gun
		this.health.copebar.count = this.car.health.cope	
		this.health.basebar.count = this.car.health.base
		this.health.weelsbar.count = this.car.health.weels		
			
		sv.updateLabelBar( this.health.copebar )
		sv.updateLabelBar( this.health.basebar )
		sv.updateLabelBar( this.health.gunbar )
		sv.updateLabelBar( this.health.weelsbar )		
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
		this.nearCar = car
	}
	
	hideButtonsCar() {
		
		buttEnterCope.style.opacity = 0
		buttAddBomb.style.opacity = 0
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
				cope.updateHealthBars()
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

let buttFire = document.getElementById( 'gunFire' ) 
buttFire.onclick = () => keys.space = true





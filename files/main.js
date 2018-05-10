
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
 
/** INSTANSES OF GAME OBJECT */
const g = {
	arrBullets: [],
	arrCars: [],
	heroBomb: null
}

/** UI BUTTONS/KEYBOARD SPACE */
const ui = () => {}  

/** SCENE ASSETS */
const s = {
	loader: new THREE.OBJLoader(),
	geomCar: null,
	geomCarGun: null,
	carCameras: {}	
} 

/** MAIN VARS */
let cope, hero



/**************************************************;
 * LOAD SCENE
 **************************************************/

 
window.onload = () => loadAssets()
	

const loadAssets = () => {	
  return new Promise((resolve) => {  
	s.loadModelCar(resolve) 		
  })
  .then(() => {
    return new Promise((resolve) => {	
      s.loadModelGun(resolve)	
    })
  })
  .then(() => { 
    initGame()
  })
}  

 
s.loadModelCar = res => {
	
  s.loader.load('files/assets/car.obj', (obj) => {
    obj.traverse((child) => {	
      if (child instanceof THREE.Mesh != true) return
      if (typeof child.geometry.attributes.position.array != "object") return
	  
      s.geomCar = child.geometry
      res()
    })
  })	
}


s.loadModelGun = res => {
	
  s.loader.load('files/assets/carGun.obj', (obj) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh != true) return
      if (typeof child.geometry.attributes.position.array != "object") return
	  
      s.geomCarGun = child.geometry
	  res()
    })
  })	
}



/**************************************************;
 * INIT GAME
 **************************************************/

const initGame = () => {
	
  initRenderer()
  initScene()
  sv.spaceVirt()		
  initCarCameras()
  initCope()
  initHero()
  initCars()  
  animate()	
}


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


const initScene = () => { 

  s.scene = new THREE.Scene()
  s.scene.background = new THREE.Color( 0x060c1a )
  s.scene.fog = new THREE.FogExp2( 0x060c1a, 0.0012 )		

  s.lightPoint = new THREE.PointLight()
  s.lightPoint.position.set( 0, 2000, 1000 )
  s.scene.add( s.lightPoint )

  s.ambient = new THREE.AmbientLight( 0x06253a, 1.0 )
  s.scene.add( s.ambient )	

  s.floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10000, 10000, 100, 100),
	new THREE.MeshBasicMaterial({
		color: 0x0bd592,
		wireframe: true,
		wireframeLinewidth: 0.5
	}))
  s.floor.rotation.x = -Math.PI/2
  s.floor.position.y = -30
  s.scene.add(s.floor)
  
  s.clock = new THREE.Clock()  
}


const initCope = () => {
	
  cope = new Cope()	
}


const initHero = () => {
	
  hero = new Hero(s.scene)
  hero.showView({x:0, z:0})
}


const initCars = () => {
	
  for (let i=0; i<7; i++) {
   let carParams = { 
      pos: {
        x: Math.random()*100 - 50,
        z: Math.random()*1000 - 500 		
      }}    
	let car = new Car(carParams)
    g.arrCars.push(car)	
  }
}  
 

 
/**************************************************;
 * ANIMATE GAME PER FRAME
 **************************************************/
  
const animate = () => {
		
  animateHero()		
  animateCope()
  animateBullets()
  animateCars()
  animateBombs()

  s.composer.render()
  requestAnimationFrame(animate)	
}


const animateHero = () => {
	
  if (! hero.isOutOfCar) return	
  
  hero.render(s.renderer, s.scene)
  hero.appendCarIfNear( checkNearCar() )
}

const checkNearCar = () => {
  
  let isHeroNearCar = false	
  g.arrCars.forEach((car, i, arr) => {
    if (hero.kvadrant.x == car.kvadrant.x && hero.kvadrant.z == car.kvadrant.z) {
      if (car.state == 'none') {
		isHeroNearCar = true		
		return car
      }		  
    }
  })
  if (! isHeroNearCar) return 'none'
}


const animateCope = () => {
	
	let time = s.clock.getDelta()	
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
}

const animateBullets = () => {
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
}

const animateCars = () => {
	g.arrCars.forEach( ( car, i, arr ) => {
		if ( car.state != "none" ) car.render()
		if ( car.isRemovable ) {
			arr.splice( i, 1 )
			car = null
			i --
		}
	} )
}

const animateBombs = () => {
	
	if ( g.heroBomb ) g.heroBomb.update()
}

THREE.AdditiveBlendingShader = {
  uniforms: {
    tDiffuse: { value:null },
    tAdd: { value:null }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tAdd;",
    "varying vec2 vUv;",
    "void main() {",
      "vec4 color = texture2D( tDiffuse, vUv );",
      "vec4 add = texture2D( tAdd, vUv );",
      "gl_FragColor = color + add;",
    "}"
  ].join("\n")
};


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

const keyUpdate = (keyEvent, down) => {
	
	switch(keyEvent.keyCode) {
		
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

const setOpasityButtonsHeroNearCar = opas => { 
	buttEnterCope.style.opacity = opas
	buttAddBomb.style.opacity = opas
	buttRepairCar.style.opacity = opas 
}			






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
 * LOAD
 **************************************************/

window.onload = () => loadAssets()
	

const loadAssets = () => {	
  return new Promise((resolve) => {  
      s.loadGeometry('s.geomCar', 'files/assets/car.obj', resolve)	
  })
  .then(() => {
    return new Promise((resolve) => {	
      s.loadGeometry('s.geomCarGun', 'files/assets/carGun.obj', resolve)	
    })
  })
  .then(() => { 
    initGame()
  })
}  

s.loadGeometry = (targetVariable, path, onloadFunc) => {
  s.loader.load(path, (obj) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh != true) return
      if (typeof child.geometry.attributes.position.array != "object") return 
      eval(targetVariable + '= child.geometry') 	  
	  onloadFunc()
    })
  })
}



/**************************************************;
 * INIT 
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
  s.scene.background = new THREE.Color( 0x00000 )
  s.scene.fog = new THREE.FogExp2( 0x060c1a, 0.0012 )		

  s.lightPoint = new THREE.PointLight()
  s.lightPoint.position.set( 0, 2000, 1000 )
  s.scene.add( s.lightPoint )

  s.ambient = new THREE.AmbientLight( 0x06253a, 1.0 )
  s.scene.add( s.ambient )	

  s.floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10000, 10000, 100, 100),
	new THREE.ShaderMaterial(matShaderFloor)
  )
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
 * ANIMATE PER FRAME
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
	
  if ( ! hero.isOutOfCar ) return	
  
  hero.render(s.renderer, s.scene)
  hero.appendNearCar(checkInterseptionsKvadrant(hero, g.arrCars))	  
}

const animateCope = () => {
	
  if ( cope.car == null ) return 

  let time = s.clock.getDelta()	
  cope.car.hit(cope.updateHealthScreenBars()) //test func    
  cope.render(s.scene, s.renderer, time)
}

const animateBullets = () => {
  
  g.arrBullets.forEach((bullet, i, arr) => {
    
    if ( bullet.isRemovable ) { 
      removeObjectFromArr(bullet, i, arr) 
      return 
    }
    
    bullet.render()	
    
    let targetCar = checkInterseptionsKvadrant(bullet, g.arrCars, bullet.carId)
    if ( ! targetCar ) return
    bullet.deleteObj()
    targetCar.lives--
    targetCar.checkLife()	
  })
}

const animateCars = () => {

  g.arrCars.forEach((car, i, arr) => {
    if ( car.isRemovable ) {
      removeObjectFromArr(car, i, arr)
      return
    }	  
    if ( car.state != "none" ) car.render()
  })
}

const animateBombs = () => {
	
  if ( g.heroBomb ) g.heroBomb.update()
}

const removeObjectFromArr = (item, i, arr) => {
	
  arr.splice(i, 1)
  item = null
}	  



/**************************************************;
 * POSTPROCESSING ANIMATION
 **************************************************/

s.rendererMoreBoom = () => {
	
  if ( s.simplePass.uniforms.amountFlash.value < 3.0 ){
    s.simplePass.uniforms.amountFlash.value += 0.5
	setTimeout( s.rendererMoreBoom, 50 )	
  } else {
	setTimeout( s.rendererLessBoom, 50 )	  
  } 
}

s.rendererLessBoom = () => {
	
  if ( s.simplePass.uniforms.amountFlash.value > 0.01 ){
    s.simplePass.uniforms.amountFlash.value -= 0.3
	setTimeout( s.rendererLessBoom, 50 )	
  } else {
    s.simplePass.uniforms.amountFlash.value = 0.0	  
  } 	
}



/**************************************************;
 * RESIZE SCENE
 **************************************************/

const handleWindowResize = () =>  s.renderer.setSize( window.innerWidth, window.innerHeight )
window.addEventListener( 'resize', handleWindowResize, false )



/**************************************************;
 * USER INTERFACE
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
buttEnterCope.onclick = () => keys.B = true

let buttRepairCar = document.getElementById('repair') 
buttEnterCope.onclick = () => keys.R = true 


let buttFire = document.getElementById( 'gunFire' ) 
buttFire.onclick = () => keys.space = true


/** BUTTONS STYLES *********************************/

const setOpasityButtonsHeroNearCar = opas => {
	
	buttEnterCope.style.opacity = opas
	buttAddBomb.style.opacity = opas
	buttRepairCar.style.opacity = opas 
}			






"use strict"


/**
 **************************************************; 
 *	Project        	:	MACHINE 
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

  arrUsers: [],
  arrCars: [],  
  arrBullets: [],
  heroBomb: null,
  air: null,
}

/** UI BUTTONS/KEYBOARD SPACE */
const ui = () => {}  

/** SCENE ASSETS */
const s = {

  loader: new THREE.OBJLoader(),
  geomCar: null,
  geomCarGun: null,
  geomAir: null,
  geomParashute: null, 
  geomHuman: null,  
  carCameras: {}	
} 

/** MAIN VARS */
let cope = null, hero = null



/**************************************************;
 * LOAD
 **************************************************/

window.onload = () => loadAssets()


const loadAssets = () => {	
  return new Promise( ( resolve ) => {  
      s.loadGeometry( 's.geomCar', 'app/assets/car.obj', resolve )
  })
  .then( () => {
    return new Promise( ( resolve ) => {
      s.loadGeometry( 's.geomCarGun', 'app/assets/carGun.obj', resolve )
    })
  })
  .then( () => {
    return new Promise( ( resolve ) => {
      s.loadGeometry( 's.geomAir', 'app/assets/air.obj', resolve )
    })
  })
  .then( () => {
    return new Promise( ( resolve ) => {
      s.loadGeometry( 's.geomParashute', 'app/assets/parashute.obj', resolve )
    })
  })
  .then( () => {
    return new Promise( ( resolve ) => {
      s.loadGeometry( 's.geomHuman', 'app/assets/human.obj', resolve )
    })
  })
  .then( () => { 
    initGame()
  })
  .then( () => {
    initClient()
  })
  .then( () => {
    animate()
  })
}

s.loadGeometry = ( targetVariable, path, onloadFunc ) => {
  s.loader.load( path, ( obj ) => {
    obj.traverse( ( child ) => {
      if ( child instanceof THREE.Mesh != true ) return
      if ( typeof child.geometry.attributes.position.array != "object" ) return 
      eval( targetVariable + '= child.geometry' )
      onloadFunc()
    })
  })
}



/**************************************************;
 * INITS
 **************************************************/

const initGame = () => {

  initRenderer()
  initScene()
  sv.spaceVirt()
  initCarCameras()
  initCope()
  initHero()
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
  s.scene.fog = new THREE.FogExp2( 0x000000, 0.0012 )		

  s.lightPoint = new THREE.PointLight()
  s.lightPoint.position.set( 0, 2000, 1000 )
  s.scene.add( s.lightPoint )

  s.ambient = new THREE.AmbientLight( 0x06253a, 1.0 )
  s.scene.add( s.ambient )	
  
  let floorMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }) 
  let floorGeometry = new THREE.Geometry()
  for ( let n = -3000; n < 3000; n += 100 ) {
      floorGeometry.vertices.push(
        new THREE.Vector3( n, -22, 3000 ),
        new THREE.Vector3( n, -22, -3000 ),
        new THREE.Vector3( n + 100, -22, -3000 )
      )
  }
  for ( let n = -3000; n < 3000; n += 100 ) {
    floorGeometry.vertices.push(
       new THREE.Vector3( 3000, -22, n ),
       new THREE.Vector3( -3000, -22, n  + 100 ),
       new THREE.Vector3( 3000, -22, n )
    )
  }	    
  s.floor = new THREE.Line( floorGeometry, floorMaterial )
  s.floor.position.set( 0, 0, 0 )
  s.scene.add( s.floor )
    
  s.clock = new THREE.Clock()  
  s.fps = 60
}

const initCope = () => {

  cope = new Cope()	
}

const initHero = () => {

  hero = new Hero(s.scene)
}

s.putUserInPosition = severPos => {

  hero.showView( severPos )	
}  

const initAir = () => {

  if ( g.air ) return
  
  let positionToDropCar = { x: 0, z: 0 }
  let xRandom = Math.random()*100 - 50
  let zRandom = Math.random()*100 - 50
  if ( hero.isOutOfCar ) {
    positionToDropCar = { x: hero.cam.position.x + xRandom, z: hero.cam.position.z + zRandom }
  } else {
    positionToDropCar = { x: cope.car.model.position.x + xRandom, z: cope.car.model.position.z + zRandom }
  }

  let newCarParams = { pos: { x: 30000, z: 0 } }
  g.air = new Air( new Car( newCarParams ), positionToDropCar )
}

const initParashute = car => {
 
  car.parashute = new Parashute( car )
}

s.createNewAnotherUser = h => {
  let hh = new Human( h )
  g.arrUsers.push( hh )
}



/**************************************************;
 * ANIMATE PER FRAME
 **************************************************/

const animate = () => {

  animateHero()
  animateCope()
  animateFloor()
  animateBullets()
  animateUsers()
  animateCars()
  animateBombs()
  animateAir()

  s.composer.render()
  requestAnimationFrame( animate )	
}


/** ANIMATION OBJECTS ****************************/

const animateHero = () => {

  if ( ! hero.isOutOfCar ) return

  hero.render( s.renderer, s.scene )
  hero.appendNearCar( checkInterseptionsKvadrant( hero, g.arrCars ) )
}

const animateCope = () => {

  if ( cope.car == null ) return

  let time = s.clock.getDelta()
  cope.car.hit( cope.updateHealthScreenBars() ) //test func random hit
  cope.render( s.scene, s.renderer, time )
}

const animateFloor = ( xCoef = 0, zCoef = 0 ) => {

  if ( hero.isOutOfCar ) {
    xCoef = Math.floor( hero.cam.position.x/100 )
    zCoef = Math.floor( hero.cam.position.z/100 )
  } else {
    xCoef = Math.floor( cope.car.model.position.x/100 )
    zCoef = Math.floor( cope.car.model.position.z/100 )
  }
  s.floor.position.set( xCoef*100, -6, zCoef*100 )
}

const animateBullets = () => {
  
  g.arrBullets.forEach( ( bullet, i, arr ) => {
    
    if ( bullet.isRemovable ) { 
      removeObjectFromArr( bullet, i, arr ) 
      return 
    }
    
    bullet.render()
    
    let targetCar = checkInterseptionsKvadrant( bullet, g.arrCars, bullet.carId )
    if ( ! targetCar ) return
    bullet.deleteObj()
    targetCar.lives--
    targetCar.checkLife()
  })
}

const animateCars = () => {

  g.arrCars.forEach( ( car, i, arr ) => {
    if ( car.isRemovable ) {
      removeObjectFromArr( car, i, arr )
      return
    }	
    if ( car.state != 'none' ) car.render()
  })
}

s.startCarDrop = car => {
  
  car.state = 'dropFromAir'
  g.arrCars.push( car )
}

const animateUsers = () => {
  g.arrUsers.forEach(( u, i, arr ) => {
    u.render()
  })
}

const animateBombs = () => {

  if ( g.heroBomb ) g.heroBomb.update()
}

const animateAir = () => {


  if ( ! g.air ) return
  
  g.air.render()  
  if ( g.air.isRemovable ) g.air = null	  
}

const removeObjectFromArr = ( item, i, arr ) => {

  arr.splice( i, 1 )
  item = null
}


/** POSTPROCESSING ANIMATION EFFECTS **************/

s.rendererStartFlash = () => {

  hero.isOutOfCar ? s.rendererMoreFlash() : cope.boomForScreens()
}

s.rendererMoreFlash = () => {

  if ( s.simplePass.uniforms.amountFlash.value < 3.0 ) {
    s.simplePass.uniforms.amountFlash.value += 0.5
    setTimeout( s.rendererMoreFlash, 50 )
  } else {
    s.rendererLessFlash()
  }
}

s.rendererLessFlash = () => {

  if ( s.simplePass.uniforms.amountFlash.value > 0.01 ) {
    s.simplePass.uniforms.amountFlash.value -= 0.3
    setTimeout( s.rendererLessFlash, 50 )
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

const keyUpdate = ( keyEvent, down ) => {

  switch( keyEvent.keyCode ) {
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

let buttAddBomb = document.getElementById( 'addBomb' )
buttEnterCope.onclick = () => keys.B = true

let buttRepairCar = document.getElementById( 'repair' )
buttEnterCope.onclick = () => keys.R = true 


let buttFire = document.getElementById( 'gunFire' )
buttFire.onclick = () => keys.space = true


/** BUTTONS STYLES *********************************/

const setOpasityButtonsHeroNearCar = opas => {

  buttEnterCope.style.opacity = opas
  buttAddBomb.style.opacity = opas
  buttRepairCar.style.opacity = opas 
}



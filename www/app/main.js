
"use strict"


/**
 ***********************************************; 
 *	Project        	:	MACHINE 
 *	Program name   	: 	Threejs scene 
 *	Author         	: 	www.otrisovano.ru
 *	Date           	: 	16/03/2018
 *	Purpose        	: 	check brain   
 ***********************************************/ 



/***********************************************;
 * VARS SPACES
 ***********************************************/


/** INSTANSES OF GAME OBJECT */

const g = {
  enemies: [],
  cars: [],
  carsMustRemoved: [], 
  bullets: [],
  bombs: []
  //air: null
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



/***********************************************;
 * LOAD
 ***********************************************/

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




/***********************************************;
 * INITS
 ***********************************************/

const initGame = () => {

  initRenderer()
  initScene()
  sv.spaceVirt()
  initCarCameras()
  initCope()
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
  s.fps = 40
}

const initCope = () => {

  cope = new Cope()	
}




/***********************************************;
 * UPDATE SCENE BY SERVER DATA 
 ***********************************************/

s.initHeroIfNone = serverU => {
  
  if ( hero ) return
  if ( ! serverU ) return    
  if ( serverU.state != 'init') return

  hero = new Hero( s.scene )
  hero.showView( serverU.posX, serverU.posZ  )
  clientGame.user.state = 'play'
}


/** SET SERVER DATA TO ENEMIES *****************/

s.createEnemy = h => new Human( h )

s.updateEnemyFromServer = ( target, source ) => target.updateParamsFromServer( source ) 

s.removeEnemy = md => md.remove() 

s.setDataEnemiesFromServer = serverEnemies => {
  g.enemies = transformTargetArrFromSourceArrData(
        g.enemies, serverEnemies,
        s.createEnemy, s.removeEnemy, s.updateEnemyFromServer 
      )
}


/** SET SERVER DATA TO CARS ********************/

s.createNewCar = car => new Car( car )
//let a = new Air( new Car( newCarParams ), positionToDropCar )

s.updateCarFromServer = ( target, source ) => target.updateParamsFromServer( source )

s.removeCar = ( md ) => {
  md.startExplosive()
  s.rendererStartFlash()
  g.carsMustRemoved.push( md )
}

s.setDataCarsFromServer = serverCars => {
  g.cars = transformTargetArrFromSourceArrData(
        g.cars, serverCars,
        s.createNewCar, s.removeCar, s.updateCarFromServer 
      )
}

/*
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
*/




/***********************************************;
 * ANIMATE PER FRAME
 ***********************************************/

const animate = () => {

  $("#userId").html("heroId: " + clientGame.user.id)
  $("#userCarId").html("heroCarId: " + clientGame.car.id)
  
  animateHero()
  animateCope()  
  animateFloor()  
  
  animateEnenies()
  animateBullets()
  animateCars()
  animateEmemyCars()
  animateCarsRemoved()
  //animateBombs()
  //animateAir()

  s.composer.render()
  requestAnimationFrame( animate )	
}


/** ANIMATION OBJECTS **************************/

const animateHero = () => {
  
  if ( ! hero ) return
  if ( ! hero.isOutOfCar ) return

  hero.render( s.renderer, s.scene )
  hero.appendNearCar( checkInterseptionsKvadrant( hero, g.cars ) )
}

const animateCope = () => {

  if ( cope.car == null ) return

  let time = s.clock.getDelta()
  cope.car.hit( cope.updateHealthScreenBars() ) //test func random hit
  cope.render( s.scene, s.renderer, time )
}

const animateFloor = ( xCoef = 0, zCoef = 0 ) => {
  
  if ( ! hero ) return
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
  
  g.bullets.forEach(( bullet, i, arr ) => {
    
    if ( bullet.isRemovable ) { 
      removeObjectFromArr( bullet, i, arr ) 
      return 
    }
    
    bullet.render()

    if ( bullet.userId != clientGame.user.id ) return    
    
    let targetCar = checkInterseptionsKvadrant( bullet, g.cars, bullet.carId )
    if ( ! targetCar ) return

    bullet.deleteObj()

    clientGameputIdDamagedCar({ 
      target: targetCar.id, 
      authorId: clientGame.user.id
    })
  })
}

const animateCars = () => {

  g.cars.forEach( ( car, i, arr ) => {
    if ( car.state != 'none' ) car.render()
  })
}

const animateEmemyCars = () => {
  
  g.cars.forEach(( car ) => {

    if ( car.userId == null ) return
    if ( car.userId == clientGame.user.id ) return

    car.moveByEnemy()  
  }) 
} 

const animateCarsRemoved = () => {
  
  g.carsMustRemoved.forEach( ( car, i, arr ) => {
    if ( car.isRemovable ) {
      removeObjectFromArr( car, i, arr )
      return
    }	
    car.render()
  })
}

s.startCarDrop = car => {
  
  car.state = 'dropFromAir'
  g.cars.push( car )
}

const animateEnenies = () => {

  g.enemies.forEach(( u, i, arr ) => {
    u.render()
  })
}


const addBomb = car => {

  for ( let i = 0; i < g.bombs.length; i ++ ) {
    if ( g.bombs[i].carId == car.id ) {
      return
    }
  }

  clientGame.bombs.push( { car: car.id, user: clientGame.user.id } )
  buttAddBomb.style.opacity = 0	
}

const animateBombs = () => {

  if ( g.heroBomb ) g.heroBomb.update()
}

const animateAir = () => {

  if ( ! g.air ) return
  
  g.air.render()  
  if ( g.air.isRemovable ) g.air = null	  
}


/** POSTPROCESSING ANIMATION EFFECTS ***********/

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



/***********************************************;
 * RESIZE SCENE
 ***********************************************/

const handleWindowResize = () =>  s.renderer.setSize( window.innerWidth, window.innerHeight )
window.addEventListener( 'resize', handleWindowResize, false )



/***********************************************;
 * USER INTERFACE
 ***********************************************/


/** KEYBOARD ***********************************/
 
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


/** BUTTONS MOUSE CLICK ************************/
 
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


/** BUTTONS STYLES *****************************/

const setOpasityButtonsHeroNearCar = opas => {

  buttEnterCope.style.opacity = opas
  buttAddBomb.style.opacity = opas
  buttRepairCar.style.opacity = opas 
}

ui.setUserScores = ( user ) => {

  if ( ! user ) return 
 
  $( '#destroy' ).html( 'Destroy enemies cars: ' + user.destroyCarsWithEnemies  )  
  $( '#destroyEmpty' ).html( 'Destroy empty cars: ' + user.destroyEmptyCars  )
  $( '#lost' ).html( 'Lost cars: ' + user.lostCars  )
  $( '#online' ).html( 'Online enemies: ' + g.enemies.length  )

}




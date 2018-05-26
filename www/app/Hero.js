
/**************************************************;
 * HERO
 **************************************************/

class Hero {

  constructor( sc ) {
	
    this.isOutOfCar = true
    this.kvadrant = { x: 0, z: 0 }
    this.nearCar = null

    this.cam = new THREE.PerspectiveCamera( 70, 300 / 200, 1, 10000 )
    sc.add( this.cam )

    this.renderPass = new THREE.RenderPass( sc, this.cam )
    s.composer.addPass( this.renderPass )
    this.renderPass.enabled = false
	
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
    if ( keys.B ) addBombInClientObj( this.nearCar )
    if ( keys.R ) {
      this.nearCar.repair()
      keys.R = false
      if ( ! this.nearCar.checkHealth() ) buttRepairCar.style.opacity = 0
    }
  }

  hideView() {

    this.htmlElems.style.display = "none"
    this.cam.position.y= 100000
  }

  showView( pX, pZ ) {

    this.cam.position.set( pX, -22, pZ )
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

  setServerData( serverU ) {} //** TEST FUNC */
}

const exitCope = () => {

  keys.enter = false

  hero.isOutOfCar = true
  cope.car.userId = null

  hero.showView( cope.car.model.position.x, cope.car.model.position.z  )
  cope.hideView()  

  cope.renderPass.enabled = false
  hero.renderPass.enabled = true
}

const enterCope = car => {

  keys.enter = false
  
  if ( car.userId != null  ) return 

  hero.isOutOfCar = false

  hero.hideView()
  car.enterHero()
  cope.showView( car )

  hero.renderPass.enabled = false
  cope.renderPass.enabled = true
}



  
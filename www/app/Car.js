
/************************************************;
 *  Project        : Poligon
 *  Program name   : Class Car 
 *  Author         : www.otrisovano.ru
 *  Date           : 15.05.2018 
 *  Purpose        : check brain   
 ***********************************************/

'use strict'




/***********************************************;
 * CAR
 ***********************************************/	

class Car {
	 
  constructor( serverCarParams ) {


    /** PARAMS ********************************/
		
    this.id = serverCarParams.id
    this.userId = null
    this.lives = serverCarParams.lives
		
    this.parashute = null 
		
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

    this.isBomb = false
				
    this.state = 'none'

    this.targetPos = {
      x: serverCarParams.posX,
      z: serverCarParams.posZ
    }

    this.spdX = 0
    this.spdZ = 0
		
    this.spdForBullet = {
      pX: 0, pZ:0,
      pXold: 0, pZold: 0,
      x: 0, z: 0
    }
				
		
    /** MODEL **********************************/
		
    this.geoms = {}
		
    /** pivot */ 
    this.model = new THREE.Mesh(
      new THREE.BoxGeometry( 0.001, 0.001, 0.001 ),
      new THREE.MeshPhongMaterial( { color: 0x000000 } )	
    )
    if ( serverCarParams.state == 'drop' ) { 
      this.kvadrant = { x: 100000, z: 100000 }
      this.model.position.set ( serverCarParams.posX, 100000, serverCarParams.posZ )			
    } else {
      this.model.position.set ( serverCarParams.posX, -6, serverCarParams.posZ )
      this.kvadrant = checkKvadrant( this.model )									
    }	
    s.scene.add( this.model )
		
    /** cleate label for locators */
    sv.createNewLabel( this )
		
    /** prepear base */
    this.geoms.base = prepearGeometryToExploisive( s.geomCar.clone() )	
    this.modelBase = new THREE.Mesh(
      this.geoms.base.geom,
      new THREE.MeshPhongMaterial( { color: 0x00aa00, transparent: true } )
    )
    this.modelBase.position.y = -22 
    this.model.add(this.modelBase)
		
    /** prepear gun */
    this.geoms.gun =  prepearGeometryToExploisive( s.geomCarGun.clone() ) 
    this.modelGun = new THREE.Mesh(
      this.geoms.gun.geom,
      new THREE.MeshPhongMaterial( { color: 0x00aa00, transparent: true } )
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
	
	
    /** MOVE ***********************************/
		
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
				
        this.spd > this.spdBackMax ? this.spd -= 0.03 : this.spd = this.spdBackMax			
				
        this.model.translateZ( -this.spd )
        this.model.rotation.y -= this.spdRot * Math.abs( this.spd )				
	  }
	
	} else {
			
      if ( this.spd < 0 && ! keys.up ) {
		this.model.translateZ( -this.spd ) 
        this.model.rotation.y -= this.spdRot * Math.abs( this.spd )					
        this.spd += 0.01 			
      }		
    }
		
    if ( Math.abs( this.spd ) > 0.1 && this.currentFuel > 0 ) this.currentFuel -= 1
  }

  moveByEnemy() {

    this.model.position.x += this.spdX
    this.model.position.z += this.spdZ		
  }
	
  startExplosive() {

    this.state ='explosive'
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
		
    if ( this.state == 'dropFromAir' ) this.animateDropFromAir()		
    if ( this.state == 'explosive' ) this.animateExplosive()
    if ( this.state == "afterExplosive" ) this.timerRemove --
    if ( this.timerRemove < 0 ) this.deleteObj()
  }
  
  animateDropFromAir() {

    if ( this.model.position.y > -6 ) { 
		
      this.model.position.y -= 1 
      this.model.position.z += 1 
      if ( ! this.parashute && this.model.position.y < 200 ) this.parashute = new Parashute( this )	
	
    } else {
		  
      this.model.position.y = -6
      this.kvadrant = checkKvadrant( this.model )
      this.parashute ? this.parashute.render() : this.state = 'none' 
    }	
  }

  animateExplosive() {
		
    if ( this.timerExplosion < 0 ) this.state = 'afterExplosive'
		
      this.modelBase.material.opacity -= 0.004
      this.modelGun.material.opacity -= 0.004	
      geomAnimateExplosive( this.geoms.base )
      geomAnimateExplosive( this.geoms.gun )	
		
      this.timerExplosion --
  }

  deleteObj() {
		
    sv.removeLabel( this )
    this.spdForBullet = null
    s.scene.remove( this.model )
    this.model = null
    this.geoms.base = null
    this.geoms.gun = null
    this.geoms = null
    this.isRemovable = true
  }
	
  remove() {
		
    this.deleteObj()		
  }
	
  updateParamsFromServer( paramsServer ) {

    this.lives = paramsServer.lives
		
    if ( cope ) {
      if ( cope.car ) {	
        if ( cope.car.id == paramsServer.id ) {	
          return
        }	 
      }
    }

    this.userId = paramsServer.isUser
    if ( this.userId == null ) return
		
    this.spdX = calckSpeed( this.model.position.x, paramsServer.posX )	
    this.spdZ = calckSpeed( this.model.position.z, paramsServer.posZ )
    this.modelGun.rotation.copy( paramsServer.rotationGun ) 
		
    if ( paramsServer.rotation != null )  this.model.rotation.copy( paramsServer.rotation ) 
    this.kvadrant = checkKvadrant( this.model )
  }
	
  hit( updateCopeIfIt ) {
		
    if ( Math.random() > 0.0005 ) return //testFunc   
		
    if ( updateCopeIfIt ) updateCopeIfIt() 
		
    let dam = Math.floor( Math.random()*3 )
		
	switch ( Math.floor( Math.random()*4 ) ) { 
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




/***********************************************;
 * CREATE CAR CAMERAS
 ***********************************************/
 
const initCarCameras = () => {

  s.carCameras.pivot = new THREE.Mesh(
    new THREE.BoxGeometry( 0.01, 0.01, 0.01 ),
    new THREE.MeshBasicMaterial( { color: 0x000000 } )
  )

  /** gun */
  let cam = new THREE.PerspectiveCamera( 20, 300 / 200, 1, 10000 )
  cam.position.set( 0, 4, 0 )
  s.carCameras.pivot.add( cam )
  s.carCameras.gun = cam
	
  /** front */ 
  cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
  cam.position.set( 0, -10, -30 )
  s.carCameras.pivot.add( cam )
  s.carCameras.front = cam	

  /** back */
  cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
  cam.position.set( 0, -10, 30 )
  cam.rotation.y = Math.PI
  s.carCameras.pivot.add( cam )
  s.carCameras.back = cam	

  /** left */
  cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
  cam.position.set( -20, -10, 30 )
  cam.rotation.y = Math.PI / 2	
  s.carCameras.pivot.add( cam )
  s.carCameras.left = cam	

  /** right */
  cam = new THREE.PerspectiveCamera( 45, 300 / 200, 1, 10000 )
  cam.position.set( 20, -10, 30 )
  cam.rotation.y = -Math.PI / 2	
  s.carCameras.pivot.add( cam )
  s.carCameras.right = cam	
}





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
 * CAR
 **************************************************/	

 class Car {
	 
	constructor () {

	
		/** params */
		this.spdMax = 5;
		this. spdBackMax = -3;
		this.spd = 0;
		this.spdRot = 0;
		this.gunSpdRot = 0;
		this.isMove = true;
		this.kvadrant = { x:0, z:0 };		
		


		
		/** model */
		this.model = new THREE.Mesh(
			new THREE.BoxGeometry(0.01,0.01,0.01),
			new THREE.MeshPhongMaterial( { color: 0x112222 } )	
		);
		
		this.modelCar = false;
		this.loader  = new THREE.OBJLoader();	
		this.loader.load( 'jsScene/car.obj', function ( object ) {	
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh != true){
					return;
				}	
				if( typeof child.geometry.attributes.position.array != "object" ){ 
					return;
				}	
				car.modelCar = new THREE.Mesh(
					child.geometry,
					new THREE.MeshPhongMaterial( {color: 0x05e099} )
				)
				car.modelCar.position.y = -20				
				car.model.add(car.modelCar);
				
				for (let i = 0; i < 20; i ++ ){
					let c = car.modelCar.clone();
					c.position.set( Math.random()*2000-1000, -20, Math.random()*2000-1000 );
					s.scene.add(c);	
				}
				
			});	
		});
		
		this.loader2  = new THREE.OBJLoader();	
		this.loader2.load( 'jsScene/carGun.obj', function ( object ) {	
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh != true){
					return;
				}	
				if( typeof child.geometry.attributes.position.array != "object" ){ 
					return;
				}	
				car.modelGun = new THREE.Mesh(
					child.geometry,
					new THREE.MeshPhongMaterial( {color: 0x05e099} )
				)
				car.modelGun.position.y = -20;
				car.model.add(car.modelGun);
			});	
		});		
		
		

		
		/** cameras */
		this.cameras = {};
		this.cameras.gun = new THREE.PerspectiveCamera( 20, 300 /200, 1, 10000 );
		this.cameras.gun.position.set(0, -1, 0); 
		this.model.add( this.cameras.gun );		
		
		this.cameras.front = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.front.position.set(0, -15, -30); 
		this.model.add( this.cameras.front );

		this.cameras.back = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.back.position.set(0, -15, 30);
		this.cameras.back.rotation.y = Math.PI;	
		this.model.add( this.cameras.back );	

		this.cameras.left = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.left.position.set(-20, -15, 30);
		this.cameras.left.rotation.y = Math.PI/2;	
		this.model.add( this.cameras.left );

		this.cameras.right = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.right.position.set(20, -15, 30);
		this.cameras.right.rotation.y = -Math.PI/2;	
		this.model.add( this.cameras.right );		
	}
	
	move () {
		
		if ( !this.isMove ) return;
		
		this.kvadrant = checkKvadrant( this.model );
		
		/** update rotation gun */ 
		if (keys.A){
			car.cameras.gun.rotation.y += 0.01;
		}						
		if (keys.D){
			this.cameras.gun.rotation.y -= 0.01;
		}	
		if ( car.modelGun ){	
			car.modelGun.rotation.y = car.cameras.gun.rotation.y;  		
		}
		
		/** rotation car */	
		if ( keys.left )
			if ( this.spdRot < 0.01) this.spdRot += 0.0001;		
		if ( keys.right )
			if ( this.spdRot >  -0.01) this.spdRot -= 0.0001;
		if (Math.abs( this.spdRot) < 0.0001)
				this.spdRot = 0;
	
		/** move forward*/
		if (keys.up){
			this.spd < this.spdMax ? this.spd += 0.03 : this.spd = this.spdMax ; 
			this.model.translateZ( -this.spd );			
			if (this.spd > 0 ){
				this.model.rotateOnAxis( new THREE.Vector3(0,1,0), this.spdRot * Math.abs(this.spd) );
			} else {
				this.model.rotateOnAxis( new THREE.Vector3(0,1,0), -this.spdRot * Math.abs(this.spd) );		
			}			
		} else { 
			if (this.spd > 0 && !keys.down ) {
				this.spd -= 0.01;			
				this.model.translateZ( -this.spd );
				this.model.rotateOnAxis( new THREE.Vector3(0,1,0), this.spdRot * Math.abs(this.spd) );			
			}
		}					

		/** move backward */
		if (keys.down){
			if (this.spd > 0 ){	
				this.spd -= 0.06; 
				this.model.translateZ( -this.spd );
				this.model.rotateOnAxis( new THREE.Vector3(0,1,0), this.spdRot * Math.abs( this.spd ) );			
			}else{
				if ( this.spd > this.spdBackMax ){
					this.spd -= 0.03;
				}else{
					this.spd = this.spdBackMax; 				
				}
				this.model.translateZ( -this.spd );				
				this.model.rotateOnAxis( new THREE.Vector3(0,1,0), -this.spdRot * Math.abs( this.spd ) );				
			}			
		} else {
			if ( this.spd < 0 && !keys.up ){
				this.model.translateZ( -this.spd );
				this.model.rotateOnAxis( new THREE.Vector3(0,1,0), -this.spdRot * Math.abs( this.spd ) );			
				this.spd += 0.01 			
			}		
		}
				
	}
	
}	





/**************************************************;
 * COPE
 **************************************************/

class Cope {
	
	constructor () {
		
		/** params */
		this.isCanExit = true;
		
		/** init scene cabin **********************/		

		/** init scene  */
		this.sc = new THREE.Scene();
		this.textureBack = new THREE.TextureLoader().load( "jsScene/back.jpg", 
				()=>{ cope.sc.background = cope.textureBack; } 	
			);
	
		/** init camera */
		let aspect = window.innerWidth / window.innerHeight;
		this.cam = new THREE.PerspectiveCamera(  70, 300 /200, 1, 10000 );
		this.cam.position.set(0, 0, 600);
		this.sc.add(this.cam);
		
		/** init renderer */
		this.renderPass = new THREE.RenderPass( this.sc, this.cam );
		composer.addPass( this.renderPass );			

		
		/** init screens **************************/
		
		/** gun screen */
		this.scrGunTexture = new THREE.WebGLRenderTarget( 
			600, 350, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			});
		this.scrGun = new THREE.Mesh(
			new THREE.PlaneGeometry(700, 250 ,1),
			new THREE.MeshBasicMaterial( { map: this.scrGunTexture.texture } )
		);
		this.scrGun.position.set(0, 300, -30)
		this.sc.add(this.scrGun);
		
		/** front screen */
		this.scrFrontTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			});
		this.scrFront = new THREE.Mesh(
			new THREE.PlaneGeometry(400, 250, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrFrontTexture.texture } )
		);
		this.scrFront.position.set( 0, -30, -30)
		this.sc.add(this.scrFront);	

		/** back screen */
		this.scrBackTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			});
		this.scrBack = new THREE.Mesh(
			new THREE.PlaneGeometry(300, 210, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrBackTexture.texture } )
		);
		this.scrBack.position.set( 0, -270, -30);
		this.scrBack.rotation.x = -0.3;		
		this.sc.add(this.scrBack);

		/** left screen */
		this.scrLeftTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			});
		this.scrLeft = new THREE.Mesh(
			new THREE.PlaneGeometry(350, 250, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrLeftTexture.texture } )
		);
		this.scrLeft.rotation.y = 1.0;		
		this.scrLeft.position.set( -400, -30, -30)
		this.sc.add(this.scrLeft);	

		/** right screen */
		this.scrRightTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			});
		this.scrRight = new THREE.Mesh(
			new THREE.PlaneGeometry(350, 250, 1 ),
			new THREE.MeshBasicMaterial( { map: this.scrRightTexture.texture } )
		);
		this.scrRight.position.set( 400, -30, -30);
		this.scrRight.rotation.y = -1.0;
		this.sc.add(this.scrRight);		
		
		

		/** init Buttons **************************/
		this.htmlElems = document.getElementById('copeElems');	
		this.htmlElems.style.display = "block";
	}
	
	updateScreens( scene, cameras, vehicle, renderer ){
		
		if ( ! vehicle.isMove ) return;
		
		/** update cope buttons */ 
		if ( vehicle.spd > 1) {
			buttExitCope.style.opacity = 0.3;
			this.isCanExit = false;
		} else { 
			buttExitCope.style.opacity = 1.0;
			this.isCanExit = true;
		}
					
		/** render cope screens */		
		renderer.render( scene, cameras.gun, this.scrGunTexture );
		renderer.render( scene, cameras.front, this.scrFrontTexture );
		renderer.render( scene, cameras.back, this.scrBackTexture );
		renderer.render( scene, cameras.left, this.scrLeftTexture );
		renderer.render( scene, cameras.right, this.scrRightTexture );

		/** exit cope */
		if ( keys.enter && this.isCanExit ){
			exitCope();
		}		
		
	}
	
	hideView () {
		this.htmlElems.style.display = "none";		
	}
	
	showView () {
		this.htmlElems.style.display = "block";	
	}	
		
}






/**************************************************;
 * HERO
 **************************************************/

class Hero {
	
	constructor ( sc ) {
		
		
		this.isMove = false;
		this.kvadrant = { x:0, z:0 };
		
		/** camera */
		this.cam = new THREE.PerspectiveCamera( 70, 300 /200, 1, 10000 );
		sc.add( this.cam );	
		
		/** renderer */
		this.renderPass = new THREE.RenderPass( sc, this.cam );
		composer.addPass( this.renderPass );
		this.renderPass.enabled = false;	
		
		/** mouse controls params */
		this.clock = new THREE.Clock();
		this.INV_MAX_FPS = 0.01;
		this.frameDelta = 0;
		this.fps = this.INV_MAX_FPS; 	
		
		this.cam.position.y = -20;		
		
		/** buttons */
		this.htmlElems = document.getElementById('heroElems');
		this.htmlElems.style.display = "none";		
	}
	
	renderFrame ( renderer, sc ) {
		
		if ( !this.isMove ) return;		
			
		/** update controls */	
		this.frameDelta += this.clock.getDelta();
		while (this.frameDelta >= this.INV_MAX_FPS){				
			this.controls.update( this.INV_MAX_FPS);						
			this.frameDelta -= this.INV_MAX_FPS;
		}

		/** check position near car and enter */
		this.kvadrant = checkKvadrant( this.cam );
		if( this.kvadrant.x == car.kvadrant.x && this.kvadrant.z == car.kvadrant.z ){
			buttEnterCope.style.opacity = 1.0;	
			if (keys.enter) enterCope();	
		}else{
			buttEnterCope.style.opacity = 0.0;	
		}	
		
	}
	
	hideView ( ) {
		this.htmlElems.style.display = "none";	
		hero.controls = null;			
	}	
	
	showView ( p ) {
			
		hero.cam.position.set( p.x, 6, p.z );			
			
		this.controls = new THREE.FirstPersonControls( this.cam ); 
		this.controls.movementSpeed = 30;
		this.controls.lookSpeed = 0.1;
		this.controls.isForwardCanMove = true;	
		
		this.htmlElems.style.display = "block";		
	}
}	
 
 
 
 
 
 
/**************************************************;
 * FUNCTIONS FOR SCENE OBJECTS 
 **************************************************/ 

const checkKvadrant = ( obj ) => {
	
	return ({ 
		x: Math.floor(obj.position.x / 30 ),
		z: Math.floor(obj.position.z / 30 )	 
	});
}	




 
 
/**************************************************;
 * CHANCHE VIEWS COPE/HERO  
 **************************************************/ 
 
const exitCope = () => {
	
	keys.enter = false;	

	car.isMove = false;	
	hero.isMove = true;	
	
	cope.hideView();
	hero.showView( car.model.position );
	

	cope.renderPass.enabled = false;
	hero.renderPass.enabled = true;
	

}

const enterCope = () => {
	
	keys.enter = false;	
	
	car.isMove = true;
	hero.isMove = false;	
		
	hero.hideView();
	cope.showView();

	
	hero.renderPass.enabled = false;
	cope.renderPass.enabled = true;
}
 
 
 
 
 
/**************************************************;
 * SCENE
 **************************************************/
 
/** OBJ SCENE */			
const s = {}; 

/** SCENE */
const initScene = () => { 
				
	s.scene = new THREE.Scene();
	s.scene.background = new THREE.Color( 0x060c1a);
	s.scene.fog = new THREE.FogExp2( 0x060c1a ,0.0012);		
	
	s.clock = new THREE.Clock();
	
	/** LIGHTS */
	s.pointF = new THREE.PointLight();
	s.pointF.position.set(0, 2000, 1000);
	s.scene.add(s.pointF);
	
	s.ambient = new THREE.AmbientLight( 0x06253a, 1.0 );
	s.scene.add(s.ambient);	
	
	/** FLOOR */
	s.floor = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshBasicMaterial( {
			color: 0x0bd592,
			wireframe: true,
			wireframeLinewidth: 0.5
		})
	);
	
	s.floor.rotation.x = -Math.PI/2;
	s.floor.position.y = -30;
	s.scene.add( s.floor );	
}







/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
const animate = () => {
		

	/** update car */
	car.move();

	/** update hero */
	hero.renderFrame( s.renderer, s.scene );	
	 
	/** update cope */
	cope.updateScreens( s.scene, car.cameras, car, s.renderer );
	
	/** render */	
	composer.render();	
		
	/** animate next frame */
	requestAnimationFrame( animate );	
}







/**************************************************;
 * RESIZE SCENE
 **************************************************/

const handleWindowResize = () => {
	s.renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);









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
	enter: false
}

function keyUpdate(keyEvent, down) {
	
	switch (keyEvent.keyCode) {
		case 38:
			keys.up = down;
			break;
		case 40:
			keys.down = down;
			break;
		case 37:
			keys.left = down;
			break;
		case 39:
			keys.right = down;
			break;
		case 65:
			keys.A = down;
			break;
		case 68:
			keys.D = down;
			break;
		case 87:
			keys.W = down;
			break;
		case 83:
			keys.S = down;
			break;
		case 13:
			keys.enter = down;	
	}
}
 
document.addEventListener("keydown", function(event) {
	keyUpdate(event, true);
});

document.addEventListener("keyup", function(event) {
	keyUpdate(event, false);
});


/** MOUSE CLICK *******************************/
 
let buttGunLeft = document.getElementById('gunLeft');
buttGunLeft.onmousedown = (e) => {
	keys.A = true;
}	
buttGunLeft.onmouseup = (e) => {
	keys.A = false;
}
let buttGunRight = document.getElementById('gunRight');
buttGunRight.onmousedown = (e) => {
	keys.D = true;
}	
buttGunRight.onmouseup = (e) => {
	keys.D = false;
}

let buttExitCope = document.getElementById('exitCope'); 
buttExitCope.onclick = () => {
	keys.enter = true; 
}

let buttEnterCope = document.getElementById('enterCope'); 
buttEnterCope.onclick = () => {
	keys.enter = true;
}






/**************************************************;
 * INIT
 **************************************************/


 
 /** POSTPROCESSING ********************************/

s.renderer = new THREE.WebGLRenderer();
s.renderer.setPixelRatio( window.devicePixelRatio );
s.renderer.setSize( window.innerWidth, window.innerHeight);
s.renderer.setClearColor(0xffffff);
document.body.appendChild( s.renderer.domElement );

const composer = new THREE.EffectComposer( s.renderer );	

const simplePass = new THREE.ShaderPass(SimpleShader);	
composer.addPass(simplePass);	
simplePass.renderToScreen = true;	


//s.videoPass = new THREE.ShaderPass(myEffect2);
//composer.addPass(s.videoPass);
//s.videoPass.renderToScreen = true;	


 
/** SCENE *****************************************/
  
initScene();

const car = new Car();
s.scene.add( car.model );
const cope = new Cope();
const hero = new Hero( s.scene );



/** ANIMATION LOOP ********************************/
	
animate();



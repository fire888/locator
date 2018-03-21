/**
 **************************************************; 
 *  Project        	:		LOCATOR 
 *  Program name   	: 		Threejs scene 
 *  Author         	: 		www.otrisovano.ru
 *  Date           	: 		16/03/2018
 *  Purpose        	: 		check brain   
 **************************************************/ 
  
"use strict";








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

		
		
		
		/** init screens **************************/
		
		/** gun screen */
		this.scrGunTexture = new THREE.WebGLRenderTarget( 
			600, 450, { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.NearestFilter
			});
		this.scrGun = new THREE.Mesh(
			new THREE.PlaneGeometry(1000, 350,1),
			new THREE.MeshBasicMaterial( { map: this.scrGunTexture } )
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
			new THREE.MeshBasicMaterial( { map: this.scrFrontTexture } )
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
			new THREE.MeshBasicMaterial( { map: this.scrBackTexture } )
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
			new THREE.MeshBasicMaterial( { map: this.scrLeftTexture } )
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
			new THREE.MeshBasicMaterial( { map: this.scrRightTexture } )
		);
		this.scrRight.position.set( 400, -30, -30);
		this.scrRight.rotation.y = -1.0;
		this.sc.add(this.scrRight);		
		
		

		/** init Buttons **************************/
		this.htmlElems = document.getElementById('copeElems');
		//https://experiments.withgoogle.com/webvr/inside-music/view/		
		
		
		
		/** init RENDERER *************************/
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight);
		document.body.appendChild( this.renderer.domElement );
		
	}
	
	updateScreens( scene, cameras, vench ){
		
		if ( !vench.isMove ) return;
		
		/** update cope buttons */ 
		if (vench.spd > 1) {
			buttExitCope.style.opacity = 0.3;
			this.isCanExit = false;
		} else { 
			buttExitCope.style.opacity = 1.0;
			this.isCanExit = true;
		}	
		
		/** render cope screens */
		this.renderer.render( scene, cameras.gun, this.scrGunTexture );
		this.renderer.render( scene, cameras.front, this.scrFrontTexture );
		this.renderer.render( scene, cameras.back, this.scrBackTexture );
		this.renderer.render( scene, cameras.left, this.scrLeftTexture );
		this.renderer.render( scene, cameras.right, this.scrRightTexture );

		/** render cope scene */
		let time = s.clock.getDelta();	
		if ( s.videoPass ){
			s.videoPass.uniforms.iTime.value += time*2.0;	
		}	
		composer.render();
		
	}
	
	hideView () {
		this.htmlElems.style.display = "none";
		this.renderer.domElement.style.display = "none";		
	}
	
	showView () {
		this.htmlElems.style.display = "block";
		this.renderer.domElement.style.display = "block";		
	}	
		
}








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
			new THREE.BoxGeometry(10,10,10),
			new THREE.MeshPhongMaterial( { color: 0x00ff00 } )	
		);
		
		/** cameras */
		this.cameras = {};
		this.cameras.gun = new THREE.PerspectiveCamera( 20, 300 /200, 1, 10000 );
		this.cameras.gun.position.set(0, 30, 0); 
		this.model.add( this.cameras.gun );		
		
		this.cameras.front = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.front.position.set(0, 0, -30); 
		this.model.add( this.cameras.front );

		this.cameras.back = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.back.position.set(0, 0, 30);
		this.cameras.back.rotation.y = Math.PI;	
		this.model.add( this.cameras.back );	

		this.cameras.left = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.left.position.set(-20, 0, 30);
		this.cameras.left.rotation.y = Math.PI/2;	
		this.model.add( this.cameras.left );

		this.cameras.right = new THREE.PerspectiveCamera( 45, 300/200, 1, 10000 );
		this.cameras.right.position.set(20, 0, 30);
		this.cameras.right.rotation.y = -Math.PI/2;	
		this.model.add( this.cameras.right );		
	}
	
	move () {
		
		if ( !this.isMove ) return;
		
		this.kvadrant = checkKvadrant( this.model );
		
		/** update rotation gun */ 
		if (keys.A){
			car.cameras.gun.rotation.y += 0.01;
			//console.log("A");
		}						
		if (keys.D){
			this.cameras.gun.rotation.y -= 0.01;
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
 * HERO
 **************************************************/

class Hero {
	
	constructor ( sc ) {
		
		this.isMove = false;
		this.kvadrant = { x:0, z:0 };
		
		/** camera */
		this.cam = new THREE.PerspectiveCamera( 70, 300 /200, 1, 10000 );
		sc.add( this.cam );	
		
		/** mouse controls */
		this.clock = new THREE.Clock();
		this.INV_MAX_FPS = 0.01;
		this.frameDelta = 0;
		this.fps = this.INV_MAX_FPS; 	
		this.controls = new THREE.FirstPersonControls( this.cam );
		this.controls.movementSpeed = 30;
		this.controls.lookSpeed = 0.1;
		this.controls.isForwardCanMove = true;
		
		this.cam.position.y = -20;		
		
		/** buttons */
		this.htmlElems = document.getElementById('heroElems');
		this.htmlElems.style.display = "none";
		
		/** renderer */
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight);
		document.body.appendChild( this.renderer.domElement );
		this.renderer.domElement.style.display = "none";
		
	}
	
	renderFrame ( sc ) {
		
		if ( !this.isMove ) return;
		
		/** check position near car */
		this.kvadrant = checkKvadrant( this.cam );
		if( this.kvadrant.x == car.kvadrant.x && this.kvadrant.z == car.kvadrant.z ){
			this.htmlElems.style.display = "block";			
		}else{
			this.htmlElems.style.display = "none";	
		}			
			
		/** update controls */	
		this.frameDelta += this.clock.getDelta();
		while (this.frameDelta >= this.INV_MAX_FPS){				
			this.controls.update( this.INV_MAX_FPS);						
			this.frameDelta -= this.INV_MAX_FPS;
		}	
		
		/** render frame */
		this.renderer.render( sc, this.cam );	
	}
	
	hideView () {
		this.htmlElems.style.display = "none";		
		this.renderer.domElement.style.display = "none";		
	}	
	
	showView () {
		//this.htmlElems.style.display = "none";		
		this.renderer.domElement.style.display = "block";		
	}
}	
 
 
 
 
 
 
/**************************************************;
 * FUNCTIONS FOR SCENE OBJECTS 
 **************************************************/ 

const checkKvadrant = ( obj ) => {
	return ( { x: Math.floor(obj.position.x / 30 ),
			   z: Math.floor(obj.position.z / 30 )	 
		   } );
}	




 
 
/**************************************************;
 * CHANCHE VIEWS COPE/HERO  
 **************************************************/ 
 
const exitCope = () => {
	
	cope.hideView();
	car.isMove = false;
	
	hero.cam.position.set( car.model.position.x, 6, car.model.position.z );
	hero.showView();
	hero.isMove = true;
}

const enterCope = () => {
		
	hero.hideView();
	hero.isMove = false;
	
	cope.showView();
	car.isMove = true;	
}
 
 
 
 
 
/**************************************************;
 * SCENE
 **************************************************/
 
/** OBJ SCENE */			
const s = {}; 

/** SCENE */
const initScene = () => { 
				
	s.scene = new THREE.Scene();
	s.scene.background = new THREE.Color( 0x006600);
	

	s.clock = new THREE.Clock();
	
	/** LIGHTS */
	s.pointF = new THREE.PointLight();
	s.pointF.position.set(0, 0, 2000);
	s.scene.add(s.pointF);
	
	/** FLOOR */
	s.floor = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshBasicMaterial( {
			color: 0x888888,
			wireframe: true,
			wireframeLinewidth: 0.5
		})
	);
	s.floor.rotation.x = -Math.PI/2;
	s.floor.position.y = -30;
	s.scene.add( s.floor );
	
	/** OB1 */
	var geometry =  new THREE.BoxGeometry( 10, 10, 10, 10,10,10);	
	s.wireframe = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x777777 } ) );
	s.scene.add( s.wireframe );	
	
	/** ob2 */ 
	let geomPlane = new THREE.PlaneGeometry(20, 20, 5, 5);
	let material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
	});

	let mesh = new THREE.Mesh(geomPlane, material);
	mesh.position.set(-20, 0, 0);
	s.scene.add(mesh);
	
	/** ob3 */ 
	s.loader = new THREE.OBJLoader();
	s.loader.load( 'jsScene/head.obj', function ( object ) {	
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh != true){
				return;
			}	
			if( typeof child.geometry.attributes.position.array != "object" ){ 
				return;
			}
			
			/** new 1 */
			s.mesh = new THREE.Mesh( 	
				child.geometry,
				new THREE.MeshPhongMaterial( { color: 0x000000 } )			
			);
			s.mesh.scale.set(0.3, 0.3, 0.3);
			s.scene.add(s.mesh);
			
			
			/** new 2 */
 			let fgeo = new THREE.EdgesGeometry( child.geometry );
			let matt = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );	
			s.wireframe2 = new THREE.LineSegments( fgeo, matt );
			s.wireframe2.scale.set(0.3, 0.3, 0.3);
			s.wireframe2.position.set(20, 0, 0);
			s.scene.add( s.wireframe2 );				
			
		});	
	});	
}







/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
const animate = () => {
		
	/** update scene */
	s.wireframe.rotation.y += 0.01;
	s.wireframe.rotation.x += 0.01;
	
	if (s.mesh){
		s.mesh.rotation.y += 0.01;
	}
	
	/** update hero */
	hero.renderFrame( s.scene );

	/** update car */
	car.move();

	/** render cope screens */
	cope.updateScreens( s.scene, car.cameras, car );
	 	
	/** animate next frame */
	requestAnimationFrame( animate );	
}







/**************************************************;
 * RESIZE SCENE
 **************************************************/

const handleWindowResize = () => {
	//s.renderer.setSize(window.innerWidth, window.innerHeight);
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
	D: false
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
	}
}
 
document.addEventListener("keydown", function(event) {
	keyUpdate(event, true);
});

document.addEventListener("keyup", function(event) {
	keyUpdate(event, false);
});


/** MOUSE CLICK *******************************/
/* 
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
}*/
let buttExitCope = document.getElementById('exitCope'); 
buttExitCope.onclick = () => {
	if (cope.isCanExit) exitCope();
}
let buttEnterCope = document.getElementById('enterCope'); 
buttEnterCope.onclick = () => {
	enterCope();
}






/**************************************************;
 * INIT
 **************************************************/

 
/** SCENE *****************************************/
  
initScene();
const cope = new Cope();
const car = new Car();
s.scene.add( car.model );	

const hero = new Hero( s.scene );


/** POSTPROCESSING ********************************/
	
const composer = new THREE.EffectComposer( cope.renderer );	
const renderScene = new THREE.RenderPass( cope.sc, cope.cam );
composer.addPass( renderScene );

s.videoPass = new THREE.ShaderPass(myEffect2);
composer.addPass(s.videoPass);
s.videoPass.renderToScreen = true;	


/** ANIMATION LOOP ********************************/
	
animate();


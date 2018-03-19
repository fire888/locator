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
 * Cabin
 **************************************************/

class Cabin{
	
	constructor(){
		
		/** init scene cabin **********************/		

		/** init scene  */
		this.sc = new THREE.Scene();
		this.textureBack = new THREE.TextureLoader().load( "jsScene/back.jpg", 
				()=>{ cabin.sc.background = cabin.textureBack; } 	
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

	}
	
	updateScreens( renderer, scene, cameras ){
		//renderer.render( scene, cameras.gun, this.scrGunTexture );
		//renderer.render( scene, cameras.front, this.scrFrontTexture );
		//renderer.render( scene, cameras.back, this.scrBackTexture );
		//renderer.render( scene, cameras.left, this.scrLeftTexture );
		//renderer.render( scene, cameras.right, this.scrRightTexture );		
	}

	render(r){
		//r.render( this.sc, this.cam );
	}		
}




/**************************************************;
 * CAR
 **************************************************/	

 class Car{
	 
	constructor(){
		
		/** Main params */
		this.spdMax = 5;
		this. spdBackMax = -3;
		this.spd = 0;
		this.spdRot = 0;
		this.gunSpdRot = 0;
				
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
	
	move(){
		
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

class Hero{
	constructor(){
	
	}
}	
 



 
/**************************************************;
 * SCENE
 **************************************************/
 
/** objSCENE */			
const sc = {}; 
var clock = new THREE.Clock();

/** SCENE */
const initScene = () => { 
					
    sc.scene = new THREE.Scene();
	sc.scene.background = new THREE.Color( 0x000000 );
	

	sc.clock = new THREE.Clock();
	
	/** LIGHTS */
	sc.pointF = new THREE.PointLight();
	sc.pointF.position.set(0, 0, 2000);
	sc.scene.add(sc.pointF);
	sc.pointL = new THREE.PointLight();
	sc.pointL.position.set(-2000, 0, 0);
	sc.scene.add(sc.pointL);
	sc.pointR = new THREE.PointLight();
	sc.pointR.position.set(2000, 0, 0);
	sc.scene.add(sc.pointR);
	
	/** FLOOR */
	sc.floor = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshBasicMaterial( {
			color: 0x888888,
			//linewidth: 1,
			wireframe: true,
			wireframeLinewidth: 0.5
			//linecap: 'round', //ignored by WebGLRenderer
			//linejoin:  'round' //ignored by WebGLRenderer
		})
	);
	sc.floor.rotation.x = -Math.PI/2;
	sc.floor.position.y = -30;
	sc.scene.add( sc.floor );
	
	/** OB1 */
	var geometry =  new THREE.BoxGeometry( 10, 10, 10, 10,10,10);	
	sc.wireframe = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x777777 } ) );
	sc.scene.add( sc.wireframe );	
	
	/** ob2 */ 
	let geomPlane = new THREE.PlaneGeometry(20, 20, 5, 5);
    let material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });

    let mesh = new THREE.Mesh(geomPlane, material);
	mesh.position.set(-20, 0, 0);
    sc.scene.add(mesh);
	
	/** ob3 */ 
	sc.loader = new THREE.OBJLoader();
	sc.loader.load( 'jsScene/head.obj', function ( object ) {	
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh != true){
				return;
			}	
			if( typeof child.geometry.attributes.position.array != "object" ){ 
				return;
			}
			
			
			sc.mesh = new THREE.Mesh( 	
				child.geometry,
				new THREE.MeshPhongMaterial( { color: 0x000000 } )			
			);
			sc.mesh.scale.set(0.3, 0.3, 0.3);
			sc.scene.add(sc.mesh);
			
			/** new */
 			let fgeo = new THREE.EdgesGeometry( child.geometry );
			let matt = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );	
			sc.wireframe2 = new THREE.LineSegments( fgeo, matt );
						sc.wireframe2.scale.set(0.3, 0.3, 0.3);
						sc.wireframe2.position.set(20, 0, 0);
			sc.scene.add( sc.wireframe2 );				
			
		});	
	});
	
	sc.renderer2 = new THREE.WebGLRenderer();
	sc.renderer2.setPixelRatio( window.devicePixelRatio );
	sc.renderer2.setSize( window.innerWidth, window.innerHeight);
	document.body.appendChild( sc.renderer2.domElement );	
	
}



/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
const animate = () => {
		
	/** update scene */
	sc.wireframe.rotation.y += 0.01;
	sc.wireframe.rotation.x += 0.01;
	
	if (sc.mesh){
		sc.mesh.rotation.y += 0.01;
	}

	/** update car */
	car.move();

	/** render cope screens */
	sc.renderer2.render( sc.scene, car.cameras.front, cabin.scrGunTexture );
	sc.renderer2.render( sc.scene, car.cameras.front, cabin.scrFrontTexture );
	sc.renderer2.render( sc.scene, car.cameras.front, cabin.scrBackTexture );
	sc.renderer2.render( sc.scene, car.cameras.front, cabin.scrLeftTexture );
	sc.renderer2.render( sc.scene, car.cameras.front, cabin.scrRightTexture );	
	
	/** update cope */ 
	let time = sc.clock.getDelta();	
	
	if ( sc.videoPass ){
		sc.videoPass.uniforms.iTime.value += time*2.0;	
	}	
	composer.render();
	
	/** animate */
	requestAnimationFrame( animate );	
}


/**************************************************;
 * Init SCENE
 **************************************************/

initScene();
const cabin = new Cabin();
const car = new Car();
sc.scene.add( car.model );	

/** POSTPROCESSING ********************************/
	
const composer = new THREE.EffectComposer( sc.renderer2 );	
const renderScene = new THREE.RenderPass( cabin.sc, cabin.cam );
composer.addPass( renderScene );

sc.videoPass = new THREE.ShaderPass(myEffect2);
composer.addPass(sc.videoPass);
sc.videoPass.renderToScreen = true;	
	


	
animate();




/**************************************************;
 * resize scene
 **************************************************/

const handleWindowResize = () => {
	//sc.renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize, false);




/**************************************************;
 * listener window keydown
 **************************************************/
 
var keys = {
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


/** INTERFACE BUTTONS */ 
let buttGunLeft = document.getElementById('gunLeft');
buttGunLeft.onmousedown = (e) => {
	keys.A = true;
}	
buttGunLeft.onmouseup = (e) => {
	keys.A = false;
}

let buttGunRight = document.getElementById('gunRight')
buttGunRight.onmousedown = (e) => {
	keys.D = true;
}	
buttGunRight.onmouseup = (e) => {
	keys.D = false;
}



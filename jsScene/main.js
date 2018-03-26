
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
	arrEnemies: []
}

/** obj scene */
const s = {
	loader: new THREE.OBJLoader(),
	geomCar: null,
	geomCarGun: null
}; 

let car, cope, hero;




/**************************************************;
 * LOAD SCENE
 **************************************************/

const loadAssets = () => {
	return new Promise ( ( resolve ) => {
		s.loader.load( 'jsScene/car.obj',
			( obj ) => { 
				obj.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh != true){
						return;
					}	
					if( typeof child.geometry.attributes.position.array != "object" ){ 
						return;
					}	
					s.geomCar = child.geometry;
					resolve(); 
				});
			}	
		);	
	})
	.then ( () => {
		return new Promise ( (resolve) => { 
			s.loader.load( 'jsScene/carGun.obj', function ( object ) {	
				object.traverse( ( child ) => {
					if ( child instanceof THREE.Mesh != true){
						return;
					}	
					if( typeof child.geometry.attributes.position.array != "object" ){ 
						return;
					}
				
					s.geomCarGun = child.geometry;
					resolve();
				});
			});
		});		
	})
	.then ( () => {
		
			initRenderer();
			initScene();
		
			car = new Car();
			cope = new Cope( car );
			hero = new Hero( s.scene );	
			
			for ( let i = 0; i< 15; i++  ){
				let bot = new Bot();
				g.arrEnemies.push(bot);	
			}
			
			animate();			
	});
};

loadAssets(); 
  
  
  
/**************************************************;
 * CAR
 **************************************************/	

class Car {
	 
	constructor () {

	
		/** params */
		this.spdMax = 5;
		this.spdBackMax = -3;
		this.spd = 0;
		this.spdRot = 0;
		this.gunSpdRot = 0;
		this.isMove = true;
		this.kvadrant = { x:0, z:0 };

		this.spdForBullet = {
				pX: 0, pZ:0,
				pXold: 0, pZold: 0,
				x:0, z:0
			};	
		

		/** model */
		this.model = new THREE.Mesh(
			new THREE.BoxGeometry(0.01,0.01,0.01),
			new THREE.MeshPhongMaterial( { color: 0x112222 } )	
		);
		s.scene.add( this.model );
				
		this.modelCar = new THREE.Mesh(
			s.geomCar,
			new THREE.MeshPhongMaterial( {color: 0xdddd55} )
		);
		this.modelCar.position.y = -22; 
		this.model.add(this.modelCar);
		
		this.modelGun = new THREE.Mesh(
			s.geomCarGun,
			new THREE.MeshPhongMaterial( {color: 0x05e099} )
		)
		this.modelGun.position.y = -20;
		this.model.add(this.modelGun);	
		
		
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
		
		/** local spd for bullet */
		this.spdForBullet = {
			pXold: this.spdForBullet.pX,
			pZold: this.spdForBullet.pZ,
			pX: this.model.position.x,			
			pZ: this.model.position.z,
			x:this.spdForBullet.pXold - this.spdForBullet.pX,
			z:this.spdForBullet.pZold - this.spdForBullet.pZ, 	
		}			
		
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
 * Bot
 **************************************************/

class Bot {

	constructor () {
		
		/** params */
		this.lives = 3;
		this.state = 'none';
		this.isRemovable = false;
				
		/** geometry */
		this.geomConstY = [];	
		this.geomConstZ = [];	
		this.geomConstX = [];
		this.spdBoom = [];
		this.timerExplosion = 300;
		this.timerRemove = 200;
		
		this.geom = s.geomCar.clone();

		let geometry = new THREE.Geometry().fromBufferGeometry( this.geom );
		for (let vi = 0; vi< geometry.vertices.length; vi++ ){
			this.geomConstY.push( geometry.vertices[ vi ].y );   
			this.geomConstZ.push( geometry.vertices[ vi ].z ); 		
			this.geomConstX.push( geometry.vertices[ vi ].x );

			
			this.spdBoom.push( {
				x: Math.random()-0.5, 
				y: Math.random(),  
				z: Math.random()-0.5  				
			});	
		}					
		
		this.geom = geometry;
		this.mat = new THREE.MeshPhongMaterial( { 
			color: 0x05e099,
			transparent: true 			
		} ); 
		this.model = new THREE.Mesh( this.geom, this.mat );		
		
		/** position */	
		this.model.position.set( Math.random()*2000-1000, -22, Math.random()*2000-1000 );
		s.scene.add( this.model );

		this.kvadrant = checkKvadrant( this.model ); 		
	}
	
	
	render() {	
		
		if ( this.lives < 0 && this.state == "none" ) this.state ='explosive';
		if ( this.state == "afterExplosive") {
			this.timerRemove --;
			this.mat.opacity -= 0.005;
			//this.mat.needsUpdate = true;
		}	
		if ( this.timerRemove < 0 ) this.deleteObj();
		if ( this.state == 'explosive') this.animateExplosive(); 
	}
	
	
	animateExplosive() {
		
		if (this.timerExplosion < 0) this.state = 'afterExplosive'; 
		
		this.timerExplosion --;
			
		for ( var i = 0, l = this.geom.vertices.length; i < l; i += 3 ) {
			
			if ( this.geom.vertices[ i ].y > -10){
				this.spdBoom[i].y -= 0.008;			 
			}else{
				this.spdBoom[i].y = 0;
				
				let z = Math.sign( this.spdBoom[i].x );
				let v = Math.abs( this.spdBoom[i].x );
				if ( v > 0 ){ this.spdBoom[i].x = (v -0.01)*z }
				
				z = Math.sign( this.spdBoom[i].z );
				v = Math.abs( this.spdBoom[i].z );
				if ( v > 0 ){ this.spdBoom[i].z = (v -0.01)*z }
			}

			this.geom.vertices[ i ].x = this.geomConstX[i] += this.spdBoom[i].x;
			this.geom.vertices[ i ].y = this.geomConstY[i] += this.spdBoom[i].y;
			this.geom.vertices[ i ].z = this.geomConstZ[i] += this.spdBoom[i].z;
			this.geom.vertices[ i+1 ].x = this.geomConstX[i+1] += this.spdBoom[i].x;
			this.geom.vertices[ i+1 ].y = this.geomConstY[i+1] += this.spdBoom[i].y;
			this.geom.vertices[ i+1 ].z = this.geomConstZ[i+1] += this.spdBoom[i].z;	
			this.geom.vertices[ i+2 ].x = this.geomConstX[i+2] += this.spdBoom[i].x;
			this.geom.vertices[ i+2 ].y = this.geomConstY[i+2] += this.spdBoom[i].y;
			this.geom.vertices[ i+2 ].z = this.geomConstZ[i+2] += this.spdBoom[i].z;				
		}
		
		this.geom.verticesNeedUpdate = true;	
	}
	
	deleteObj() {
		s.scene.remove(this.model);
		this.mesh = null;
		this.geom = null;
		this.geomConstY = null;	
		this.geomConstZ = null;	
		this.geomConstX = null;
		this.spdBoom = null;

		this.isRemovable = true;	
	}

}	
 
 

/**************************************************;
 * Bullet
 **************************************************/

class Bullet{

	constructor ( car ) {
		
		g.arrBullets.push(this);
		
		this.isRemovable = false;
		this.id = Bullet.id ++;
		this.lifeTimer = 100;
		this.kvadrant = { x:0, z:0 };
		
		this.spd = 8.0;
		this.spdXCar = car.spdForBullet.x;
		this.spdZCar = car.spdForBullet.z;
		
		this.mesh = new THREE.Mesh (
			new THREE.SphereGeometry(2, 7, 7),
			new THREE.MeshBasicMaterial( {color: 0xffff88} )  	
		);
		
		let gun = car.modelGun; 
		this.mesh.setRotationFromQuaternion( gun.getWorldQuaternion() );
		this.mesh.position.set( gun.getWorldPosition().x, -5 ,gun.getWorldPosition().z );		
		this.mesh.translateZ(-10);		
		s.scene.add( this.mesh);
	}
	
	render () {
		
		this.mesh.translateZ(-this.spd);
		this.mesh.position.x -= this.spdXCar;
		this.mesh.position.z -= this.spdZCar;	
		this.mesh.position.y -= 0.2;
		
		this.kvadrant = checkKvadrant( this.mesh );
		
		this.lifeTimer--;
		if (this.lifeTimer<0){
			this.deleteObj();
		}			
	}
	
	deleteObj () {
		s.scene.remove( this.mesh );
		this.mesh = null;
		this.isRemovable = true;	
	}

}
Bullet.id = 0;	




/**************************************************;
 * COPE
 **************************************************/

class Cope {
	
	constructor ( car ) {
		
		/** params */
		this.car = car;
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
		s.composer.addPass( this.renderPass );			

		
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
	
	render( scene, cameras, vehicle, renderer ){
		
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

		/** shoot */
		if ( keys.space ){
			keys.space = false;
			let bullet = new Bullet( this.car );
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
		s.composer.addPass( this.renderPass );
		this.renderPass.enabled = false;	
		
	
		
		/** buttons */
		this.htmlElems = document.getElementById('heroElems');
		this.htmlElems.style.display = "none";		
	}
	
	render ( renderer, sc ) {
		
		if ( !this.isMove ) return;		

		/** check position near car and enter */
		this.kvadrant = checkKvadrant( this.cam );
		if( this.kvadrant.x == car.kvadrant.x && this.kvadrant.z == car.kvadrant.z ){
			buttEnterCope.style.opacity = 1.0;	
			if (keys.enter) enterCope();	
		}else{
			buttEnterCope.style.opacity = 0.0;	
		}

		/** move hero */
		if ( keys.left ) this.cam.rotation.y += 0.05;
		if ( keys.right ) this.cam.rotation.y -= 0.05;
		if ( keys.up ) this.cam.translateZ( -0.5);
		if ( keys.down ) this.cam.translateZ( 0.5);	
		if ( keys.A ) this.cam.translateX( -0.7);
		if ( keys.D ) this.cam.translateX( 0.7);				
	}
	
	hideView ( ) {
		this.htmlElems.style.display = "none";	
	
	}	
	
	showView ( p ) {
			
		hero.cam.position.set( p.x, -22, p.z );				
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
 * CHANGE VIEWS COPE/HERO  
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
 * CREATE THREE CANVAS
 **************************************************/
 
const initRenderer = () => { 
	
	s.renderer = new THREE.WebGLRenderer();
	s.renderer.setPixelRatio( window.devicePixelRatio );
	s.renderer.setSize( window.innerWidth, window.innerHeight);
	s.renderer.setClearColor(0xffffff);
	document.body.appendChild( s.renderer.domElement );

	s.composer = new THREE.EffectComposer( s.renderer );	

	s.simplePass = new THREE.ShaderPass(SimpleShader);	
	s.composer.addPass( s.simplePass );	
	s.simplePass.renderToScreen = true;	 
}
 
 
/**************************************************;
 * CREATE SCENE
 **************************************************/
 
const initScene = () => { 
	
	/** scene */	
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
	hero.render( s.renderer, s.scene );	
	 
	/** update cope */
	cope.render( s.scene, car.cameras, car, s.renderer );
	
	/** update bullets */
	g.arrBullets.forEach( (bullet, i, arr ) => {
		bullet.render();
		g.arrEnemies.forEach( ( bot, ib, arrB ) => {
			if ( bot.kvadrant.x == bullet.kvadrant.x && bot.kvadrant.z == bullet.kvadrant.z ){
				bullet.deleteObj();
				bot.lives --;
			}
		});		
		if ( bullet.isRemovable ){
			arr.splice( i, 1 );
			i--;
			bullet = null;
		}			
	});
	
	/** render bots */
	g.arrEnemies.forEach( (bot, i, arr) => {
		bot.render();
		if ( bot.isRemovable == true ){
			let md = bot;
			arr.splice( i, 1 );
			i--;
			bot = null;	
		}
	});	
	
	/** render */	
	s.composer.render();	
		
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
	enter: false,
	space: false
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
			break;	
		case 32:
			keys.space = down;				
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

let buttFire = document.getElementById('gunFire'); 
buttFire.onclick = () => {
	keys.space = true;
}




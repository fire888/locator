
"use strict";


 
/**************************************************;
 * SCENE
 **************************************************/
 
/** CAMERAS */ 
  
var views = [
	{ 	//gun
		left: 0.2,
		top: 0.05,
		width: 0.6,
		height: 0.3,
		background: new THREE.Color( 0.0, 0.1, 0.0 ),
		eye: [ 0, 0, 0 ],
		rotY: 0,
		up: [ 0, 1, 0 ],
		fov: 30,
		updateCamera: function ( camera, scene) {
			if (keys.A){
				camera.rotation.y += 0.01;
			}						
			if (keys.D){
				camera.rotation.y -= 0.01;
			}	
		}
	},
	{ 	//front
		left: 0.5-0.15,
		top: 0.4,
		width: 0.3,
		height: 0.25,
		background: new THREE.Color( 0.0, 0.1, 0.0 ),
		eye: [ 0, 0, -100 ],
		rotY: 0,
		up: [ 0, 1, 0 ],
		fov: 45,
		updateCamera: function ( camera, scene) {
		}
	},
	{ 	//left
		left: 0.02,
		top: 0.4,
		width: 0.3,
		height: 0.3,
		background: new THREE.Color( 0.0, 0.1, 0.0 ),
		eye: [ -30, 0, 0 ],
		rotY: Math.PI/2,
		up: [ 0, 1, 0 ],
		fov: 60,
		updateCamera: function ( camera, scene) {

		}
	},
	{ 	//right
		left: 0.68,
		top: 0.4,
		width: 0.3,
		height: 0.3,
		background: new THREE.Color( 0.0, 0.1, 0.0 ),
		eye: [ 30, 0, 0 ],
		rotY: -Math.PI/2,
		up: [ 0, 1, 0 ],
		fov: 60,
		updateCamera: function ( camera, scene) {
		}
	},
	{ 	//back
		left: 0.5-0.15,
		top: 0.68,
		width: 0.3,
		height: 0.25,
		background: new THREE.Color( 0.0, 0.1, 0.0 ),
		rotY: Math.PI,
		eye: [ 0, 0, 200 ],					
		up: [ 0, 1, 0 ],
		fov: 45,
		updateCamera: function ( camera, scene) {
		}
	}				
];
			

/** obj */			
const sc = {}; 
var clock = new THREE.Clock();


/** SCENE */
const initScene = () => { 
	
	/** SCENE */	
	const canvas = document.getElementById('canvas-webgl');
	sc.renderer = new THREE.WebGLRenderer({ canvas: canvas} );
	sc.renderer.setClearColor(0x00ffff);	
	sc.renderer.setPixelRatio( window.devicePixelRatio );
	sc.renderer.setSize(window.innerWidth, window.innerHeight);
	//sc.renderer.gammaInput = true;
	//sc.renderer.gammaOutput = true;

    sc.scene = new THREE.Scene();
	
	/** MAIN TRACTOR */
	sc.dummy = new THREE.Mesh(
		new THREE.BoxGeometry(10,10,10),
		new THREE.MeshPhongMaterial( { color: 0x00ff00 } )	
	)
	sc.scene.add(sc.dummy);
	sc.car = {
		spdMax: 5,
		spdBackMax: -3, 
		spd: 0,
		moveDirection: "none", 
		spdRot: 0,
		gunSpdRot: 0,
	}		
	
	for (let ii =  0; ii < views.length; ++ii ) {
		var view = views[ii];
		var camera = new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.fromArray( view.eye );
		camera.rotation.y = view.rotY;
		camera.up.fromArray( view.up );
		view.camera = camera;
		sc.dummy.add(view.camera);
	}
	
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
	
}



/**************************************************;
 * ANIMATION SCENE
 **************************************************/
  
const animate = () => {
	
	moveCar();
	
	/** update cameras */
	for ( var ii = 0; ii < views.length; ++ii ) {

		var view = views[ii];
		var camera = view.camera;

		view.updateCamera( camera, sc.scene );

		var left   = Math.floor( window.innerWidth  * view.left );
		var top    = Math.floor( window.innerHeight * view.top );
		var width  = Math.floor( window.innerWidth  * view.width );
		var height = Math.floor( window.innerHeight * view.height );

		sc.renderer.setViewport( left, top, width, height );
		sc.renderer.setScissor( left, top, width, height );
		sc.renderer.setScissorTest( true );
		sc.renderer.setClearColor( view.background );

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		sc.renderer.render( sc.scene, camera);

	}
	
	/** update elements */
	sc.wireframe.rotation.y += 0.01;
	sc.wireframe.rotation.x += 0.01;
	
	if (sc.mesh){
		sc.mesh.rotation.y += 0.01;
	}

	/** animate */
	requestAnimationFrame( animate );	
}


const moveCar = () => {
		
	/** turn left */
	if ( keys.left ){
		if ( sc.car.spdRot < 0.01) sc.car.spdRot += 0.0001;
				
	}
	
	/** turn right */
	if ( keys.right ){
		if ( sc.car.spdRot >  -0.01) sc.car.spdRot -= 0.0001;
	}
	
	if (Math.abs(sc.car.spdRot) < 0.0001)
			sc.car.spdRot = 0;
	
	/** move car forward */ 
	if (keys.up){
		sc.car.spd < sc.car.spdMax ? sc.car.spd += 0.03 : sc.car.spd = sc.car.spdMax ; 
		sc.dummy.translateZ( -sc.car.spd );			
		if (sc.car.spd > 0 ){
			sc.dummy.rotateOnAxis( new THREE.Vector3(0,1,0), sc.car.spdRot * Math.abs(sc.car.spd) );
		} else {
			sc.dummy.rotateOnAxis( new THREE.Vector3(0,1,0), -sc.car.spdRot * Math.abs(sc.car.spd) );		
		}			
	} else { 
		if (sc.car.spd > 0 && !keys.down ) {
			sc.car.spd -= 0.01;			
			sc.dummy.translateZ( -sc.car.spd );
			sc.dummy.rotateOnAxis( new THREE.Vector3(0,1,0), sc.car.spdRot * Math.abs(sc.car.spd) );			

		}
	}					

	/** move car back */
	if (keys.down){
		if (sc.car.spd > 0 ){	
			sc.car.spd -= 0.06; 
			sc.dummy.translateZ( -sc.car.spd );
			sc.dummy.rotateOnAxis( new THREE.Vector3(0,1,0), sc.car.spdRot * Math.abs(sc.car.spd) );			
		}else{
			if ( sc.car.spd > sc.car.spdBackMax ){
				sc.car.spd -= 0.03;
			}else{
				sc.car.spd = sc.car.spdBackMax; 				
			}
			sc.dummy.translateZ( -sc.car.spd );				
			sc.dummy.rotateOnAxis( new THREE.Vector3(0,1,0), -sc.car.spdRot * Math.abs(sc.car.spd) );				
		}			
	} else {
		if ( sc.car.spd < 0 && !keys.up ){
			sc.dummy.translateZ( -sc.car.spd );
			sc.dummy.rotateOnAxis( new THREE.Vector3(0,1,0), -sc.car.spdRot * Math.abs(sc.car.spd) );			
			sc.car.spd += 0.01 			
		}		
	}		
}



/**************************************************;
 * resize scene
 **************************************************/

const handleWindowResize = () => {
	sc.renderer.setSize(window.innerWidth, window.innerHeight);
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



/**************************************************;
 * Init SCENE
 **************************************************/

initScene();
animate();





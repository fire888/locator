/**************************************************;
 * FUNCTIONS FOR SCENE OBJECTS 
 **************************************************/ 

const checkKvadrant = obj => {
	
	return ( { 
		x: Math.floor( obj.position.x / 30 ),
		z: Math.floor( obj.position.z / 30 )	 
	} )
}

const prepearGeometryToExploisive = ob => {
		
	let gObject = {
		constY: [],	
		constZ: [],	
		constX: [],
		spdBoom: [],
		geom: ob 			
	}

	let geometry = new THREE.Geometry().fromBufferGeometry( gObject.geom )
		
	for ( let vi = 0; vi < geometry.vertices.length; vi ++ ) {
			
		gObject.constY.push( geometry.vertices[ vi ].y )   
		gObject.constZ.push( geometry.vertices[ vi ].z ) 		
		gObject.constX.push( geometry.vertices[ vi ].x )

		gObject.spdBoom.push( {
			x: Math.random() - 0.5, 
			y: Math.random(),  
			z: Math.random() - 0.5  				
		} )	
	}	
	
	gObject.geom = geometry 
		
	return gObject	
}

const geomAnimateExplosive = b => {
	
	let { spdBoom, geom, constX, constY, constZ } = b
	
	for ( let i = 0, l = geom.vertices.length; i < l; i += 3 ) {
			
		if ( geom.vertices[ i ].y > -10 ) {
			
			spdBoom[ i ].y -= 0.008
			
		} else {
			
			b.spdBoom[ i ].y = 0
				
			let z = Math.sign( spdBoom[ i ].x )
			let v = Math.abs( spdBoom[ i ].x )
			if ( v > 0 ) spdBoom[ i ].x = ( v - 0.01 ) * z 
				
			z = Math.sign( spdBoom[ i ].z )
			v = Math.abs( spdBoom[ i ].z )
			if ( v > 0 ) spdBoom[ i ].z = ( v - 0.01 ) * z
		}

		geom.vertices[ i ].x = constX[ i ] += spdBoom[ i ].x
		geom.vertices[ i ].y = constY[ i ] += spdBoom[ i ].y
		geom.vertices[ i ].z = constZ[ i ] += spdBoom[ i ].z
		geom.vertices[ i+1 ].x = constX[ i+1 ] += spdBoom[ i ].x
		geom.vertices[ i+1 ].y = constY[ i+1 ] += spdBoom[ i ].y
		geom.vertices[ i+1 ].z = constZ[ i+1 ] += spdBoom[ i ].z	
		geom.vertices[ i+2 ].x = constX[ i+2 ] += spdBoom[ i ].x
		geom.vertices[ i+2 ].y = constY[ i+2 ] += spdBoom[ i ].y
		geom.vertices[ i+2 ].z = constZ[ i+2 ] += spdBoom[ i ].z				
	}
		
	geom.verticesNeedUpdate = true
}

const createNoiseTexture = ( w, h ) => {
	
	const pixelData = []
	for ( let y = 0; y < w; ++y ) {
		for ( let x = 0; x < h; ++x ) {
			const a = Math.floor( Math.random() * 256 )
			pixelData.push( a, a, a, 1 )
		}
	}
	const dataTexture = new THREE.DataTexture(
		Uint8Array.from( pixelData ),
		w,
		h,
		THREE.RGBAFormat,
		THREE.UnsignedByteType,
		THREE.UVMapping
	)
	dataTexture.needsUpdate = true

	return dataTexture
}
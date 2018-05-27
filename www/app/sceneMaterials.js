THREE.AdditiveBlendingShader = {
  uniforms: {
    tDiffuse: { value:null },
    tAdd: { value:null }
  },

  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
  ].join('\n'),

  fragmentShader: [
    'uniform sampler2D tDiffuse;',
    'uniform sampler2D tAdd;',
    'varying vec2 vUv;',
    'void main() {',
      'vec4 color = texture2D( tDiffuse, vUv );',
      'vec4 add = texture2D( tAdd, vUv );',
      'gl_FragColor = color + add;',
    '}'
  ].join('\n')
};



SimpleShader = {
  uniforms: {
    'tDiffuse': { value: null },
	  'amountFlash': { value: 0.0 }
  },
  vertexShader: [
    'varying vec2 vUv;',
     'void main() {',
       'vUv = uv;',
       'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
     '}'
  ].join( '\n' ),
  fragmentShader: [
    'uniform sampler2D tDiffuse;',
	  'uniform float amountFlash;',
    'varying vec2 vUv;',
    'void main(){',
      'vec2 uv = vUv;',
	    'vec4 txtIsh = texture2D(tDiffuse, uv);',
      
	    'vec4 invert = vec4(txtIsh.y*amountFlash*6.0,txtIsh.y*amountFlash*6.0,txtIsh.y*amountFlash*6.0, 0.0);', 
	  
      'gl_FragColor = vec4(txtIsh.x  + amountFlash, txtIsh.y + amountFlash, txtIsh.z, 1.0)-invert;',
    '}'
 ].join( '\n' )
}




/**************************************************;
 * COPE SCREENS SHADER
 **************************************************/

const NoiseShader = {
	
	uniforms: {
		
		iTime: { value: 0.1 },
		amountNoise: { value: 0.5 },
		render: { value: null },
	},
	
	vertexShader: [
	
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'), 
	
	fragmentShader: [  
	
		// Gold Noise ©2017-2018 dcerisano@standard3d.com
		// - based on the Golden Ratio, PI and the Square Root of Two
		// - fastest noise generator function
		// - works with all chipsets (including low precision)

		'precision lowp  float;',
		
		'varying vec2 vUv;',
		'uniform float iTime;',
		'uniform sampler2D render;',
		'uniform float amountNoise;',	
		'uniform float amountFlash;',
		
		'float PHI = 1.61803398874989484820459 * 00000.1;', // Golden Ratio   
		'float PI  = 3.14159265358979323846264 * 00000.1;', // PI
		'float SQ2 = 1.41421356237309504880169 * 10000.0;', // Square Root of Two

		'float gold_noise(in vec2 coordinate, in float seed){',
			'return fract(sin(dot(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);',
		'}',
		
		'void main(){',   
			'vec2 uv = vUv;',
			'vec4 renderTex = texture2D( render, uv );',
			
			'float n = gold_noise(uv, iTime);',
			'vec4 colorNoise =  vec4( 0.0, n * 0.2  + amountNoise, 0.0,  1.0);',
			
			
			'gl_FragColor  = colorNoise + renderTex;',
		'}'
	].join('\n')
}	

THREE.AdditiveBlendingShader = {
  uniforms: {
    tDiffuse: { value:null },
    tAdd: { value:null }
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "uniform sampler2D tDiffuse;",
    "uniform sampler2D tAdd;",
    "varying vec2 vUv;",
    "void main() {",
      "vec4 color = texture2D( tDiffuse, vUv );",
      "vec4 add = texture2D( tAdd, vUv );",
      "gl_FragColor = color + add;",
    "}"
  ].join("\n")
};



SimpleShader = {
  uniforms: {
    "tDiffuse": { value: null },
	"amountFlash": { value: 0.0 }
  },
  vertexShader: [
    "varying vec2 vUv;",
     "void main() {",
       "vUv = uv;",
       "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
     "}"
  ].join( "\n" ),
  fragmentShader: [
    "uniform sampler2D tDiffuse;",
	"uniform float amountFlash;",
    "varying vec2 vUv;",
    "void main(){",
      "vec2 uv = vUv;",
	  'vec4 txtIsh = texture2D(tDiffuse, uv);',	
      "gl_FragColor = vec4(txtIsh.x  + amountFlash, txtIsh.y + amountFlash, txtIsh.z, 1.0);",
    "}"
 ].join( "\n" )
}




const matShaderFloor = {
  uniforms: {
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n"),

  fragmentShader: [
    "varying vec2 vUv;",
	
	'float box(in vec2 st, in vec2 size) {',
		'size = vec2(0.5) - size * 0.5;',
		'vec2 uv = smoothstep(size,size + vec2(0.001),st);',
		'uv *= smoothstep(size,size + vec2(0.001),vec2(1.0) - st);',
		'return uv.x * uv.y;',
	'}',

	'float cros(in vec2 st, float size) {',
		'return  box(st, vec2(size,size/4.0)) + box(st, vec2(size / 4.0,size));',
    '}',	
	
    "void main() {",
	  'vec2 uv = vUv*200.0;',
	  'uv = fract(uv);',
	  'vec3 color = vec3(cros(uv,0.25));',
      "gl_FragColor = vec4(0.0, color.x*0.6, 0.0, 1.0);",
    "}"
  ].join("\n")
};

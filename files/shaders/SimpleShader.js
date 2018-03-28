SimpleShader = {
        uniforms: {
            "tDiffuse": { value: null },
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
            "varying vec2 vUv;",


"void main(  )",
"{",
    
   " vec2 uv = vUv;",        
    "gl_FragColor = texture2D(tDiffuse, uv);",
	
"}"
        ].join( "\n" )
    }
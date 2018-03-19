THREE.GlitchShader = {
	uniforms: {
		'iTime': {  type: 'f', value: null},
		'status': { value: null },
		'tExplosion' : { type: 't', value: null },	
		'resolution' : { type: 'v2', value: null },
		'tDiffuse': { type: 't', value: null }		
	},
	vertexShader: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join( '\n' ),	
	fragmentShader: [

'#ifdef GL_ES',
'precision mediump float;',
'#endif',

'uniform sampler2D tDiffuse;',
'uniform vec3 diffuse;',
'uniform float iTime;',
'uniform sampler2D tExplosion;',
'uniform vec2 resolution;',
'varying vec2 vUv;',

/** voronoi */ 
'vec2 hash2( vec2 p )',
'{',
    // procedural white noise
  'return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);',
'}',

'vec3 voronoi( in vec2 x )',
'{',
    'vec2 n = floor(x);',
    'vec2 f = fract(x);',

    //----------------------------------
    // first pass: regular voronoi
    //----------------------------------
  'vec2 mg, mr;',

    'float md = 8.0;',
    'for( int j=-1; j<=1; j++ )',
    'for( int i=-1; i<=1; i++ )',
    '{',
        'vec2 g = vec2(float(i),float(j));',
        'vec2 o = hash2( n + g );',
        'vec2 r = g + o - f;',
        'float d = dot(r,r);',

        'if( d<md )',
        '{',
            'md = d;',
            'mr = r;',
            'mg = g;',
        '}',
    '}',

    //----------------------------------
    // second pass: distance to borders
    //----------------------------------
    'md = 8.0;',
    'for( int j=-2; j<=2; j++ )',
    'for( int i=-2; i<=2; i++ )',
    '{',
        'vec2 g = mg + vec2(float(i),float(j));',
        'vec2 o = hash2( n + g );',
        'vec2 r = g + o - f;',

        'if( dot(mr-r,mr-r)>0.00001 )',
        'md = min( md, dot( 0.5*(mr+r), normalize(r-mr) ) );',
    '}',

    'return vec3( md, mr );',
'}',

/** GLITCH */
'#define PI 3.141592',

'float random(vec2 p){',
    'float q = dot(p,vec2(127.1,311.7));',
    'return fract(sin(q)*437.53);',
'}',
'vec4 glitch(vec2 p){',
    'float b=0.5;',
    'vec4 c=texture2D(tExplosion,p);',
   'float t=iTime-mod(iTime,0.7);//iTime-mod(iTime,0.3);',
    'vec2 q=p-mod(p,b);',
    'for(float i=0.0;i<15.0;i++){',
       'if(random(q)>0.3){',
           'q=p-mod(p,b);',
       '}else{',
           'break;',
       '}',
        'b*=random(vec2(mod(iTime,1.5)))<0.3?1.0:clamp(sin(t/10.0-5.5),0.65-random(vec2(t/10.0-5.5)),0.65+random(vec2(t/10.0-5.5)));',
      // b*=0.65;
    '}',
    
    'c.a-=0.0;',//random(vec2(mod(iTime,1.5)))<0.3?0.0:0.3*random(q);
    'c.rgb+=random(vec2(mod(iTime,1.5)))<0.3?vec3(0.0):vec3(random(q)*2.0,0.2,random(vec2(q.y,q.x))*2.0-1.0);',
    'c.rgb-=random(vec2(mod(iTime,1.5)))<0.3 && random(q)<0.01 ? vec3(0.0):texture2D(tExplosion,p+vec2(random(q)*2.0-1.0,0.0)).rgb;',
    'c.xyz-=random(vec2(mod(iTime,1.5)))<0.3?vec3(0.0):vec3(0.3*random(vec2(0.0,p.y+iTime/10.0)));',
    'c.xyz-=random(vec2(0.0,p.y-iTime/5.0-mod(p.y-iTime/5.0,0.02)))>0.9?texture2D(tExplosion,p+vec2(0.0,random(q))).rgb:vec3(0.0);',
    'c.rgb*=texture2D(tExplosion,p-vec2(sin(p.y*50.0)/5.0*sin(iTime*3.0*p.y),-iTime/10.0)).rgb;',
    'return c;',
'}',

//'void main(){',

	/** voronoi */ 
	//'vec3 borderColor = vec3(0.5, 0.0, 0.0);',
	//'vec3 color = vec3(0.8, 0.7, 0.7);',
	//'float borderWidth = 30.0;',	
	//'float blur = 3.0;',
	//'float amount = 3.7;',
	
	//'vec3 c = voronoi( 8.0*(vUv*vec2(amount)) );',
	// borders
	//'vec3 col = mix( borderColor, color, smoothstep( borderWidth/100.0, (borderWidth/100.0)+(blur/100.0), c.x ) );',
	
		
	/** glitch */
    //'vec2 p = vec2(vUv.x, 1.0 - vUv.y);',	
    //'vec4 colorGlitch=glitch(p);',	
	//'float opasity = 1.0;',
	
	//'vec3 outPut =  vec3(colorGlitch.xyz)*2.5;', 

	
	//'gl_FragColor = texture2D( tDiffuse, vUv ) * vec4(outPut, 0.1);',
	
	
	

//--------------------------------------------------------
// inspired by and copied from iq:
// https://www.shadertoy.com/view/Xd2GR3

'#define TWO_PI 6.283185',

'vec3 iq_color_palette(vec3 a, vec3 b, vec3 c, vec3 d, float t)',
'{',
    'return a + b * cos(TWO_PI * (c*t + d));',
'}',

// copied from iq
// { 2d cell id, distance to border, distance to center )
'vec4 hexagon( vec2 p )', 
'{',
	'vec2 q = vec2( p.x*2.0*0.5773503, p.y + p.x*0.5773503 );',
	
	'vec2 pi = floor(q);',
	'vec2 pf = fract(q);',

	'float v = mod(pi.x + pi.y, 3.0);',

	'float ca = step(1.0,v);',
	'float cb = step(2.0,v);',
	'vec2  ma = step(pf.xy,pf.yx);',
	
    // distance to borders
	'float e = dot( ma, 1.0-pf.yx + ca*(pf.x+pf.y-1.0) + cb*(pf.yx-2.0*pf.xy) );',

	// distance to center	
	'p = vec2( q.x + floor(0.5+p.y/1.5), 4.0*p.y/3.0 )*0.5 + 0.5;',
	'float f = length( (fract(p) - 0.5)*vec2(1.0,0.85) );',		
	
	'return vec4( pi + ca - cb*ma, e, f );',
'}',

// copied from iq
'float hash1( vec2  p ) {', 
	'float n = dot(p,vec2(127.1,311.7) );',
	'return fract(sin(n)*43758.5453);',
'}',

// copied from iq
'float noise( in vec3 x )',
'{',
    'vec3 p = floor(x);',
    'vec3 f = fract(x);',
	'f = f*f*(3.0-2.0*f);',
	'vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;',
	'vec2 rg = vec2(0.5, 0.5);',
	'return mix( rg.x, rg.y, f.z );',
'}',


'void main()', 
'{',
	/** GLITCH */	
	'vec3 borderColor = vec3(0.5, 0.0, 0.0);',
	'vec3 color = vec3(0.8, 0.7, 0.7);',
	'float borderWidth = 30.0;',	
	'float blur = 3.0;',
	'float amount = 3.7;',
	
	'vec3 c = voronoi( 8.0*(vUv*vec2(amount)) );',
	
		
	/** glitch */
    'vec2 p = vec2(vUv.x, 1.0 - vUv.y);',	
    'vec4 colorGlitch=glitch(p) - 0.3;',	
 	


	/** CHEIKER */
    'vec2 uv = vUv;',
	'vec2 pos = vUv;',
	
   
	'pos *= 5.2;',    
    'vec4 h = vec4(0.);',
    'float n = 0.;',
    'vec3 col = vec3(0.);',

	'h = hexagon(12.0*pos);',
    'float t = 1.5 - iTime*0.12;',

	'vec4 imageBack  = texture2D( tDiffuse, vUv );', 	
	'col += vec3(1.);',
	'col *= smoothstep( 0.0+t, 0.1+t, h.z );',
    'vec3 imageBackOut = col * vec3(imageBack.x, imageBack.y, imageBack.z );',
	
	/** glitch */
	'col = vec3(1.0)-col;',
	'vec3 glitchOut = col*colorGlitch.xyz;',
	
	/** render */
	'gl_FragColor = vec4( imageBackOut, 1.0) + vec4( glitchOut, 1.0);',	
'}'].join( "\n" )
};
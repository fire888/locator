myEffect2 = {
        uniforms: {
            "tDiffuse": { value: null },
            "amount":   { value: 1.0 },
			"iTime": { type: "f", value: 0.01 }
        },
        vertexShader: [
            "varying vec2 vUv;",
            "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join( "\n" ),
        fragmentShader: [
			"uniform float iTime;",
            "uniform float amount;",
            "uniform sampler2D tDiffuse;",
            "varying vec2 vUv;",

			"#define M_PI 3.14159265358979323846",

			"const float kCharBlank = 12.0;",
			"const float kCharMinus = 11.0;",
			"const float kCharDecimalPoint = 10.0;",

			"#ifndef BITMAP_VERSION",

			"float InRect(const in vec2 vUV, const in vec4 vRect)",
			"{",
				"vec2 vTestMin = step(vRect.xy, vUv.xy);",
				"vec2 vTestMax = step(vUv.xy, vRect.zw);",	
				"vec2 vTest = vTestMin * vTestMax;",
				"return vTest.x * vTest.y;",
			"}",

			"float SampleDigit(const in float fDigit, const in vec2 vUv)",
			"{",
				"const float x0 = 0.0 / 4.0;",
				"const float x1 = 1.0 / 4.0;",
				"const float x2 = 2.0 / 4.0;",
				"const float x3 = 3.0 / 4.0;",
				"const float x4 = 4.0 / 4.0;",
	
				"const float y0 = 0.0 / 5.0;",
				"const float y1 = 1.0 / 5.0;",
				"const float y2 = 2.0 / 5.0;",
				"const float y3 = 3.0 / 5.0;",
				"const float y4 = 4.0 / 5.0;",
				"const float y5 = 5.0 / 5.0;",

				// In this version each digit is made of up to 3 rectangles which we XOR together to get the result
	
				"vec4 vRect0 = vec4(0.0);",
				"vec4 vRect1 = vec4(0.0);",
				"vec4 vRect2 = vec4(0.0);",
		
				"if(fDigit < 0.5) // 0",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x1, y1, x2, y4);",
				"}",
				"else if(fDigit < 1.5) // 1",
				"{",
					"vRect0 = vec4(x1, y0, x2, y5); vRect1 = vec4(x0, y0, x0, y0);",
				"}",
				"else if(fDigit < 2.5) // 2",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x0, y3, x2, y4); vRect2 = vec4(x1, y1, x3, y2);",
				"}",
				"else if(fDigit < 3.5) // 3",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x0, y3, x2, y4); vRect2 = vec4(x0, y1, x2, y2);",
				"}",
				"else if(fDigit < 4.5) // 4",
				"{",
					"vRect0 = vec4(x0, y1, x2, y5); vRect1 = vec4(x1, y2, x2, y5); vRect2 = vec4(x2, y0, x3, y3);",
				"}",
				"else if(fDigit < 5.5) // 5",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x1, y3, x3, y4); vRect2 = vec4(x0, y1, x2, y2);",
				"}",
				"else if(fDigit < 6.5) // 6",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x1, y3, x3, y4); vRect2 = vec4(x1, y1, x2, y2);",
				"}",
				"else if(fDigit < 7.5) // 7",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x0, y0, x2, y4);",
				"}",
				"else if(fDigit < 8.5) // 8",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x1, y1, x2, y2); vRect2 = vec4(x1, y3, x2, y4);",
				"}",
				"else if(fDigit < 9.5) // 9",
				"{",
					"vRect0 = vec4(x0, y0, x3, y5); vRect1 = vec4(x1, y3, x2, y4); vRect2 = vec4(x0, y1, x2, y2);",
				"}",
				"else if(fDigit < 10.5) // '.'",
				"{",
					"vRect0 = vec4(x1, y0, x2, y1);",
				"}",
				"else if(fDigit < 11.5) // '-'",
				"{",
					"vRect0 = vec4(x0, y2, x3, y3);",
				"}",	
	
				"float fResult = InRect(vUv, vRect0) + InRect(vUv, vRect1) + InRect(vUv, vRect2);",
	
				"return mod(fResult, 2.0);",
			"}",

			"#else",

			"float SampleDigit(const in float fDigit, const in vec2 vUv)",
			"{",		
				"if(vUv.x < 0.0) return 0.0;",
				"if(vUv.y < 0.0) return 0.0;",
				"if(vUv.x >= 1.0) return 0.0;",
				"if(vUv.y >= 1.0) return 0.0;",
	
				// In this version, each digit is made up of a 4x5 array of bits
	
				"float fDigitBinary = 0.0;",
	
				"if(fDigit < 0.5) // 0",
				"{",
					"fDigitBinary = 7.0 + 5.0 * 16.0 + 5.0 * 256.0 + 5.0 * 4096.0 + 7.0 * 65536.0;",
				"}",
				"else if(fDigit < 1.5) // 1",
				"{",
					"fDigitBinary = 2.0 + 2.0 * 16.0 + 2.0 * 256.0 + 2.0 * 4096.0 + 2.0 * 65536.0;",
	"}",
	"else if(fDigit < 2.5) // 2",
	"{",
		"fDigitBinary = 7.0 + 1.0 * 16.0 + 7.0 * 256.0 + 4.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 3.5) // 3",
	"{",
		"fDigitBinary = 7.0 + 4.0 * 16.0 + 7.0 * 256.0 + 4.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 4.5) // 4",
	"{",
		"fDigitBinary = 4.0 + 7.0 * 16.0 + 5.0 * 256.0 + 1.0 * 4096.0 + 1.0 * 65536.0;",
	"}",
	"else if(fDigit < 5.5) // 5",
	"{",
		"fDigitBinary = 7.0 + 4.0 * 16.0 + 7.0 * 256.0 + 1.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 6.5) // 6",
	"{",
		"fDigitBinary = 7.0 + 5.0 * 16.0 + 7.0 * 256.0 + 1.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 7.5) // 7",
	"{",
		"fDigitBinary = 4.0 + 4.0 * 16.0 + 4.0 * 256.0 + 4.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 8.5) // 8",
	"{",
		"fDigitBinary = 7.0 + 5.0 * 16.0 + 7.0 * 256.0 + 5.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 9.5) // 9",
	"{",
		"fDigitBinary = 7.0 + 4.0 * 16.0 + 7.0 * 256.0 + 5.0 * 4096.0 + 7.0 * 65536.0;",
	"}",
	"else if(fDigit < 10.5) // '.'",
	"{",
		"fDigitBinary = 2.0 + 0.0 * 16.0 + 0.0 * 256.0 + 0.0 * 4096.0 + 0.0 * 65536.0;",
	"}",
	"else if(fDigit < 11.5) // '-'",
	"{",
		"fDigitBinary = 0.0 + 0.0 * 16.0 + 7.0 * 256.0 + 0.0 * 4096.0 + 0.0 * 65536.0;",
	"}",
	
	"vec2 vPixel = floor(vUv * vec2(4.0, 5.0));",
	"float fIndex = vPixel.x + (vPixel.y * 4.0);",
	
	"return mod(floor(fDigitBinary / pow(2.0, fIndex)), 2.0);",
"}",

"#endif",

"float PrintValue(const in vec2 vStringCharCoords, const in float fValue, const in float fMaxDigits, const in float fDecimalPlaces)",
"{",
	"float fAbsValue = abs(fValue);",
	
	"float fStringCharIndex = floor(vStringCharCoords.x);",
	
	"float fLog10Value = log2(fAbsValue) / log2(10.0);",
	"float fBiggestDigitIndex = max(floor(fLog10Value), 0.0);",
	
	// This is the character we are going to display for this pixel
	"float fDigitCharacter = kCharBlank;",
	
	"float fDigitIndex = fMaxDigits - fStringCharIndex;",
	"if(fDigitIndex > (-fDecimalPlaces - 1.5))",
	"{",
		"if(fDigitIndex > fBiggestDigitIndex)",
		"{",
			"if(fValue < 0.0)",
			"{",
				"if(fDigitIndex < (fBiggestDigitIndex+1.5))",
				"{",
					"fDigitCharacter = kCharMinus;",
				"}",
			"}",
		"}",
		"else",
		"{",		
			"if(fDigitIndex == -1.0)",
			"{",
				"if(fDecimalPlaces > 0.0)",
				"{",
					"fDigitCharacter = kCharDecimalPoint;",
				"}",
			"}",
			"else",
			"{",
				"if(fDigitIndex < 0.0)",
				"{",
					// move along one to account for .
					"fDigitIndex += 1.0;",
				"}",

				"float fDigitValue = (fAbsValue / (pow(10.0, fDigitIndex)));",

				// This is inaccurate - I think because I treat each digit independently
				// The value 2.0 gets printed as 2.09 :/
				//fDigitCharacter = mod(floor(fDigitValue), 10.0);
				"fDigitCharacter = mod(floor(0.0001+fDigitValue), 10.0); // fix from iq",
			"}",		
		"}",
	"}",

	"vec2 vCharPos = vec2(fract(vStringCharCoords.x), vStringCharCoords.y);",

	"return SampleDigit(fDigitCharacter, vCharPos);",	
"}",

"float PrintValue(in vec2 fragCoord, const in vec2 vPixelCoords, const in vec2 vFontSize, const in float fValue, const in float fMaxDigits, const in float fDecimalPlaces)",
"{",
	"return PrintValue((fragCoord.xy - vPixelCoords) / vFontSize, fValue, fMaxDigits, fDecimalPlaces);",
"}",

"float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}",
"float rand (vec2 co, float l) {return rand(vec2(rand(co), l));}",
"float rand (vec2 co, float l, float t) {return rand(vec2(rand(co, l), t));}",


"void main(  )",
"{",
    //properties
   " float noise_intensity = 0.2;",
   " float flickering = 0.1;",
   " float bar_freq = 100.0;",
   " float color_intensity = 0.1;",
    
    // Normalized pixel coordinates (from 0 to 1)
   " vec2 uv = vUv;",
   " float val = rand(vec2(iTime, iTime)) * flickering + flickering;",
   " float sin_val = 1.2 - ((sin(uv.y*bar_freq) + 1.0 ) / 3.0 * val * 2.0);",
   " vec4 color = vec4(1.0 - length(vec2(1, 0) - uv)*0.5,length(vec2(1, 0) - uv), 1, 1);",
   " float noise = rand(uv * iTime) * noise_intensity + (1.0 - noise_intensity);",
   " vec4 out_image = texture2D(tDiffuse, uv);",
    "float r = texture2D(tDiffuse, uv).r*1.0-0.3;; // + vec2(0.002, 0)).r*1.1-0.3;",
    "float g = texture2D(tDiffuse, uv).g*1.0-0.3; // + vec2(-0.002, 0)).g*1.0-0.3;",
    "float b = texture2D(tDiffuse, uv).b*0.9-0.3;// + vec2(0.0, 0.0)).b*0.9-0.3;",
    
    "out_image = vec4(r, g, b, 1.0);",
        
    "gl_FragColor = mix(out_image * sin_val, color, color_intensity) * noise*0.9 - vec4(0.05, 0.05, 0.0, 0.0);",
	
"}"
        ].join( "\n" )
    }
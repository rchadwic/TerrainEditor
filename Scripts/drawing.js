/*
Copyright 2012 Rob Chadwick (rchadwic@gmail.com)
This work is licensed under a Creative Commons 
Attribution-NonCommercial-ShareAlike 3.0 Unported License.
http://creativecommons.org/licenses/by-nc-sa/3.0/
*/




function BuildDrawBufferCamera() {

    var  togglecam = new toggleRTTCam();
    WebGL.DrawBufferCam = togglecam;
    WebGL.DrawBufferTexture = togglecam.texA;
    
    var quad =  osg.createTexuredQuad(-1,-1,0,
            2, 0 ,0,
            0, 2,0);
	togglecam.registerStateSetTexture(quad.getOrCreateStateSet(),0);
    
    quad.getOrCreateStateSet().setAttribute(GetDrawingShader());
    quad.getOrCreateStateSet().addUniform(WebGL.gPaintPositionUniform);
    quad.getOrCreateStateSet().addUniform(WebGL.gTimeUniform);
    
    WebGL.DrawBufferCam.addChild(quad);

    
}


function BuildTextureBufferCamera() {

    var togglecam = new toggleRTTCam();

    WebGL.DrawTextureBufferCam = togglecam;
    WebGL.DrawTextureBufferTexture = togglecam.texA;
    
    var quad =  osg.createTexuredQuad(-1,-1,0,
            2, 0 ,0,
            0, 2,0);
    quad.getOrCreateStateSet().setAttribute(GetTextureDrawingShader());
    
    WebGL.DrawTextureBufferCam.registerStateSetTexture(quad.getOrCreateStateSet(),0);

    quad.getOrCreateStateSet().addUniform(WebGL.gPaintPositionUniform);
    quad.getOrCreateStateSet().addUniform(WebGL.gTimeUniform);
    
    WebGL.TexturePaintChoice = osg.Uniform.createFloat4([1.0,0.0,0.0,0.0],"TexturePaintChoice");
    quad.getOrCreateStateSet().addUniform(WebGL.TexturePaintChoice);
    WebGL.DrawTextureBufferCam.addChild(quad);
    //document.getElementById('HeightmapPreview').appendChild(draw_rttTexture.image); 
}
function GetDrawingShader() {

    var vertshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "attribute vec3 Vertex;",
	   
	    "attribute vec2 TexCoord0;",
	   
	    
	    "varying vec2 oTC0;",
	    
	    
	    "vec4 ftransform() {",
	    "return vec4(Vertex, 1.0);",
	    "}",
	    "",
	    "void main() {",
	    "gl_Position = ftransform();",
	   
	    "oTC0 = TexCoord0;",
	   
	    "}" ].join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	   
	    "varying vec2 oTC0;",
	    "uniform sampler2D texture;",
	    "uniform sampler2D pickmap;",
	    "uniform vec4 PaintPosition;",
	    "uniform vec4 PaintOptions;",
	    "uniform float FrameTime;",
	    "uniform int time;",
	    "  vec4 SRGB_to_Linear(vec4 incolor)",
		  "  {",
		  "   ",
		  "     float dist = length(incolor);",
		  "     if(dist > .04045)",
		  "  	dist = pow((dist + .055)/1.055 ,2.4);",
		  "     else",
		  "  	dist = dist/12.92;",
		  "     incolor= normalize(incolor)*dist;   ",
		  "     return incolor;",
		  "  }",
		  
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(255.0*255.0*255.0), 1.0/(255.0*255.0), 1.0/255.0, 1.0);",
	    "  return(dot(value, bitSh));", "}", 
	    "vec4 packFloatToVec4i(const float value)",
	    "{",
	    "  const vec4 bitSh = vec4(255.0*255.0*255.0, 255.0*255.0, 255.0, 1.0);",
	    "  const vec4 bitMsk = vec4(0.0, 1.0/255.0, 1.0/255.0, 1.0/255.0);",
	    "  vec4 res = fract(value * bitSh);",
	    "  res -= res.xxyz * bitMsk;",
	    "  return res;",
	    "}",
	    "void main() {",
	    "float stregnth = 60.0 * PaintPosition[3] * FrameTime;",
	    "vec2 PaintPos = texture2D(pickmap,PaintPosition.xy).xy;",
	    "PaintPos.y = 1.0- PaintPos.y;",
	    "gl_FragColor = texture2D(texture,oTC0); ",
	    "if(PaintOptions[1]==0.0)",
	    "{",
        	    "float base = unpackFloatFromVec4i(texture2D(texture,oTC0));",
        	    "float ret = 0.0;",
        	    "ret = base;",
        	    
        	    "float len = length(oTC0-PaintPos.xy)/(PaintPosition.z/(512.0*4.0));",
        	    "if( len< 1.0)" ,
        	    "{" ,
        	    	"ret +=  stregnth* pow(1.0-(len),PaintOptions[0]);" ,
        	    "} ",
        	    "if(len > 1.0)" ,
        	    "{" ,
        	    	"return;" ,
        	    "} ",
        	    "ret = clamp(ret,0.0,1.0);",
        	    "gl_FragColor = packFloatToVec4i(ret);",
	    "}",
	    "if(PaintOptions[1]==1.0)",
	    "{",
	        "float base0 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(0.0,0.0)));",
	    	
	    	"float len = length(oTC0-PaintPos.xy)/(PaintPosition.z/(512.0*4.0));",
	    	
	    	"if( len< 1.0)" ,
	    	"{" ,
	    		
        	    	"float base1 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(1.0/512.0,0.0)));",
        	    	"float base2 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(-1.0/512.0,0.0)));",
        	    	"float base3 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(0.0,1.0/512.0)));",
        	    	"float base4 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(0.0,-1.0/512.0)));",
        	    	"float ret = (base1+base2+base3+base4)/4.0;",
	    		"ret = mix(base0,ret,clamp(0.0,1.0,pow(1.0-(len),PaintOptions[0])));",
	    
	    		"gl_FragColor = packFloatToVec4i(ret);",
	    	"}",
	    	"if(len > 1.0)" ,
        	"{" ,
        	"discard;",
        	"} ",
	    "}",
	    "if(PaintOptions[1]==2.0)",
	    "{",
	        "float base0 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(0.0,0.0)));",
	        "float len = length(oTC0-PaintPos.xy)/(PaintPosition.z/(512.0*4.0));",
	        "if( len< 1.0)" ,
	    	"{" ,
	    		"float ret = PaintPosition[3]*300.0;",
	    		"ret = clamp(ret,0.0,1.0);",
	    		"ret = mix(base0,ret,clamp(0.0,1.0,pow(1.0-(len),PaintOptions[0]*4.0)));",
	    		"gl_FragColor = packFloatToVec4i(ret);",
	    	"}",
	    	"if(len > 1.0)" ,
        	"{" ,
        		"return;",
        	"} ",
	     "}",
	     "if(PaintOptions[1]==3.0)",
		    "{",
		        "float base0 = unpackFloatFromVec4i(texture2D(texture,oTC0+vec2(0.0,0.0)));",
		        "float len = length(oTC0-PaintPos.xy)/(PaintPosition.z/(512.0*4.0));",
		        "if( len< 1.0)" ,
		    	"{" ,
		    		"float ret = PaintPosition[3]*3.0*(sin((float(time)+oTC0.x*PaintPosition[2]+PaintPosition[0]))+sin((float(time)+oTC0.y*PaintPosition[2]+PaintPosition[1])))+base0;",
		    		"ret = clamp(ret,0.0,1.0);",
		    		"ret = mix(base0,ret,clamp(0.0,1.0,pow(1.0-(len),PaintOptions[0])));",
		    		"gl_FragColor = packFloatToVec4i(ret);",
		    	"}",
		    	"if(len > 1.0)" ,
	        	"{" ,
	        		"return;",
	        	"} ",
		     "}",
	    
	   // "gl_FragColor.a = 0.0;",
	   

	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}


function GetTextureDrawingShader() {

    var vertshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "attribute vec3 Vertex;",
	   
	    "attribute vec2 TexCoord0;",
	   
	    
	    "varying vec2 oTC0;",
	    
	    
	    "vec4 ftransform() {",
	    "return vec4(Vertex, 1.0);",
	    "}",
	    "",
	    "void main() {",
	    "gl_Position = ftransform();",
	   
	    "oTC0 = TexCoord0;",
	   
	    "}" ].join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	   
	    "varying vec2 oTC0;",
	    "uniform sampler2D texture;",
	    "uniform sampler2D pickmap;",
	    "uniform vec4 PaintPosition;",
	    "uniform vec4 PaintOptions;",
	    "uniform vec4 TexturePaintChoice;",
	    "uniform int time;",
	    
	    "void main() {",
	    "vec2 PaintPos = texture2D(pickmap,PaintPosition.xy).xy;",
	    "PaintPos.y = 1.0- PaintPos.y;",
	    
        	    "vec4 base = texture2D(texture,oTC0);",
        	    "vec4 ret = base;",
        	    "float len = length(oTC0-PaintPos.xy)/(PaintPosition.z/(512.0*4.0));",
        	    "if( len< 1.0)" ,
        	    "{" ,
        	    	"ret =  mix(base,TexturePaintChoice,clamp(0.0,1.0,PaintPosition[3] * 50.0 * pow(1.0-(len),PaintOptions[0])));" ,
        	    "} ",
        	    "if(len > 1.0)" ,
        	    "{" ,
        	    	"discard;" ,
        	    "} ",
        	    
        	    "gl_FragColor = ret;",
	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}
/*
Copyright 2012 Rob Chadwick (rchadwic@gmail.com)
This work is licensed under a Creative Commons 
Attribution-NonCommercial-ShareAlike 3.0 Unported License.
http://creativecommons.org/licenses/by-nc-sa/3.0/
*/






function BuildGodRaysAccumulatorCam() {

    var rtt = new osg.Camera();
    rtt.setName("rttgod_camera");
    rttSize = [ 512, 512 ];
    // rttSize = [1920,1200];
    // rtt.setProjectionMatrix(osg.Matrix.makePerspective(60, 1, .1, 10000));
    //rtt.setProjectionMatrix(osg.Matrix.makeOrtho(-1, 1, -1, 1, .1, 10000.0));
    rtt.setRenderOrder(osg.Camera.PRE_RENDER, 0);
    rtt.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
    rtt.setViewport(new osg.Viewport(0, 0, rttSize[0], rttSize[1]));

    var rttTexture = new osg.Texture();

    
    rttTexture.wrap_s = 'CLAMP_TO_EDGE';
    rttTexture.wrap_t = 'CLAMP_TO_EDGE';
    rttTexture.setTextureSize(rttSize[0], rttSize[1]);
    rttTexture.setMinFilter('LINEAR');
    rttTexture.setMagFilter('LINEAR');

    rtt.attachTexture(gl.COLOR_ATTACHMENT0, rttTexture, 0);

    rtt.setClearDepth(1.0);
    rtt.setClearMask(gl.DEPTH_BUFFER_BIT );
    
    // rtt.setStateSet(new osg.StateSet());
    rtt.getOrCreateStateSet().setAttribute(GetGodRaysAccumulatorShader());
    rtt.getOrCreateStateSet().setAttribute(new osg.BlendFuncSeparate("ONE", "ZERO","ONE", "ZERO"));
   
    rtt.setClearColor([ 0, 0, 0, 1 ]);
    rtt.getOrCreateStateSet().setAttribute(new osg.Depth('LESS',0.0,1000.0,true));
    rtt.getOrCreateStateSet().setAttribute(new osg.CullFace("BACK"));
   
    rtt.getOrCreateStateSet().addUniform(osg.Uniform.createFloat3([1,1,1], "randomColor"));
    WebGL.GodRaysAccumulatorCam = rtt;
    WebGL.GodRaysAccumulatorTexture = rttTexture;
   
    var diffusetex3 = osg.Texture.create("./Assets/Textures/noise.jpg");
    rtt.getOrCreateStateSet().setTexture(1, diffusetex3);
    rtt.getOrCreateStateSet().setTexture(0, WebGL.GodRaysAccumulatorTexture);
    rtt.getOrCreateStateSet().addUniform(osg.Uniform.createInt1(1,"noisemap"));
    rtt.getOrCreateStateSet().addUniform(WebGL.gTimeUniform);
    rtt.getOrCreateStateSet().setTexture(2, WebGL.DrawBufferTexture);
    rtt.getOrCreateStateSet().setTexture(4, WebGL.ShadowVolumeBufferTexture);
    rtt.getOrCreateStateSet().addUniform(osg.Uniform.createInt1(4,"godraysmap"));
    WebGL.GodRaysAccumulatorCam.addChild(WebGL.gLandscape);
    
    
    rtt.getOrCreateStateSet().addUniform(WebGL.AOSampleVec);
    
    WebGL.GRFrameCount = osg.Uniform.createFloat1([1], "grframecount");
    rtt.getOrCreateStateSet().addUniform(WebGL.GRFrameCount);
    
    BuildDepthBufferCam();
    WebGL.GodRaysAccumulatorCam.addChild(WebGL.DepthBufferCam);
    rtt.getOrCreateStateSet().setTexture(5, WebGL.DepthBufferTexture);
    rtt.getOrCreateStateSet().addUniform(osg.Uniform.createInt1(5,"depthmap"));
}


function BuildDepthBufferCam() {

    var rtt = new osg.Camera();
    rtt.setName("rttdepth_camera");
    rttSize = [ 512, 512 ];
    // rttSize = [1920,1200];
    // rtt.setProjectionMatrix(osg.Matrix.makePerspective(60, 1, .1, 10000));
    //rtt.setProjectionMatrix(osg.Matrix.makeOrtho(-1, 1, -1, 1, .1, 10000.0));
    rtt.setRenderOrder(osg.Camera.PRE_RENDER, 0);
    rtt.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
    rtt.setViewport(new osg.Viewport(0, 0, rttSize[0], rttSize[1]));

    var rttTexture = new osg.Texture();

    rttTexture.wrap_s = 'CLAMP_TO_EDGE';
    rttTexture.wrap_t = 'CLAMP_TO_EDGE';
    rttTexture.setTextureSize(rttSize[0], rttSize[1]);
    rttTexture.setMinFilter('LINEAR');
    rttTexture.setMagFilter('LINEAR');

    rtt.attachTexture(gl.COLOR_ATTACHMENT0, rttTexture, 0);

    rtt.setClearDepth(1.0);
    rtt.setClearMask(gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT );
    
    // rtt.setStateSet(new osg.StateSet());
    rtt.getOrCreateStateSet().setAttribute(GetDepthShader());
    rtt.getOrCreateStateSet().setAttribute(new osg.BlendFuncSeparate("ONE", "ZERO","ONE", "ZERO"));
   
    rtt.setClearColor([ 0, 0, 0, 1 ]);
    rtt.getOrCreateStateSet().setAttribute(new osg.Depth('LESS',0.0,1000.0,true));
    rtt.getOrCreateStateSet().setAttribute(new osg.CullFace("BACK"));
   
    WebGL.DepthBufferCam = rtt;
    WebGL.DepthBufferTexture = rttTexture;
    WebGL.DepthBufferCam.addChild(WebGL.gLandscape);
    
}



function BuildShadowVolumeBufferCam() {

    var rtt = new osg.Camera();
    rtt.setName("rttgod_camera");
    rttSize = [ 512, 512 ];
    // rttSize = [1920,1200];
    // rtt.setProjectionMatrix(osg.Matrix.makePerspective(60, 1, .1, 10000));
    //rtt.setProjectionMatrix(osg.Matrix.makeOrtho(-1, 1, -1, 1, .1, 10000.0));
    rtt.setRenderOrder(osg.Camera.PRE_RENDER, 0);
    rtt.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
    rtt.setViewport(new osg.Viewport(0, 0, rttSize[0], rttSize[1]));

    var rttTexture = new osg.Texture();

    rttTexture.wrap_s = 'CLAMP_TO_EDGE';
    rttTexture.wrap_t = 'CLAMP_TO_EDGE';
    rttTexture.setTextureSize(rttSize[0], rttSize[1]);
    rttTexture.setMinFilter('LINEAR');
    rttTexture.setMagFilter('LINEAR');

    rtt.attachTexture(gl.COLOR_ATTACHMENT0, rttTexture, 0);

    rtt.setClearDepth(1.0);
    rtt.setClearMask(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // rtt.setStateSet(new osg.StateSet());
    rtt.getOrCreateStateSet().setAttribute(GetShadowVolumeShader());
    rtt.getOrCreateStateSet().setAttribute(new osg.BlendFuncSeparate("ONE", "ZERO","ONE", "ZERO"));
   
    rtt.setClearColor([ 0, 0, 0, 1 ]);
    rtt.getOrCreateStateSet().setAttribute(new osg.Depth('LESS',0.0,1000.0,true));
    rtt.getOrCreateStateSet().setAttribute(new osg.CullFace("DISABLE"));
   
    rtt.getOrCreateStateSet().addUniform(osg.Uniform.createFloat3([1,1,1], "randomColor"));
    WebGL.ShadowVolumeBufferCam = rtt;
    WebGL.ShadowVolumeBufferTexture = rttTexture;
   
    WebGL.ShadowVolumeBufferCam.addChild(WebGL.gModelRoot);
   
    
    
}


function GetShadowVolumeShader() {

    var vertshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "attribute vec3 Vertex;",
	    "attribute vec2 TexCoord0;",
	    "uniform mat4 ModelViewMatrix;",
	    "uniform mat4 ProjectionMatrix;",
	    "uniform sampler2D heightmap;",
	    "varying vec3 oWorldPos;",
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	    "varying vec4 oWorldNormal;",
	    "varying float d;",
	    "vec4 ftransform(vec4 vert) {",
	    "return ProjectionMatrix * ModelViewMatrix * vert;",
	    "}",
	    "",
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);",
	    "  return(dot(value, bitSh));", "}", 
	  
	    "void main() {",
	    "float z = (unpackFloatFromVec4i(texture2D(heightmap,TexCoord0))) * 100.0;",
	    "vec4 vert = vec4(Vertex.x,Vertex.y + z,Vertex.z,1.0);",
	    
	   
	   
	    "vec3 leftvert = vec3(Vertex.x + 1.0*(200.0/512.0),unpackFloatFromVec4i(texture2D(heightmap,TexCoord0 + vec2(1.0/512.0,0))) * 100.0 + Vertex.y,Vertex.z);",
	    "vec3 frontvert = vec3(Vertex.x,unpackFloatFromVec4i(texture2D(heightmap,TexCoord0+ vec2(0,-1.0/512.0))) * 100.0 + Vertex.y,Vertex.z+ 1.0*(200.0/512.0));",
	    "vec3 left = normalize(leftvert - vert.xyz);",
	    "vec3 front = normalize(frontvert - vert.xyz);",
	    "vec3 sunpos = vec3(5.0,3.0,-4.0);",
	    "vec3 norm = normalize(cross(front,left));",
	    "oWorldNormal.xyz = norm;",
	    
	    "d = dot(normalize(oWorldNormal.xyz),normalize(sunpos));",
	    "float d2 = dot(normalize(oWorldNormal.xyz),normalize(vec3(0.0,1.0,0.0)));",
	   
	    "if(d < -0.05) " +
	    "{" +
	    
	    "	vert += vec4((sunpos) * -100.0, 0.0);" +
	    "}" +
	   
	    "wViewRay = camerapos - vert.xyz;",
	
	    "d = vert.y;",
	    
	    "gl_Position = vec4(vert.x/100.0,-vert.z/100.0, vert.y/-100.0,1.0);",
	    "oWorldPos = vert.xyz;",
	    
	    "}" ].join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "uniform vec3 randomColor;",
	    "varying vec3 oWorldPos;",
	   
	   
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	    "varying vec4 oWorldNormal;",
	    "varying float d;",
	    "",
	    "vec4 packFloatToVec4i(const float value)",
	    "{",
	    "  const vec4 bitSh = vec4(255.0*255.0*255.0, 255.0*255.0, 255.0, 1.0);",
	    "  const vec4 bitMsk = vec4(0.0, 1.0/255.0, 1.0/255.0, 1.0/255.0);",
	    "  vec4 res = fract(value * bitSh);",
	    "  res -= res.xxyz * bitMsk;",
	    "  return res;",
	    "}",
	    "void main() {",
	   
	   
	    "gl_FragColor = packFloatToVec4i(clamp(d/100.0,0.0,1.0));",
	   	
	  
	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}


function GetGodRaysAccumulatorShader() {

    var vertshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "attribute vec3 Vertex;",
	    "attribute vec2 TexCoord0;",
	    "uniform mat4 ModelViewMatrix;",
	    "uniform mat4 ProjectionMatrix;",
	    "uniform sampler2D heightmap;",
	    "varying vec3 oWorldPos;",
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	    "varying vec4 oWorldNormal;",
	    "varying vec2 oTC0;",
	    "varying vec4 sspos;",
	    "vec4 ftransform(vec4 vert) {",
	    "return ProjectionMatrix * ModelViewMatrix * vert;",
	    "}",
	    "",
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);",
	    "  return(dot(value, bitSh));", "}", 
	  
	    "void main() {",
	    "float z = (unpackFloatFromVec4i(texture2D(heightmap,TexCoord0))) * 100.0;",
	    "vec4 vert = vec4(Vertex.x,Vertex.y + z,Vertex.z,1.0);",
	    
	   
	    "oTC0 = TexCoord0;",
	    "vec3 leftvert = vec3(Vertex.x + 1.0*(200.0/512.0),unpackFloatFromVec4i(texture2D(heightmap,TexCoord0 + vec2(1.0/512.0,0))) * 100.0 + Vertex.y,Vertex.z);",
	    "vec3 frontvert = vec3(Vertex.x,unpackFloatFromVec4i(texture2D(heightmap,TexCoord0+ vec2(0,-1.0/512.0))) * 100.0 + Vertex.y,Vertex.z+ 1.0*(200.0/512.0));",
	    "vec3 left = normalize(leftvert - vert.xyz);",
	    "vec3 front = normalize(frontvert - vert.xyz);",
	    "vec3 sunpos = vec3(9.0,5.0,2.0);",
	    "vec3 norm = normalize(cross(front,left));",
	    "oWorldNormal.xyz = norm;",
	    
	   
	   
	    "wViewRay = camerapos - vert.xyz;",
	
	    "sspos = ftransform(vert);",
	    
	    "gl_Position = sspos;",
	    "oWorldPos = vert.xyz;",
	    
	    "}" ].join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "uniform vec3 randomColor;",
	    "varying vec3 oWorldPos;",
	    "uniform vec4 RandomVec;",
	    "uniform float grframecount;",
	    "uniform int time;",
	    "varying vec2 oTC0;",
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	    "varying vec4 oWorldNormal;",
	    "uniform sampler2D texture;",
	    "uniform sampler2D godraysmap;",
	    "uniform sampler2D noisemap;",
	    "uniform sampler2D heightmap;",
	    "uniform sampler2D depthmap;",
	    "varying vec4 sspos;",
	    "",
	    "vec4 packFloatToVec4i(const float value)",
	    "{",
	    "  const vec4 bitSh = vec4(255.0*255.0*255.0, 255.0*255.0, 255.0, 1.0);",
	    "  const vec4 bitMsk = vec4(0.0, 1.0/255.0, 1.0/255.0, 1.0/255.0);",
	    "  vec4 res = fract(value * bitSh);",
	    "  res -= res.xxyz * bitMsk;",
	    "  return res;",
	    "}",
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(255.0*255.0*255.0), 1.0/(255.0*255.0), 1.0/255.0, 1.0);",
	    "  return(dot(value, bitSh));", "}",
	    "void main() {",
	    "if(grframecount == 1.0)" +
	     "{" +
	     "gl_FragColor = vec4(0.0,0.0,0.0,0.0);" +
	     "return;" +
	     "}",
	    "vec4 cbase = texture2D(texture,(vec2((sspos.x/sspos.w)  ,(sspos.y/sspos.w) )) /2.0 +.5);",
	    "float base = unpackFloatFromVec4i(cbase) * ((grframecount-1.0)/grframecount);",
	    "vec4 noise = texture2D(noisemap,(oTC0+normalize(RandomVec).xy)*2.0)-.5;",
	    "noise = noise*2.0 - 1.0;",
	    "float fogamount = 0.0;",
	    "float goodtestcount = 0.0;",
	    
	  
	    	"vec2 myscreenpos = (vec2((sspos.x/sspos.w)  ,(sspos.y/sspos.w) )) /2.0 +.5;",
	    	
	    	"if(myscreenpos.x < 2.0/512.0 || myscreenpos.y < 2.0/512.0 || myscreenpos.x > 510.0/512.0 || myscreenpos.y > 510.0/512.0)" +
	    	"{" +
	    	"gl_FragColor = vec4(0.0,0.0,0.0,0.0);return;" +
	    	"}",
	    "if(length(wViewRay)/1000.0 -.001 > unpackFloatFromVec4i(texture2D(depthmap,myscreenpos)))" +
	    "{",
	    	"gl_FragColor = packFloatToVec4i(base);return;" +
	    "}",	
	    "for(float i = 0.1; i < 1.0; i += .1)" +
	    "{",
	    
	    "    float noisei = i+(noise.y / 10.0);",
	        "noisei = clamp(noisei,.001,.999);",
	        "vec3 testvec = (camerapos-noise.xyz) - wViewRay*(noisei); ",
	    	"vec2 fogtc = vec2((testvec/200.0).x,-(testvec/200.0).z) + vec2(.5,.5);",
	    	"fogtc = oTC0 + (fogtc - oTC0) * i;",
	    	"if(fogtc.x > 0.0 && fogtc.y > 0.0 && fogtc.x < 1.0 && fogtc.y < 1.0)" +
	    	"{",
	    		"float sh = unpackFloatFromVec4i(texture2D(godraysmap,fogtc))*100.0;" +
	    		"float terh = unpackFloatFromVec4i(texture2D(heightmap,fogtc))*100.0;" +
	    		"if(testvec.y < sh && testvec.y > terh)" +
	    		"{" +
	    		"	fogamount += 1.0;" +
	    		"}" +
	    		"goodtestcount++;" +
	    		
	    	"}" +
	    "}",
	    "fogamount = clamp(fogamount/goodtestcount,0.00,1.0);",
	    "float ret = base + fogamount/grframecount;",
	    "gl_FragColor = packFloatToVec4i(ret);",
	    
	   	
	  
	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}


function GetDepthShader() {

    var vertshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "attribute vec3 Vertex;",
	    "attribute vec2 TexCoord0;",
	    "uniform mat4 ModelViewMatrix;",
	    "uniform mat4 ProjectionMatrix;",
	    "uniform sampler2D heightmap;",
	    
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	
	    "vec4 ftransform(vec4 vert) {",
	    "return ProjectionMatrix * ModelViewMatrix * vert;",
	    "}",
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);",
	    "  return(dot(value, bitSh));",
	    "}",
	  
	    "void main() {",
	    "float z = (unpackFloatFromVec4i(texture2D(heightmap,TexCoord0))) * 100.0;",
	    "vec4 vert = vec4(Vertex.x,Vertex.y + z,Vertex.z,1.0);", 
	    "wViewRay = camerapos - vert.xyz;",
	    "gl_Position = ftransform(vert);",

	    "}" ].join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	   
	    
	    "varying vec3 wViewRay;",
	   
	    "",
	    "vec4 packFloatToVec4i(const float value)",
	    "{",
	    "  const vec4 bitSh = vec4(255.0*255.0*255.0, 255.0*255.0, 255.0, 1.0);",
	    "  const vec4 bitMsk = vec4(0.0, 1.0/255.0, 1.0/255.0, 1.0/255.0);",
	    "  vec4 res = fract(value * bitSh);",
	    "  res -= res.xxyz * bitMsk;",
	    "  return res;",
	    "}",
	    "void main() {",
	   
	   
	    "gl_FragColor = packFloatToVec4i(length(wViewRay)/1000.0);",
	   	
	  
	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}


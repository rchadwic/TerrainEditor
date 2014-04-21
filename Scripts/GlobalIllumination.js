/*
Copyright 2012 Rob Chadwick (rchadwic@gmail.com)
This work is licensed under a Creative Commons 
Attribution-NonCommercial-ShareAlike 3.0 Unported License.
http://creativecommons.org/licenses/by-nc-sa/3.0/
*/

function BuildGIBufferCamera() {

   var togglecam = new toggleRTTCam();
    WebGL.GIBufferCam = togglecam;
    WebGL.GIBufferTexture = togglecam.texA;
    
    var quad =  osg.createTexuredQuad(-1,-1,0,
            2, 0 ,0,
            0, 2,0);
    quad.getOrCreateStateSet().setAttribute(GetGIShader());
   
  	
  	WebGL.GIBufferCam.registerStateSetTexture(quad.getOrCreateStateSet(),4);

    quad.getOrCreateStateSet().addUniform(WebGL.AOFrameCount);
    quad.getOrCreateStateSet().addUniform(WebGL.AOSampleVec);
    WebGL.GIBufferCam.addChild(quad);
    
    var diffusetex3 = osg.Texture.create("./Assets/Textures/noise.jpg");
    quad.getOrCreateStateSet().setTexture(1, diffusetex3);
    quad.getOrCreateStateSet().addUniform(osg.Uniform.createInt1(4,"basemap"));
   

    WebGL.SSBufferCam.registerStateSetTexture(quad.getOrCreateStateSet(),3);

    quad.getOrCreateStateSet().addUniform(osg.Uniform.createInt1(1,"noisemap"));
    quad.getOrCreateStateSet().addUniform(WebGL.gTimeUniform);
    //document.getElementById('HeightmapPreview').appendChild(draw_rttTexture.image); 
}


function GetGIShader() {

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
	    "uniform sampler2D basemap;",
	    "uniform sampler2D heightmap;",
	    "uniform sampler2D noisemap;",
	    "uniform sampler2D shadowmap;",
	    "uniform sampler2D mixmap;",
	    "uniform vec4 PaintPosition;",
	    "uniform vec4 PaintOptions;",
	    "uniform vec4 TexturePaintChoice;",
	    "uniform vec4 RandomVec;",
	    "uniform float aoframecount;",
	    "uniform int time;",
	    "const vec3 dL00  = vec3( 1.04,  .76,  0.71);",
	    "const vec3 dL1m1 = vec3( 0.44,  0.34,  0.34);",
	    "const vec3 dL10  = vec3( -0.22,  -0.18,  -0.17);",
	    "const vec3 dL11  = vec3(0.71, 0.54, 0.56);",
	    "const vec3 dL2m2 = vec3(0.64, 0.50, 0.52);",
	    "const vec3 dL2m1 = vec3( -0.12,  -0.09,  -0.08);",
	    "const vec3 dL20  = vec3(-0.37, -0.28, -0.29);",
	    "const vec3 dL21  = vec3(-0.17, -0.13, -0.13);",
	    "const vec3 dL22  = vec3(0.55, 0.42, 0.42);",
	    
	  "const vec3 aL00  = vec3( 0.871297,  0.875222,  0.864470);",
	  "const vec3 aL1m1 = vec3( 0.175058,  0.245335,  0.312891);",
	  "const vec3 aL10  = vec3( 0.034675,  0.036107,  0.037362);",
	  "const vec3 aL11  = vec3(-0.004629, -0.029448, -0.048028);",
	  "const vec3 aL2m2 = vec3(-0.120535, -0.121160, -0.117507);",
	  "const vec3 aL2m1 = vec3( 0.003242,  0.003624,  0.007511);",
	  "const vec3 aL20  = vec3(-0.028667, -0.024926, -0.020998);",
	  "const vec3 aL21  = vec3(-0.077539, -0.086325, -0.091591);",
	  "const vec3 aL22  = vec3(-0.161784, -0.191783, -0.219152);",
	  
	    "const float C1 = 0.429043;",
            "const float C2 = 0.511664;",
            "const float C3 = 0.743125;",
            "const float C4 = 0.886227;",
            "const float C5 = 0.247708;",
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
	    "mat3 transpose3(mat3 val)" +
	    "{" +
	    "   return  mat3(vec3(val[0][0],val[0][1],val[0][2]),vec3(val[1][0],val[1][1],val[1][2]),vec3(val[2][0],val[2][1],val[2][2]));" +
	    
	    "}",
	    "vec2 TestVec(vec3 testvec,vec3 vert)" +
	    "{" +
	    " float tmax = 1.0;",
	    " float tmin = 0.0;",
	    " float steps = 10.0;",
	    "  for(float i = 0.1; i < 1.0; i+=.05)" +
	    "  {" +
	   
	    "     vec3 testpos = vert + testvec * i;" +
	    "     vec2 testuv = testpos.xz;" +
	    "     float ty = unpackFloatFromVec4i(texture2D(heightmap,testuv)); " +
	    "     if(ty > testpos.y)" +
	    "		return testuv;" +
	    "  }" +
	    
	    " return vec2(-1.0,-1.0);" +
	    "}",
	    "vec4 GetSHDirect(vec3 tnorm)",
	    "{   ",
	   
	    "    vec3 DiffuseColor =  C1 * dL22 * (tnorm.x * tnorm.x - tnorm.y * tnorm.y) +",
	    "                    C3 * dL20 * tnorm.z * tnorm.z +",
	    "                    C4 * dL00 -",
	    "                    C5 * dL20 +",
	    "                    2.0 * C1 * dL2m2 * tnorm.x * tnorm.y +",
	    "                    2.0 * C1 * dL21  * tnorm.x * tnorm.z +",
	    "                    2.0 * C1 * dL2m1 * tnorm.y * tnorm.z +",
	    "                    2.0 * C2 * dL11  * tnorm.x +",
	    "                    2.0 * C2 * dL1m1 * tnorm.y + ",  
	    "                    2.0 * C2 * dL10  * tnorm.z;",
	        
	    "    return vec4(DiffuseColor,1);",
	    "}",
	    "vec3 GetNormalAt(vec2 pos) " +
	    "{" +
        	    "float h = unpackFloatFromVec4i(texture2D(heightmap,pos.xy));",
        	    
        	    "vec4 vert = vec4(pos.x,h,pos.y,1.0);",
        	    "vec3 leftvert = vec3(pos.x + (1.0/512.0),unpackFloatFromVec4i(texture2D(heightmap,pos + vec2(1.0/512.0,0))) * 1.0,pos.y);",
        	    "vec3 frontvert = vec3(pos.x,unpackFloatFromVec4i(texture2D(heightmap,pos+ vec2(0,1.0/512.0))) * 1.0,pos.y+ (1.0/512.0));",
        	    "vec3 left = normalize(leftvert - vert.xyz);",
        	    "vec3 front = normalize(frontvert - vert.xyz);",
        	    
        	    "vec3 norm = normalize(cross(front,left));" +
        	    "return norm;" +
	    "}",
	/*    "vec4 GetDiffuseColor(){",
	    
            
        	    "vec2 ScaledTC = fract(oTC0* 10.0)*.24;",
        	    
        	    "vec4 rock = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.02,0.52) ));",
        	    "vec4 snow = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.52,0.02)));",
        	    "vec4 dirt = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.52,0.52)));",
        	    "vec4 water = .5 * (SRGB_to_Linear(texture2D(watermap,oTC0 * 10.0)));",
        	    
        	    "vec4 grass = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.02,0.02)));",
        	    "vec4 mixdata = vec4(0.0,0.0,0.0,0.0);",
        	    "float watermix = 0.0;",
        	    
        	    
        	    "if(RenderOptions[3] == 1.0)" ,
        	    "{",
        	    	    "mixdata = normalize(texture2D(mixmap,oTC0));" ,
        	    	    "if(oWorldNormal.w < 0.10) watermix = 1.0;",
        	    "}" ,
        	    "else" ,
        	    "{",
                	    "if(oWorldNormal.w > 25.0) mixdata[1] = clamp((oWorldNormal.w - 25.0)/3.0,0.0,1.0);",
                	    "if(oWorldNormal.w > 0.10 ) mixdata[2] = 1.0 - mixdata[1];",
                	    "if(oWorldNormal.w < 0.10) watermix = 1.0;",
                	    "mixdata[0] = (1.0-dot(oWorldNormal.xyz,vec3(0.0,1.0,0.0))) * 10.0;",
                	    "mixdata = normalize(mixdata);" ,
        	    "}",
        	    "vec4 ret = (rock*mixdata[0]+snow*mixdata[1]+grass*mixdata[2]+dirt*mixdata[3])*(1.0-watermix) + water * watermix;",
        	    "ret.a = 1.0;",
        	    "return ret;",
            "}",*/
	    "void main() {", 
	     "if(aoframecount == 1.0)" +
	     "{" +
	     "gl_FragColor = vec4(0.0,0.0,0.0,0.0);" +
	     "return;" +
	     "}",
	    "vec4 cbase = texture2D(basemap,oTC0.xy);",
	 
	    "if(aoframecount == 1.0)" +
	    "{ gl_FragColor = vec4(1.0,1.0,1.0,1.0); return;}" +
	  
	    "vec4 base = (cbase)* ((aoframecount-1.0)/aoframecount); ;",
	   
	    
	    "float h = unpackFloatFromVec4i(texture2D(heightmap,oTC0.xy)) * 1.0;",
	    
	    "vec4 vert = vec4(oTC0.x,h,oTC0.y,1.0);",
	    "vec3 leftvert = vec3(oTC0.x + (1.0/512.0),unpackFloatFromVec4i(texture2D(heightmap,oTC0 + vec2(1.0/512.0,0))) * 1.0,oTC0.y);",
	    "vec3 frontvert = vec3(oTC0.x,unpackFloatFromVec4i(texture2D(heightmap,oTC0+ vec2(0,1.0/512.0))) * 1.0,oTC0.y+ (1.0/512.0));",
	    "vec3 left = normalize(leftvert - vert.xyz);",
	    "vec3 front = normalize(frontvert - vert.xyz);",
	    
	    "vec3 norm = normalize(cross(front,left));",
	    "left = cross(norm,front);",
	    "mat3 invtangentspace = transpose3(mat3(front,left,norm));",
	    "vec4 noise = (texture2D(noisemap,(oTC0+normalize(RandomVec).xy)*2.0-1.0)-.5) * 2.0;",
	    "noise.z = .5;",
	    //"noise *= 100.0;",
	    "noise = normalize(noise);",
	    "vec2 hitpoint = TestVec(invtangentspace * normalize(vec3(noise.y*2.0,noise.x*2.0,1.0)),vert.xyz);",
	    "if(hitpoint == vec2(-1.0,-1.0)){gl_FragColor = (base); return;}",
	    "float hitbright = 1.0-unpackFloatFromVec4i(texture2D(shadowmap,hitpoint));",
	    "vec3 hitnorm = GetNormalAt(hitpoint);",
	    "vec4 hitvert = vec4(hitpoint.x, unpackFloatFromVec4i(texture2D(heightmap,oTC0.xy)),hitpoint.y,1.0);",
	    "float gi =   clamp(pow(dot(norm,hitnorm),1.0),0.0,1.0);",
	   
	    
	    "gi = clamp(gi/clamp(distance(hitvert.xyz,vert.xyz)*200.0,0.0,4.0),0.0,1.0);",
	    "vec4 gi4 =  vec4(length(hitpoint - vert.xy));",
	    "gi4 = gi4 * gi4;",
	/*    "vec4 diffusetexture = vec4(0.0,0.0,0.0,0.0);",
	    "if(RenderOptions[0] == 2.0){ " +
	    "	GetDiffuseColor();" +
	    "	diffusetexture = vec4(1.0,1.0,1.0,1.0);" +
	    "};" ,
	    "if(RenderOptions[0] == 3.0){ " +
	    "	GetDiffuseColor();" +
	    "	diffusetexture = vec4(0.0,0.0,0.0,1.0);" +
	    "};" ,
	    "if(RenderOptions[0] == 1.0)" ,
	    "{",
	    	"GetDiffuseColor();",
	        "diffusetexture = vec4(h,h,h,1.0);" ,
	    "}",
	    "if(RenderOptions[0] == 0.0)",
	        "diffusetexture = GetDiffuseColor();",
	        */
	    "gl_FragColor = base + (gi4)/(aoframecount);",
	    
	    
	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}
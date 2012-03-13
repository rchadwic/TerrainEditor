
var landscapecanvas;
function SetupTerrainHeight()
{

	
	 var vertexes = [];
	 var uv =[];
	 var normals = [];
	 gLandscape = osg.Geometry.create();
	 for(var x =0; x< glandscapeRes; x++)
	 {
	     for(var y=0; y< glandscapeRes; y++)
	     {
		 vertexes.push((x-glandscapeRes/2)*2*(100/glandscapeRes));
		 var z = 0;//SampleHeightmap([(x/glandscapeRes)*512,0,(y/glandscapeRes)*512])[1];
		 vertexes.push(z);//();
		 vertexes.push((y-glandscapeRes/2)*2*(100/glandscapeRes));
		 uv.push(x/glandscapeRes);
		 uv.push(1-(y/glandscapeRes));
		 normals.push(0);
		 normals.push(1);
		 normals.push(0);
	     }
	 }
	 
	// _2dctx.drawImage(heightmap,0,0);
	 
	 var indexes = [];
	 for(var x =1; x< glandscapeRes-1; x++)
	 {
	     for(var y=1; y< glandscapeRes-1; y++)
	     {
		 indexes.push((x*glandscapeRes)+y);
		 indexes.push((x*glandscapeRes)+y+1);
		 indexes.push((x*glandscapeRes)+y+glandscapeRes+1);
		 
		 indexes.push((x*glandscapeRes)+y+glandscapeRes+1);
		 indexes.push((x*glandscapeRes)+y+glandscapeRes);
		 indexes.push((x*glandscapeRes)+y);
	     }
	 }
	 gLandscape.getAttributes().Vertex = osg.BufferArray.create(gl.ARRAY_BUFFER, vertexes, 3 );
	 gLandscape.getAttributes().Normal = osg.BufferArray.create(gl.ARRAY_BUFFER, normals, 3 );
	 gLandscape.getAttributes().TexCoord0 = osg.BufferArray.create(gl.ARRAY_BUFFER, uv, 2 );
	    
	 var primitive = new osg.DrawElements(gl.TRIANGLES, osg.BufferArray.create(gl.ELEMENT_ARRAY_BUFFER, indexes, 1 ));
	 //var primitive = new osg.DrawElements(gl.TRIANGLES, osg.BufferArray.create(gl.ELEMENT_ARRAY_BUFFER, [0,255*254-3,255*255,255*255,255*254-3,255,255*255] ));
	 gLandscape.getPrimitives().push(primitive);
	 WebGL.gModelRoot.addChild(gLandscape);
	 
	 
	    WebGL.gModelRoot.accept(new ShaderUniformVisitor());
	    var bv = new BoundsVisitor();
	    bv.apply(WebGL.gModelRoot);
	    WebGL.gSceneBounds = bv.asBoundingBox();
	    WebGL.gOriginalSceneBounds = new BoundingBox(WebGL.gSceneBounds.points);
	    
	    WebGL.gCamera.accept(new AmbientVisitor([ .5, .5, .5, 1 ]));
	    WebGL.gModelRoot.accept(new AssignRandomPickColorsVisitor());
	   
	    var newstateset = new osg.StateSet();
	      
	    var diffusetex1 = osg.Texture.create("./Assets/Textures/TerrainAtlasDiffuse1.png");
	    var diffusetex2 = osg.Texture.create("./Assets/Textures/TerrainAtlasDiffuse2.png");
	    var diffusetex3 = osg.Texture.create("./Assets/Textures/TerrainAtlasDiffuse3.png");
	    newstateset.setTexture(0, diffusetex1);
	    
	    var watertex = osg.Texture.create("./Assets/Textures/water.jpg");
	    newstateset.setTexture(6, watertex);
	   
	    newstateset.addUniform(osg.Uniform.createInt1(6,"watermap"));
	   

	    var normaltex1 = osg.Texture.create("./Assets/Textures/TerrainAtlasNormal1.png");
	    var normaltex2 = osg.Texture.create("./Assets/Textures/TerrainAtlasNormal2.png");
	    var normaltex3 = osg.Texture.create("./Assets/Textures/TerrainAtlasNormal3.png");
	    newstateset.setTexture(5, normaltex1);
	   
	    WebGL.TerrainState = newstateset;
	    WebGL.NormalTex1 = normaltex1;
	    WebGL.NormalTex2 = normaltex2;
	    WebGL.NormalTex3 = normaltex3;
	    WebGL.DiffuseTex1 = diffusetex1;
	    WebGL.DiffuseTex2 = diffusetex2;
	    WebGL.DiffuseTex3 = diffusetex3;
	    
	    newstateset.addUniform(osg.Uniform.createInt1(5,"normalmap"));
	    
	    newstateset.addUniform(WebGL.gPaintPositionUniform);
	    newstateset.addUniform(WebGL.gPaintOptionsUniform);
	    newstateset.addUniform(WebGL.gTimeUniform);
	      
	    WebGL.gRenderOptionsUniform =  osg.Uniform.createFloat4([ 0,1,1,0 ], 'RenderOptions');
	    newstateset.addUniform(WebGL.gRenderOptionsUniform);
	    
	 //   landscapeTexture = osg.Texture.createFromCanvas(landscapecanvas);
	 //   landscapeTexture.compile();
	    
	    newstateset.setTexture(2, WebGL.DrawBufferTexture);
	  
	    newstateset.setTexture(7,WebGL.DrawTextureBufferTexture); 
	    newstateset.addUniform(osg.Uniform.createInt1(7,"mixmap"));
	    newstateset.setTextureAttribute(4,WebGL.AOBufferTexture);
	    newstateset.setTextureAttribute(3,WebGL.SSBufferTexture);
	    newstateset.addUniform(osg.Uniform.createInt1(4,"aomap"));
	    
	    newstateset.setTexture(8,WebGL.GodRaysBufferTexture); 
	    newstateset.addUniform(osg.Uniform.createInt1(8,"godraysmap"));
	    
	    gLandscape.setStateSet(newstateset);
	        
	        
    
    
}

function GetLandscapeShader() {

    var vertshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision lowp float;",
	    "#endif",
	    "attribute vec3 Vertex;",
	    "attribute vec3 Normal;",
	    "attribute vec2 TexCoord0;",
	    "uniform mat4 ModelViewMatrix;",
	    "uniform mat4 ProjectionMatrix;",
	    "uniform mat4 NormalMatrix;",
	    "varying vec3 oNormal;",
	    "varying vec2 oTC0;", 
	    "varying mat3 invTanSpace;",
	    "uniform mat4 shadowProjection;",
	    "uniform mat4 inverseViewMatrix;",
	    "varying vec4 oScreenPosition;",
	    "varying vec4 oShadowSpaceVertex;",
	    "varying vec3 oLightSpaceNormal;",
	    "varying vec3 oLightDir;",
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	   // "varying vec3 oWorldPos;",
	    "varying vec4 oWorldNormal;",
	    "uniform vec4 RenderOptions;",
	    "uniform sampler2D heightmap;",
	    "",
	    "vec4 ftransform(vec4 vert) {",
	    
	    "return ProjectionMatrix * ModelViewMatrix * vert;",
	    "}",
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);",
	    "  return(dot(value, bitSh));", "}", 
	    "",
	    "mat3 transpose3(mat3 val)" +
	    "{" +
	    "   return  mat3(vec3(val[0][0],val[0][1],val[0][2]),vec3(val[1][0],val[1][1],val[1][2]),vec3(val[2][0],val[2][1],val[2][2]));" +
	    
	    "}",
	    "void main() {",
	    "float z = unpackFloatFromVec4i(texture2D(heightmap,TexCoord0)) * 100.0;",
	    "vec4 vert = vec4(Vertex.x,z + Vertex.y,Vertex.z,1.0);",
	    "wViewRay = camerapos - vert.xyz;",
	    "vec3 leftvert = vec3(Vertex.x + 1.0*(200.0/512.0),unpackFloatFromVec4i(texture2D(heightmap,TexCoord0 + vec2(1.0/512.0,0))) * 100.0 + Vertex.y,Vertex.z);",
	    "vec3 frontvert = vec3(Vertex.x,unpackFloatFromVec4i(texture2D(heightmap,TexCoord0+ vec2(0,-1.0/512.0))) * 100.0 + Vertex.y,Vertex.z+ 1.0*(200.0/512.0));",
	    "vec3 left = normalize(leftvert - vert.xyz);",
	    "vec3 front = normalize(frontvert - vert.xyz);",
	    
	    "vec3 norm = normalize(cross(front,left));",
	    "left = cross(norm,front);",
	    "mat3 tangentspace = mat3(front,left,norm);",
	    "invTanSpace = transpose3(tangentspace);",
	    "gl_Position = ftransform(vert);",
	    "oScreenPosition = gl_Position;",
	    //"Normal = normalize(Normal);",
	    "oWorldNormal.xyz = norm;",
	    "oNormal =  normalize(norm);",
	    "oTC0 = TexCoord0;",
	   
	    "mat4 ModelMatrix =  inverseViewMatrix * ModelViewMatrix;",
	    "oWorldNormal.w = vert.y;",
	    "oShadowSpaceVertex = (ModelMatrix * vert);",
	    "oShadowSpaceVertex = (shadowProjection * oShadowSpaceVertex);",
	    "if(RenderOptions[2] == 1.0)",
	    "oLightSpaceNormal =  (ModelMatrix * vec4(norm, 1.0)).xyz - vec3(ModelMatrix[3][0],ModelMatrix[3][1],ModelMatrix[3][2]) * tangentspace;",
	    "else",
	    "oLightSpaceNormal =  (ModelMatrix * vec4(norm, 1.0)).xyz - vec3(ModelMatrix[3][0],ModelMatrix[3][1],ModelMatrix[3][2]);",
	    // "oLightSpaceNormal = normalize((shadowProjection * vec4(Normal,
	    // 1.0)).xyz);",
	    "if(RenderOptions[2] == 1.0)",
	    "oLightDir =    normalize(vec3(1.0,1.0,1.1)) * tangentspace;",
	    "else",
	    "oLightDir =    normalize(vec3(1.0,1.0,1.1));",
	    "}" ]
	    .join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision lowp float;",
	    "#endif",
	    "varying vec3 oNormal;",
	    "varying vec2 oTC0;",
	    "uniform sampler2D texture;",
	    "uniform sampler2D shadowmap;",
	    "uniform sampler2D heightmap;",
	    "uniform sampler2D watermap;",
	    "uniform sampler2D pickmap;",
	    "uniform sampler2D normalmap;",
	    "uniform sampler2D mixmap;",
	    "uniform sampler2D aomap;",
	    "uniform sampler2D godraysmap;",
	    "uniform int time;",
	    "uniform float FrameTime;",
	    "uniform vec2 canvasSize;",
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	    "uniform mat4 shadowProjection;",
	    "varying mat3 invTanSpace;",
	    
	    "varying vec4 oShadowSpaceVertex;",
	    "varying vec4 oScreenPosition;",
	    "varying vec3 oLightSpaceNormal;",
	    "varying vec3 oLightDir;",
	 //   "varying vec3 oWorldPos;",
	    "varying vec4 oWorldNormal;",
	    "uniform vec4 MaterialDiffuseColor;",
	    "uniform int InWireframe;",
	    "uniform int IsPicked;",
	    "uniform vec4 PaintPosition;",
	    "uniform vec4 RenderOptions;",
	    "uniform vec4 PaintOptions;",
	    "vec4 mixdata;",
	    "vec2 ScaledTC;",
	    "float watermix;",
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
	    "",
	    
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);",
	    "  return(dot(value, bitSh));",
	    "}",
	    "float offset_lookup(sampler2D map, vec4 shadowCoord, vec2 offset)",
	    
	    "{ ",
	        "vec2 totalcoords = shadowCoord.xy + offset * (1.0/" + WebGL.ShadowMapResolution +");",
	        "if(totalcoords.x < 0.0 || totalcoords.y < 0.0 || totalcoords.x > 1.0 || totalcoords.y > 1.0) return 1.0;",
	        // the 512 here should be the shadowmap resolution!
	        "float shadowz = unpackFloatFromVec4i(texture2D(map,totalcoords));",
	        "float near = 1.0;",
	        "float far = 10.0;",

	        "float d = abs((-abs(shadowCoord.z) + near) / (far - near));",
	        "float shadow = d < shadowz ? 1.0 : 0.0;",
           
	        "return shadow;",
	    "}",
        "float EdgeSmoothingLookup(sampler2D map, vec4 shadowCoord, vec2 offset,vec2 screenjitter, vec4 fractional, vec4 bounds)",
        "{",
            "float sample = offset_lookup(map, shadowCoord, screenjitter+offset);",
            "if(offset.x == bounds[0])",
                "sample *= 1.0-fractional.x;",
            "if(offset.x == bounds[1])",
                "sample *= fractional.x;",

            "if(offset.y == bounds[2])",
                "sample *= 1.0-fractional.y;",
            "if(offset.y == bounds[3])",
                "sample *= fractional.y;",
            "return sample;",
        "}",
	    "float getShadowColor(vec4 shadowCoord, vec4 screenpos, float ScreenHeight, float ScreenWidth, sampler2D shadowTexture)",
	    "{",

	    "	float bias;",
	    "	bias   = .00005;",
	    "	shadowCoord.z += bias;",

	    "	vec2 offset = vec2(0.0,0.0);",

	    // generate a grid based on the screen size
	    // these numbers 400 and 300 should be 1/2 the screen height and
	    // width
	    "	offset.x = fract((screenpos.x/screenpos.w + 1.0)/2.0 * ScreenWidth/2.0) > 0.5 ? 1.0 : 0.0;",
	    "	offset.y = fract((screenpos.y/screenpos.w + 1.0)/2.0 * ScreenHeight/2.0) > 0.5 ? 1.0 : 0.0;// > 0.25;",
	    "	offset.y += offset.x;  // y ^= x in floating point",

	    "	if (offset.y > 1.1)",
	    "	offset.y = 0.0;",

	    // Average the samples
	    "vec4 tc = shadowCoord*" +WebGL.ShadowMapResolution+";",
	    "vec4 sc = floor(tc);",
	    "vec4 fractional = tc-sc;",
	    "tc = tc * 1.0/"+WebGL.ShadowMapResolution+";",
//BILINEAR PCF
	    " float x1 = offset_lookup(shadowTexture, shadowCoord, offset + vec2(0.0, 0.0));",
	    " float x2 = offset_lookup(shadowTexture, shadowCoord, offset + vec2(1.0, 0.0)); ",
	    " float x3 = offset_lookup(shadowTexture, shadowCoord, offset + vec2(0.0, 1.0)); ",
	    " float x4 = offset_lookup(shadowTexture, shadowCoord, offset + vec2(1.0, 1.0)); ",

	    "float a = mix(x1,x2,fractional.x);",
	    "float b = mix(x3,x4,fractional.x);",
	    "return mix(a,b,fractional.y);",

	    "}",
	    
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
	    "  const vec4 bitSh = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);",
	    "  const vec4 bitMsk = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);",
	    "  vec4 res = fract(value * bitSh);",
	    "  res -= res.xxyz * bitMsk;",
	    "  return res;",
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
	    "vec4 GetSHAmbient(vec3 tnorm)",
	    "{   ",
	   
	    "    vec3 DiffuseColor =  C1 * aL22 * (tnorm.x * tnorm.x - tnorm.y * tnorm.y) +",
	    "                    C3 * aL20 * tnorm.z * tnorm.z +",
	    "                    C4 * aL00 -",
	    "                    C5 * aL20 +",
	    "                    2.0 * C1 * aL2m2 * tnorm.x * tnorm.y +",
	    "                    2.0 * C1 * aL21  * tnorm.x * tnorm.z +",
	    "                    2.0 * C1 * aL2m1 * tnorm.y * tnorm.z +",
	    "                    2.0 * C2 * aL11  * tnorm.x +",
	    "                    2.0 * C2 * aL1m1 * tnorm.y + ",  
	    "                    2.0 * C2 * aL10  * tnorm.z;",
	        
	    "    return vec4(DiffuseColor,1);",
	    "}",
	    "vec4 GetDiffuseColor(){",
	    
	            
        	    "ScaledTC = fract(oTC0* 10.0)*.24;",
        	    
        	    "vec4 rock = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.02,0.52) ));",
        	    "vec4 snow = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.52,0.02)));",
        	    "vec4 dirt = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.52,0.52)));",
        	    "vec4 water = .5 * (SRGB_to_Linear(texture2D(watermap,oTC0 * 10.0 + vec2(0.0,float(time)/1000.0 *FrameTime * 60.0))) + SRGB_to_Linear(texture2D(watermap,oTC0.yx * 10.0 + vec2(0.0,float(time)/1000.0*FrameTime * 60.0))));",
        	    
        	    "vec4 grass = SRGB_to_Linear(texture2D(texture,ScaledTC+ vec2(.02,0.02)));",
        	    "mixdata = vec4(0.0,0.0,0.0,0.0);",
        	    "watermix = 0.0;",
        	    
        	    
        	  
        	    "if(RenderOptions[3] == 1.0)" ,
        	    "{",
        	    	    "mixdata = normalize(texture2D(mixmap,oTC0));" ,
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
	    "}",
	    "vec3 GetNormal(){",
	    
	    
        	  // "return vec4(.5,.5,1.0,1.0)* 2.0 - 1.0;;",
        	    "vec3 rock = texture2D(normalmap,ScaledTC+ vec2(.02,0.52)).xyz;",
        	    "vec3 snow = texture2D(normalmap,ScaledTC+ vec2(.52,0.02)).xyz;",
        	    "vec3 dirt = texture2D(normalmap,ScaledTC+ vec2(.52,0.52)).xyz;",  
        	    "vec3 grass = texture2D(normalmap,ScaledTC+ vec2(.02,0.02)).xyz;",
        	    "vec3 ret = (rock*mixdata[0]+snow*mixdata[1]*mixdata[1]+grass*mixdata[2]*mixdata[2]+dirt*mixdata[3]*mixdata[3])*(1.0-watermix) + watermix* vec3(.5,.5,1.0);",
        	    "return ret * 2.0 - 1.0;",
        	    
	 
	    "}",
	    "void main() {",
	    
	    "float ao =  (1.0-unpackFloatFromVec4i(texture2D(aomap,oTC0)));",
	    "float ss =  (1.0-unpackFloatFromVec4i(texture2D(shadowmap,oTC0)));",
	    "float fogshadow = 1.0 - texture2D(godraysmap,(oScreenPosition.xy / oScreenPosition.w + 1.0)/2.0).r;",
	   
	    "vec2 PaintPos = texture2D(pickmap,PaintPosition.xy).xy;",
	    "PaintPos.y = 1.0- PaintPos.y;",
	    "vec4 oShadowSpaceVertexW = oShadowSpaceVertex / oShadowSpaceVertex.w;",
	    "oShadowSpaceVertexW.xy *= .5;",
	    "oShadowSpaceVertexW.xy += .5;",

	    "float shadow = 1.0;",
	    "if(RenderOptions[1] == 1.0)",
	    	"shadow = ss;//getShadowColor(oShadowSpaceVertexW,oScreenPosition,canvasSize.y,canvasSize.x,shadowmap);",
	    "vec4 diffusetexture = vec4(0.0,0.0,0.0,0.0);",
	    "if(RenderOptions[0] == 1.0)" ,
	    "{",
	    	"GetDiffuseColor();",
	    	"float h = 2.0*unpackFloatFromVec4i(texture2D(heightmap,oTC0));",
	        "diffusetexture = vec4(h,h,h,1.0);" ,
	    "}",
	    "if(RenderOptions[0] == 0.0)",
	        "diffusetexture = GetDiffuseColor();",
	    "float NdotL = 0.0;",
	//    "if(RenderOptions[2] == 1.0)",
	//    	"NdotL = dot(normalize(GetNormal()),normalize(oLightDir));" ,
	//    "else" ,
	//    	"NdotL = dot(normalize(oLightSpaceNormal),normalize(oLightDir));" ,
	    "float light = min(clamp(shadow,0.0,1.0),clamp(NdotL,0.0,1.0))*1.0;",
	    "vec4 ambient = vec4(.0,.0,.0,1.0);",
	    "if(RenderOptions[2] == 1.0)",
	    	"gl_FragColor =  GetSHAmbient(invTanSpace * GetNormal())/7.5 * diffusetexture * (1.0 - clamp(shadow,0.0,1.0)) +  clamp(shadow,0.0,1.0) * GetSHDirect(invTanSpace * GetNormal())/1.8 * diffusetexture;",
	    "else",
	    	"gl_FragColor =   GetSHAmbient(oWorldNormal.xyz)/7.5 * diffusetexture * (1.0 - clamp(shadow,0.0,1.0)) +  clamp(shadow,0.0,1.0) * GetSHDirect(oWorldNormal.xyz)/1.8 * diffusetexture;",
	    "gl_FragColor *= ao;",
	//    "float fogamount = 0.0;",
	//    "for(float i = 0.0; i < 1.0; i += .1)" +
	//    "{",
	//    "vec2 fogtc = vec2((camerapos/200.0).x,-(camerapos/200.0).z) + vec2(.5,.5);",
	//    "fogamount += unpackFloatFromVec4i(texture2D(shadowmap,oTC0 + (fogtc - oTC0) * i))/10.0;" +
	//    "}",
	//    "gl_FragColor = vec4(fogamount,fogamount,fogamount,1.0); return;",
	    "gl_FragColor =  mix(gl_FragColor,GetSHDirect(normalize(-wViewRay)), fogshadow * clamp((100.0-(camerapos - wViewRay).y)/100.0 * pow(.0035*length(wViewRay),2.0),0.0,1.0));",
	    "gl_FragColor.a = 1.0;",
	    "float len = length(oTC0-PaintPos)/(PaintPosition.z/(512.0*4.0));",
	    "len = clamp(0.0,1.0,len);",
	    "len = pow(1.0-len,PaintOptions[0]);",
	    "len = clamp(0.0,1.0,len);",
	   
	    "gl_FragColor = mix(gl_FragColor,vec4(1.0-((PaintPosition[3]+.002)*250.0),0.0,(PaintPosition[3]+.002)*250.0,1.0),len); ",
	     "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}

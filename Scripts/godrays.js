
function BuildGodRaysBufferCam() {

    var rtt = new osg.Camera();
    rtt.setName("rttgod_camera");
    rttSize = [ 256, 256 ];
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
    rtt.getOrCreateStateSet().setAttribute(GetGodRaysShader());
    rtt.getOrCreateStateSet().setAttribute(new osg.BlendFunc("SRC_COLOR","DST_COLOR"));
   // rtt.getOrCreateStateSet().setAttribute(new osg.Depth("DISABLE"));
    rtt.setClearColor([ 0, 0, 0, 1 ]);
    //rtt.getOrCreateStateSet().setAttribute(new osg.Depth('ALWAYS'));
    rtt.getOrCreateStateSet().setAttribute(new osg.CullFace("BACK"));
   
    rtt.getOrCreateStateSet().addUniform(osg.Uniform.createFloat3([1,1,1], "randomColor"));
    WebGL.GodRaysBufferCam = rtt;
    WebGL.GodRaysBufferTexture = rttTexture;

}


function GetGodRaysShader() {

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
	    "varying float a;",
	    "vec4 ftransform(vec4 vert) {",
	    "return ProjectionMatrix * ModelViewMatrix * vert;",
	    "}",
	    "",
	    "float unpackFloatFromVec4i(const vec4 value)",
	    "{",
	    "  const vec4 bitSh = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);",
	    "  return(dot(value, bitSh));", "}", 
	    "void main() {",
	    "float z = unpackFloatFromVec4i(texture2D(heightmap,TexCoord0)) * 100.0;",
	    "vec4 vert = vec4(Vertex.x,Vertex.y + z,Vertex.z,1.0);",
	    
	   
	    "wViewRay = camerapos - vert.xyz;",
	    "vec3 leftvert = vec3(Vertex.x + 1.0*(200.0/512.0),unpackFloatFromVec4i(texture2D(heightmap,TexCoord0 + vec2(1.0/512.0,0))) * 100.0 + Vertex.y,Vertex.z);",
	    "vec3 frontvert = vec3(Vertex.x,unpackFloatFromVec4i(texture2D(heightmap,TexCoord0+ vec2(0,-1.0/512.0))) * 100.0 + Vertex.y,Vertex.z+ 1.0*(200.0/512.0));",
	    "vec3 left = normalize(leftvert - vert.xyz);",
	    "vec3 front = normalize(frontvert - vert.xyz);",
	    "vec3 sunpos = vec3(9.0,5.0,0.0);",
	    "vec3 norm = normalize(cross(front,left));",
	    "oWorldNormal.xyz = norm;",
	    "oWorldPos = vert.xyz;",
	    "d = dot(normalize(oWorldNormal.xyz),normalize(sunpos));",
	    "a = 1.0;",
	    "if(d < 0.0) " +
	    "{" +
	    "   d = -10.0;",
	    " a = -20.0;",
	    "	vert += vec4((sunpos) * -100.0, 0.0);" +
	    "" +
	    "}",
	    "gl_Position = ftransform(vert);",
	    
	    
	    "}" ].join('\n');

    var fragshader = [
	    "",
	    "#ifdef GL_ES",
	    "precision highp float;",
	    "#endif",
	    "uniform vec3 randomColor;",
	    "varying vec3 oWorldPos;",
	   
	    "varying float d;",
	    "varying float a;",
	    "uniform vec3 camerapos;",
	    "varying vec3 wViewRay;",
	    "varying vec4 oWorldNormal;",
	    "",
	    "void main() {",
	  
	   "if(d < 0.2)",
	    	"gl_FragColor = vec4(a,a, a,1.0);",
	    	"else",
	    	"gl_FragColor = vec4(0.0,0.0, 0.0,1.0);",
	  
	    "}" ].join('\n');

    var Frag = osg.Shader.create(gl.FRAGMENT_SHADER, fragshader);
    var Vert = osg.Shader.create(gl.VERTEX_SHADER, vertshader);

    var Prog = osg.Program.create(Vert, Frag);
    return Prog;

}

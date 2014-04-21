

function toggleRTTCam()
{
	osg.Transform.call(this);
	osg.CullSettings.call(this);

	this.texA = new osg.Texture();
    this.texA.wrap_s = 'CLAMP_TO_EDGE';
    this.texA.wrap_t = 'CLAMP_TO_EDGE';
    this.texA.setTextureSize(512, 512);
    this.texA.setMinFilter('NEAREST');
    this.texA.setMagFilter('NEAREST');

	this.camA = new osg.Camera();
	this.camA.setRenderOrder(osg.Camera.PRE_RENDER, 0);
    this.camA.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
    this.camA.setViewport(new osg.Viewport(0, 0, 512, 512));
    this.camA.attachTexture(gl.COLOR_ATTACHMENT0, this.texA, 0);
    this.camA.setClearDepth(1.0);
    this.camA.setClearMask(gl.DEPTH_BUFFER_BIT);
    this.camA.getOrCreateStateSet().setAttribute(new osg.BlendFuncSeparate("ONE", "ZERO","ONE", "ZERO"));
    this.camA.setClearColor([ 0, 0, 0, 1 ]);

	this.texB = new osg.Texture();
    this.texB.wrap_s = 'CLAMP_TO_EDGE';
    this.texB.wrap_t = 'CLAMP_TO_EDGE';
    this.texB.setTextureSize(512, 512);
    this.texB.setMinFilter('NEAREST');
    this.texB.setMagFilter('NEAREST');

	this.camB = new osg.Camera();
	this.camB.setRenderOrder(osg.Camera.PRE_RENDER, 0);
    this.camB.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
    this.camB.setViewport(new osg.Viewport(0, 0, 512, 512));
    this.camB.attachTexture(gl.COLOR_ATTACHMENT0, this.texB, 0);
    this.camB.setClearDepth(1.0);
    this.camB.setClearMask(gl.DEPTH_BUFFER_BIT);
    this.camB.getOrCreateStateSet().setAttribute(new osg.BlendFuncSeparate("ONE", "ZERO","ONE", "ZERO"));
    this.camB.setClearColor([ 0, 0, 0, 1 ]);

    
    this.parents = [];
    this.addParent = function(p)
    {
    	osg.Node.prototype.addParent.call(this,p)
    }
    this.traverse = function(p)
    {
    	osg.Node.prototype.traverse.call(this,p)
    }
    this.getNodeMask = function(p)
    {
    	return 0xFFFFFFFF;
    }
    this.removeParent = function(p)
    {
    	osg.Node.prototype.removeParent.call(this,p)
    }
    this.accept = function(p)
    {

    	this.update();
    	osg.Node.prototype.accept.call(this,p)
    }
    this.nodemask = 0;
    this.addChild = function(child)
    {
    	this.camA.addChild(child);
    	this.camB.addChild(child);
    }
    this.removeChild = function(child)
    {
    	this.camA.removeChild(child);
    	this.camB.removeChild(child);
    }
    this.getUpdateCallback = function()
    {
    	return this;
    }
    this.setViewMatrix = function(mm)
    {
    	this.camA.setViewMatrix(mm);
    	this.camB.setViewMatrix(mm);
    }
    this.setProjectionMatrix = function(mm)
    {
		this.camA.setProjectionMatrix(mm);
    	this.camB.setProjectionMatrix(mm);
    }
    this.getOrCreateStateSet = function()
    {
    	return this.camA.children[0].getOrCreateStateSet();
    }
    this.getStateSet = function()
    {
    	return this.camA.children[0].getStateSet();
    }
    this.update = function()
    {
    	
    	if(this.children[0] == this.camA)
    		this.children[0] = this.camB;
    	else
    		this.children[0] = this.camA;

    	var readFrom = null;
    	if(this.children[0] == this.camA)
    	{
    		readFrom = this.texB;
    		
    	}else
    	{
    		readFrom = this.texA;
    		
    	}


    	for(var i =0; i < this.stateSets.length; i++)
    	{
    		this.stateSets[i].ss.setTextureAttribute(this.stateSets[i].index,readFrom);
    	}	
    }
    this.stateSets = [];
    this.registerStateSetTexture =function (ss,index)
    {
    	this.stateSets.push({ss:ss,index:index});
    }
}
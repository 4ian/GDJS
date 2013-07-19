/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * A frame used by a SpriteAnimation in a SpriteRuntimeObject.
 *
 * @namespace gdjs
 * @class SpriteAnimationFrame
 * @constructor
 */
gdjs.SpriteAnimationFrame = function(imageManager, frameData)
{
    this.image = frameData ? frameData.attr.image : "";
    this.pixiTexture = imageManager.getPIXITexture(this.image);
    
    if ( this.center == undefined ) this.center = { x:0, y:0 };
    if ( this.origin == undefined ) this.origin = { x:0, y:0 };
    if ( this.points == undefined ) this.points = new Hashtable();
    else this.points.clear();

    //Initialize points:
    var that = this;
    gdjs.iterateOver(frameData.Points, "Point", function(ptData) {
        var point = {x:parseFloat(ptData.attr.X), y:parseFloat(ptData.attr.Y)};
        that.points.put(ptData.attr.nom, point);
    });
    var origin = frameData.PointOrigine;
    this.origin.x = parseFloat(origin.attr.X);
    this.origin.y = parseFloat(origin.attr.Y);

    var center = frameData.PointCentre;
    if ( center.attr.automatic !== "true" ) {
        this.center.x = parseFloat(center.attr.X);
        this.center.y = parseFloat(center.attr.Y);
    }
    else  {
        this.center.x = this.pixiTexture.width/2;
        this.center.y = this.pixiTexture.height/2;
    }
}

/**
 * Get a point of the frame.<br>
 * If the point does not exist, the origin is returned.
 *
 * @method getPoint
 * @return The requested point.
 */
gdjs.SpriteAnimationFrame.prototype.getPoint = function(name) {
	if ( name == "Centre" ) return this.center;
	else if ( name == "Origin" ) return this.origin;

	return this.points.containsKey(name) ? this.points.get(name) : this.origin;
}

/**
 * Represents an animation of a spriteRuntimeObject.
 *
 * @class SpriteAnimation
 * @namespace gdjs
 * @constructor
 */
gdjs.SpriteAnimation = function(imageManager, animData)
{
	//Constructor of internal object representing a direction of an animation.
    var Direction = function(imageManager, directionData) {
        this.timeBetweenFrames = directionData ? parseFloat(directionData.attr.tempsEntre) :
                                 1.0;
        this.loop = directionData ? directionData.attr.boucle === "true" : false;
        
        var that = this;
        var i = 0;
        if ( this.frames == undefined ) this.frames = [];
        gdjs.iterateOver(directionData.Sprites, "Sprite", function(frameData) {
            if ( i < that.frames.length )
                gdjs.SpriteAnimationFrame.call(that.frames[i], imageManager, frameData);
            else
                that.frames.push(new gdjs.SpriteAnimationFrame(imageManager, frameData));
                
            i++;
        });
        this.frames.length = i;
    }

    this.hasMultipleDirections = animData ? animData.attr.typeNormal === "true" : false;
    
    var that = this;
    var i = 0;
    if ( this.directions == undefined ) this.directions = [];
    gdjs.iterateOver(animData, "Direction", function(directionData) {
        if ( i < that.directions.length )
            Direction.call(that.directions[i], imageManager, directionData);
        else
            that.directions.push(new Direction(imageManager, directionData));
            
        i++;
    });
    this.directions.length = i; //Make sure to delete already existing directions which are not used anymore.
}

/**
 * The SpriteRuntimeObject represents an object this.can display images.
 *
 * <b>TODO:</b> custom collisions masks.
 *
 * @class SpriteRuntimeObject
 * @namespace gdjs
 * @extends runtimeObject
 */
gdjs.SpriteRuntimeObject = function(runtimeScene, objectData)
{
	gdjs.RuntimeObject.call( this, runtimeScene, objectData );

    this._currentAnimation = 0;
    this._currentDirection = 0;
    this._currentFrame = 0;
    this._frameElapsedTime = 0;
	this._animationPaused = false;
    this._scaleX = 1;
    this._scaleY = 1;
    this._blendMode = 0;
    this._flippedX = false;
    this._flippedY = false;
    this._runtimeScene = runtimeScene;
    this.opacity = 255;
    
    //Animations:
    var that = this;
    var i = 0;
    if ( this._animations == undefined ) this._animations = [];
    gdjs.iterateOver(objectData.Animations, "Animation", function(animData) {
        if ( i < that._animations.length )
            gdjs.SpriteAnimation.call(that._animations[i], runtimeScene.getGame().getImageManager(), animData);
        else
            that._animations.push(new gdjs.SpriteAnimation(runtimeScene.getGame().getImageManager(), animData));
            
        i++;
    });
    this._animations.length = i; //Make sure to delete already existing animations which are not used anymore.

    //PIXI sprite related members:
    this._animationFrame = null;
    this._spriteDirty = true;
    this._textureDirty = true;
    this._spriteInContainer = true;
    if ( this._sprite == undefined )
        this._sprite = new PIXI.Sprite(runtimeScene.getGame().getImageManager().getInvalidPIXITexture());
    runtimeScene.getLayer("").addChildToPIXIContainer(this._sprite, this.zOrder);

	this._updatePIXITexture();
	this._updatePIXISprite();
}

gdjs.SpriteRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.SpriteRuntimeObject.thisIsARuntimeObjectConstructor = "Sprite"; //Notify gdjs of the obj existence.

//Others intialisation and internal state management :

/**
 *
 */
gdjs.SpriteRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if ( initialInstanceData.attr.personalizedSize === "true" ) {
        this.setWidth(parseFloat(initialInstanceData.attr.width));
        this.setHeight(parseFloat(initialInstanceData.attr.height));
    }
    if ( initialInstanceData.floatInfos ) {
        var that = this;
        gdjs.iterateOver(initialInstanceData.floatInfos, "Info", function(extraData) {
            if ( extraData.attr.name === "animation" )
                that.setAnimation(parseFloat(extraData.attr.value));
        });
    }
}

/**
 * Update the internal PIXI.Sprite position, angle...
 */
gdjs.SpriteRuntimeObject.prototype._updatePIXISprite = function() {

    this._sprite.anchor.x = this._animationFrame.center.x/this._sprite.texture.frame.width;
    this._sprite.anchor.y = this._animationFrame.center.y/this._sprite.texture.frame.height;
    this._sprite.position.x = this.x + (this._animationFrame.center.x - this._animationFrame.origin.x)*Math.abs(this._scaleX);
    this._sprite.position.y = this.y + (this._animationFrame.center.y - this._animationFrame.origin.y)*Math.abs(this._scaleY);
    if ( this._flippedX ) this._sprite.position.x += (this._sprite.texture.frame.width/2-this._animationFrame.center.x)*Math.abs(this._scaleX)*2;
    if ( this._flippedY ) this._sprite.position.y += (this._sprite.texture.frame.height/2-this._animationFrame.center.y)*Math.abs(this._scaleY)*2;
    this._sprite.rotation = gdjs.toRad(this.angle);
    this._sprite.visible = !this.hidden;
    this._sprite.blendMode = this._blendMode;
    this._sprite.alpha = this._sprite.visible ? this.opacity/255 : 0; //TODO: Workaround not working property in PIXI.js
    this._sprite.scale.x = this._scaleX;
    this._sprite.scale.y = this._scaleY;
    this._cachedWidth = this._sprite.width;
    this._cachedHeight = this._sprite.height;

    this._spriteDirty = false;
}

/**
 * Update the internal texture of the PIXI sprite.
 */
gdjs.SpriteRuntimeObject.prototype._updatePIXITexture = function() {
    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    this._animationFrame = direction.frames[this._currentFrame];
    this._sprite.setTexture(this._animationFrame.pixiTexture);
    this._textureDirty = false;
    this._spriteDirty = true;
}

/**
 * Update the current frame according to the elapsed time.
 * @method updateTime
 */
gdjs.SpriteRuntimeObject.prototype.updateTime = function(elapsedTime) {
    if ( this._animationPaused ) return;

    var oldFrame = this._currentFrame;
    this._frameElapsedTime += elapsedTime;

    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }

    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    if ( this._frameElapsedTime > direction.timeBetweenFrames ) {
        var count = Math.floor(this._frameElapsedTime / direction.timeBetweenFrames);
        this._currentFrame += count;
        this._frameElapsedTime = this._frameElapsedTime-count*direction.timeBetweenFrames;
        if ( this._frameElapsedTime < 0 ) this._frameElapsedTime = 0;
    }

    if ( this._currentFrame >= direction.frames.length ) {
        this._currentFrame = direction.loop ? this._currentFrame % direction.frames.length : direction.frames.length-1;
    }

    if ( oldFrame != this._currentFrame || this._textureDirty ) this._updatePIXITexture();
    if ( this._spriteDirty ) this._updatePIXISprite();
}

gdjs.SpriteRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    runtimeScene.getLayer(this.layer).removePIXIContainerChild(this._sprite);
}

//Animations :

gdjs.SpriteRuntimeObject.prototype.setAnimation = function(newAnimation) {
    if ( newAnimation < this._animations.length 
         && this._currentAnimation !== newAnimation) {
        this._currentAnimation = newAnimation;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this._spriteDirty = true;
        this._textureDirty = true;
        this.hitBoxesDirty = true;
    }
}

gdjs.SpriteRuntimeObject.prototype.getAnimation = function() {
    return this._currentAnimation;
}

gdjs.SpriteRuntimeObject.prototype.setDirectionOrAngle = function(newValue) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    var anim = this._animations[this._currentAnimation];
    if ( !anim.hasMultipleDirections ) {
        this.angle = newValue;
        this._sprite.rotation = gdjs.toRad(this.angle);
        this.hitBoxesDirty = true;
    }
    else {
        if (newValue === this._currentDirection
            || newValue >= anim.directions.length
            || anim.directions[newValue].frames.length === 0
            || this._currentDirection === newValue )
            return;

        this._currentDirection = newValue;
        this._currentFrame = 0;
        this._frameElapsedTime = 0;
        this.angle = 0;

        this._spriteDirty = true;
        this._textureDirty = true;
        this.hitBoxesDirty = true;
    }
}

gdjs.SpriteRuntimeObject.prototype.getDirectionOrAngle = function() {
    if ( this._currentAnimation >= this._animations.length ) {
        return 0;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections ) {
        return this.angle;
    }
    else {
        return this._currentDirection;
    }
}

gdjs.SpriteRuntimeObject.prototype.setAnimationFrame = function(newFrame) {
    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    if ( newFrame < direction.frames.length && newFrame != this._currentFrame ) {
        this._currentFrame = newFrame;
        this._textureDirty = true;
    }
}

/**
 * Return true if animation has ended.
 */
gdjs.SpriteRuntimeObject.prototype.hasAnimationEnded = function() {
    if ( this._currentAnimation >= this._animations.length ||
         this._currentDirection >= this._animations[this._currentAnimation].directions.length) {
        return;
    }
    if ( this._animations[this._currentAnimation].loop ) return false;
    var direction = this._animations[this._currentAnimation].directions[this._currentDirection];

    return this._currentFrame == direction.frames.length-1;
}

gdjs.SpriteRuntimeObject.prototype.animationPaused = function() {
    return this._animationPaused;
}

gdjs.SpriteRuntimeObject.prototype.pauseAnimation = function() {
    this._animationPaused = true;
}

gdjs.SpriteRuntimeObject.prototype.playAnimation = function() {
    this._animationPaused = false;
}

//Position :

gdjs.SpriteRuntimeObject.prototype.getPointX = function(name) {
    if ( name.length === 0 ) return this.getX();

    var pt = this._animationFrame.getPoint(name);
    var cPt = this._animationFrame.center;
    var x = pt.x;
    var y = pt.y;
    var cx = cPt.x;
    var cy = cPt.y;

    if ( this._flippedX ) {
        x = this._sprite.texture.frame.width - x;
        cx = this._sprite.texture.frame.width - cx;
    }
    if ( this._flippedY ) {
        y = this._sprite.texture.frame.height - y;
        cy = this._sprite.texture.frame.height - cy;
    }

    x *= Math.abs(this._scaleX);
    y *= Math.abs(this._scaleY);
    cx *= Math.abs(this._scaleX);
    cy *= Math.abs(this._scaleY);

    x = cx + Math.cos(this.angle/180*3.14159)*(x-cx) - Math.sin(this.angle/180*3.14159)*(y-cy);

    return x + this.getDrawableX();
}

gdjs.SpriteRuntimeObject.prototype.getPointY = function(name) {
    if ( name.length === 0 ) return this.getY();

    var pt = this._animationFrame.getPoint(name);
    var cPt = this._animationFrame.center;
    var x = pt.x;
    var y = pt.y;
    var cx = cPt.x;
    var cy = cPt.y;

    if ( this._flippedX ) {
        x = this._sprite.texture.frame.width - x;
        cx = this._sprite.texture.frame.width - cx;
    }
    if ( this._flippedY ) {
        y = this._sprite.texture.frame.height - y;
        cy = this._sprite.texture.frame.height - cy;
    }

    x *= Math.abs(this._scaleX);
    y *= Math.abs(this._scaleY);
    cx *= Math.abs(this._scaleX);
    cy *= Math.abs(this._scaleY);

    y = cy + Math.sin(this.angle/180*3.14159)*(x-cx) + Math.cos(this.angle/180*3.14159)*(y-cy);

    return y + this.getDrawableY();
}

gdjs.SpriteRuntimeObject.prototype.getDrawableX = function() {
    return this.x - this._animationFrame.origin.x*Math.abs(this._scaleX);
}

gdjs.SpriteRuntimeObject.prototype.getDrawableY = function() {
    return this.y - this._animationFrame.origin.y*Math.abs(this._scaleY);
}

gdjs.SpriteRuntimeObject.prototype.getCenterX = function() {
    //Just need to multiply by the scale as it is the center
    return this._animationFrame.center.x*Math.abs(this._scaleX);
}

gdjs.SpriteRuntimeObject.prototype.getCenterY = function() {
    //Just need to multiply by the scale as it is the center
    return this._animationFrame.center.y*Math.abs(this._scaleY);
}

gdjs.SpriteRuntimeObject.prototype.setX = function(x) {
    this.x = x;
    
    this.hitBoxesDirty = true;
    this._sprite.position.x = this.x + (this._animationFrame.center.x - this._animationFrame.origin.x)*Math.abs(this._scaleX);
    if ( this._flippedX ) this._sprite.position.x += (this._sprite.texture.frame.width/2-this._animationFrame.center.x)*Math.abs(this._scaleX)*2;
}

gdjs.SpriteRuntimeObject.prototype.setY = function(y) {
    this.y = y;
    
    this.hitBoxesDirty = true;
    this._sprite.position.y = this.y + (this._animationFrame.center.y - this._animationFrame.origin.y)*Math.abs(this._scaleY);
    if ( this._flippedY ) this._sprite.position.y += (this._sprite.texture.frame.height/2-this._animationFrame.center.y)*Math.abs(this._scaleY)*2;
}

gdjs.SpriteRuntimeObject.prototype.setAngle = function(angle) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections ) {
        this.angle = angle;
        this._sprite.rotation = gdjs.toRad(this.angle);
        this.hitBoxesDirty = true;
    }
    else {
        angle = angle % 360;
        if ( angle < 0 ) angle += 360;
        this.setDirectionOrAngle(Math.round(angle/45) % 8);
    }
}

gdjs.SpriteRuntimeObject.prototype.getAngle = function(angle) {
    if ( this._currentAnimation >= this._animations.length ) {
        return;
    }

    if ( !this._animations[this._currentAnimation].hasMultipleDirections )
        return this.angle;
    else
        return this._currentDirection*45;
}

//Visibility and display :

gdjs.SpriteRuntimeObject.prototype.setBlendMode = function(newMode) {
    this._blendMode = newMode;
    this._spriteDirty = true;
}

gdjs.SpriteRuntimeObject.prototype.getBlendMode = function() {
    return this._blendMode;
}

gdjs.SpriteRuntimeObject.prototype.setOpacity = function(opacity) {
    if ( opacity < 0 ) opacity = 0;
    if ( opacity > 255 ) opacity = 255;

    this.opacity = opacity;
    //TODO: Workaround a not working property in PIXI.js:
    this._sprite.alpha = this._sprite.visible ? this.opacity/255 : 0; 
}

gdjs.SpriteRuntimeObject.prototype.getOpacity = function() {
    return this.opacity;
}

gdjs.SpriteRuntimeObject.prototype.hide = function(enable) {
    if ( enable == undefined ) enable = true;
    this.hidden = enable;
    this._sprite.visible = !enable;
    //TODO: Workaround a not working property in PIXI.js:
    this._sprite.alpha = this._sprite.visible ? this.opacity/255 : 0; 
}

gdjs.SpriteRuntimeObject.prototype.setLayer = function(name) {
    //We need to move the object from the pixi container of the layer
    //TODO: Pass the runtimeScene as parameter ?
    this._runtimeScene.getLayer(this.layer).removePIXIContainerChild(this._sprite);
    this.layer = name;
    this._runtimeScene.getLayer(this.layer).addChildToPIXIContainer(this._sprite, this.zOrder);
}

gdjs.SpriteRuntimeObject.prototype.flipX = function(enable) {
    if ( enable != this._flippedX ) {
        this._scaleX *= -1;
        this._spriteDirty = true;
        this._flippedX = enable;
    }
}

gdjs.SpriteRuntimeObject.prototype.flipY = function(enable) {
    if ( enable != this._flippedY ) {
        this._scaleY *= -1;
        this._spriteDirty = true;
        this._flippedY = enable;
    }
}

//Scale and size :

gdjs.SpriteRuntimeObject.prototype.getWidth = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
    return this._cachedWidth;
}

gdjs.SpriteRuntimeObject.prototype.getHeight = function() {
    if ( this._spriteDirty ) this._updatePIXISprite();
    return this._cachedHeight;
}

gdjs.SpriteRuntimeObject.prototype.setWidth = function(newWidth) {
    if ( this._spriteDirty ) this._updatePIXISprite();
    var newScaleX = newWidth/this._sprite.texture.frame.width;
    this.setScaleX(!this._isFlippedX ? newScaleX : -newScaleX);
}

gdjs.SpriteRuntimeObject.prototype.setHeight = function(newHeight) {
    if ( this._spriteDirty ) this._updatePIXISprite();
    var newScaleY = newHeight/this._sprite.texture.frame.height;
    this.setScaleY(!this._isFlippedY ? newScaleY : -newScaleY);
}

gdjs.SpriteRuntimeObject.prototype.setScaleX = function(newScale) {
    if ( newScale > 0 ) this._scaleX = newScale;
    if ( this._isFlippedX ) this._scaleX *= -1;
    this._spriteDirty = true;
    this.hitBoxesDirty = true;
}

gdjs.SpriteRuntimeObject.prototype.setScaleY = function(newScale) {
    if ( newScale > 0 ) this._scaleY = newScale;
    if ( this._isFlippedY ) this._scaleX *= -1;
    this._spriteDirty = true;
    this.hitBoxesDirty = true;
}

gdjs.SpriteRuntimeObject.prototype.getScaleY = function() {
    return this._scaleY;
}

gdjs.SpriteRuntimeObject.prototype.getScaleX = function() {
    return this._scaleX;
}

//Other :

/**
 * Set the Z order of the object.
 *
 * @method setZOrder
 * @param z {Number} The new Z order position of the object
 */
gdjs.SpriteRuntimeObject.prototype.setZOrder = function(z) {
    if ( z != this.zOrder ) {
        //TODO: Pass the runtimeScene as parameter ?
        this._runtimeScene.getLayer(this.layer).changePIXIContainerChildZOrder(this._sprite, z);
        this.zOrder = z;
    }
}

/**
 * Change the object angle so this.it is facing the specified position.

 * @method turnTowardPosition
 * @param x {Number} The target x position
 * @param y {Number} The target y position
 */
gdjs.SpriteRuntimeObject.prototype.turnTowardPosition = function(x,y) {
    var angle = Math.atan2(y - (this.getDrawableY()+this.getCenterY()),
                           x - (this.getDrawableX()+this.getCenterX()));

    this.setAngle(angle*180/3.14159);
}

/**
 * Change the object angle so this.it is facing another object

 * @method turnTowardObject
 * @param obj The target object
 */
gdjs.SpriteRuntimeObject.prototype.turnTowardObject = function(obj) {
    if ( obj == null ) return;

    this.turnTowardPosition(obj.getDrawableX()+obj.getCenterX(),
                            obj.getDrawableY()+obj.getCenterY());
}


/**
 * Return true if the cursor is on the object.<br>
 * TODO : Support layer's camera rotation.
 *
 * @method cursorOnObject
 * @return true if the cursor is on the object.
 */
gdjs.SpriteRuntimeObject.prototype.cursorOnObject = function() {
    //TODO: Pass the runtimeScene as parameter ?
    var layer = this._runtimeScene.getLayer(this.layer);

    if ( this._runtimeScene.getGame().getMouseX()+layer.getCameraX() >= this.getX()
        && this._runtimeScene.getGame().getMouseX()+layer.getCameraX() <= this.getX()+this.getWidth()
        && this._runtimeScene.getGame().getMouseY()+layer.getCameraY() >= this.getY()
        && this._runtimeScene.getGame().getMouseY()+layer.getCameraY() <= this.getY()+this.getHeight())
        return true;

    return false;
}


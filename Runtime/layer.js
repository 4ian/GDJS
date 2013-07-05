/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * Represents a layer used to display objects.<br>
 * The layer connects its Pixi container to the Pixi stage during its construction,
 * but then it is objects responsibility to connect themselves to the layer's container
 * ( See addChildToPIXIContainer method ).<br>
 * Layers do not provide direct access to their pixi container as they do some extra work
 * to ensure this.z orders remains correct.
 *
 * TODO : Viewports and support for multiple cameras
 *
 * @class layer
 * @namespace gdjs
 * @constructor
 */
gdjs.Layer = function(name, runtimeScene)
{
    this._name = name;
    this._cameraX = 0;
    this._cameraY = 0;
    this._cameraRotation = 0;
    this._hidden = false;
    this._pixiStage = runtimeScene.getPIXIStage();
    this._pixiRenderer = runtimeScene.getPIXIRenderer();
    this._pixiContainer = new PIXI.DisplayObjectContainer();

    this._pixiStage.addChild(this._pixiContainer);
}

/**
 * Update the position of the PIXI container. To be called after each change
 * made to position or rotation of the camera.
 * @private
 */
gdjs.Layer.prototype._updatePixiContainerPosition = function() {
	var angle = gdjs.toRad(this._cameraRotation);
	this._pixiContainer.rotation = angle;

	var centerX = this._pixiRenderer.width/2*Math.cos(angle)-this._pixiRenderer.height/2*Math.sin(angle);
	var centerY = this._pixiRenderer.width/2*Math.sin(angle)+this._pixiRenderer.height/2*Math.cos(angle);

	this._pixiContainer.position.x = -this._cameraX+this._pixiRenderer.width/2-centerX;
	this._pixiContainer.position.y = -this._cameraY+this._pixiRenderer.height/2-centerY;
}

/**
 * Get the name of the layer
 * @method getName
 * @return {String} The name of the layer
 */
gdjs.Layer.prototype.getName = function() {
	return this._name;
}

/**
 * Add a child to the pixi container associated to the layer.<br>
 * All objects which are on this layer must be children of this container.<br>
 *
 * @method addChildToPIXIContainer
 * @param child The child ( PIXI object ) to be added.
 * @param zOrder The z order of the associated object.
 */
gdjs.Layer.prototype.addChildToPIXIContainer = function(child, zOrder) {
	child.zOrder = zOrder; //Extend the pixi object with a z order.

	for( var i = 0, len = this._pixiContainer.children.length; i < len;++i) {
		if ( this._pixiContainer.children[i].zOrder >= zOrder ) { //TODO : Dichotomic search
			this._pixiContainer.addChildAt(child, i);
			return;
		}
	}
	this._pixiContainer.addChild(child);
}

/**
 * Change the z order of a child associated to an object.
 *
 * @method changePIXIContainerChildZOrder
 * @param child The child ( PIXI object ) to be modified.
 * @param newZOrder The z order of the associated object.
 */
gdjs.Layer.prototype.changePIXIContainerChildZOrder = function(child, newZOrder) {
	this._pixiContainer.removeChild(child);
	this.addChildToPIXIContainer(child, newZOrder);
}

/**
 * Remove a child from the internal pixi container.<br>
 * Should be called when an object is deleted or removed from the layer.
 *
 * @method removePIXIContainerChild
 * @param child The child ( PIXI object ) to be removed.
 */
gdjs.Layer.prototype.removePIXIContainerChild = function(child) {
	this._pixiContainer.removeChild(child);
}

/**
 * Change the camera X position.<br>
 * The camera position refers to the position of top left point of the rendered view,
 * expressed in world coordinates.
 *
 * @method getCameraX
 * @param cameraId The camera number. Currently ignored.
 * @return The x position of the camera
 */
gdjs.Layer.prototype.getCameraX = function(cameraId) {
	return this._cameraX;
}

/**
 * Change the camera Y position.<br>
 * The camera position refers to the position of top left point of the rendered view,
 * expressed in world coordinates.
 *
 * @method getCameraY
 * @param cameraId The camera number. Currently ignored.
 * @return The y position of the camera
 */
gdjs.Layer.prototype.getCameraY = function(cameraId) {
	return this._cameraY;
}

/**
 * Set the camera X position.<br>
 * The camera position refers to the position of top left point of the rendered view,
 * expressed in world coordinates.
 *
 * @method setCameraX
 * @param x {Number} The new x position
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraX = function(x, cameraId) {
	this._cameraX = x;
	this._updatePixiContainerPosition();
}

/**
 * Set the camera Y position.<br>
 * The camera position refers to the position of top left point of the rendered view,
 * expressed in world coordinates.
 *
 * @method setCameraY
 * @param y {Number} The new y position
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraY = function(y, cameraId) {
	this._cameraY = y;
	this._updatePixiContainerPosition();
}

gdjs.Layer.prototype.getCameraWidth = function(cameraId) {
	return +this._pixiRenderer.width;
}

gdjs.Layer.prototype.getCameraHeight = function(cameraId) {
	return +this._pixiRenderer.height;
}

gdjs.Layer.prototype.show = function(enable) {
	this._hidden = !enable;
	this._pixiContainer.visible = !!enable;
}

/**
 * Check if the layer is visible.<br>
 *
 * @method isVisible
 * @return true if the layer is visible.
 */
gdjs.Layer.prototype.isVisible = function() {
	return !this._hidden;
}

/**
 * Set the zoom of a camera.<br>
 *
 * @method setZoom
 * @param The new zoom. Must be superior to 0. 1 is the default zoom.
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setZoom = function(newZoom, cameraId) {
	this._pixiContainer.scale.x = newZoom;
	this._pixiContainer.scale.y = newZoom;
}

/**
 * Get the zoom of a camera,.<br>
 *
 * @method getZoom
 * @param cameraId The camera number. Currently ignored.
 * @return The zoom.
 */
gdjs.Layer.prototype.getZoom = function(cameraId) {
	return this._pixiContainer.scale.x;
}

/**
 * Get the rotation of the camera, expressed in degrees.<br>
 *
 * @method getCameraRotation
 * @param cameraId The camera number. Currently ignored.
 * @return The rotation, in degrees.
 */
gdjs.Layer.prototype.getCameraRotation = function(cameraId) {
	return this._cameraRotation;
}

/**
 * Set the rotation of the camera, expressed in degrees.<br>
 * The rotation is made around the camera center.
 *
 * @method setCameraRotation
 * @param rotation {Number} The new rotation, in degrees.
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.setCameraRotation = function(rotation, cameraId) {
	this._cameraRotation = rotation;
	this._updatePixiContainerPosition();
}

/**
 * Convert a point from the canvas coordinates ( For example, the mouse position ) to the
 * "world" coordinates.
 *
 * @method convertCoords
 * @param x {Number} The x position, in canvas coordinates.
 * @param y {Number} The y position, in canvas coordinates.
 * @param cameraId The camera number. Currently ignored.
 */
gdjs.Layer.prototype.convertCoords = function(x,y, cameraId) {

	x -= this.getCameraWidth(cameraId)/2;
	y -= this.getCameraHeight(cameraId)/2;
	x /= Math.abs(this._pixiContainer.scale.x);
	y /= Math.abs(this._pixiContainer.scale.y);

	var tmp = x;
	x = Math.cos(this._cameraRotation/180*3.14159)*x - Math.sin(this._cameraRotation/180*3.14159)*y;
	y = Math.sin(this._cameraRotation/180*3.14159)*tmp + Math.cos(this._cameraRotation/180*3.14159)*y;

	return [x+this.getCameraX(cameraId)+this.getCameraWidth(cameraId)/2, 
		   y+this.getCameraY(cameraId)+this.getCameraHeight(cameraId)/2];
}


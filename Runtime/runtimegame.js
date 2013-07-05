/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The runtimeGame object represents a game being played.
 *
 * @namespace gdjs
 * @class RuntimeGame
 */
gdjs.RuntimeGame = function(data)
{
    this._variables = new gdjs.VariablesContainer();
    this._data = data;
    this._imageManager = new gdjs.ImageManager(this);
    this._minFPS = data ? parseInt(data.Info.FPSmin.attr.value) : 15;
    this._variables.initFrom(data.Variables);

    //Inputs :
    this._pressedKeys = new Hashtable();
    this._pressedMouseButtons = new Array(5);
    this._mouseX = 0;
    this._mouseY = 0;
    this._mouseWheelDelta = 0;
}

/**
 * Get the variables of the runtimeGame.
 * @method getVariables
 * @return a variablesContainer object.
 */
gdjs.RuntimeGame.prototype.getVariables = function() {
	return this._variables;
}

gdjs.RuntimeGame.prototype.getImageManager = function() {
	return this._imageManager;
}

/**
 * Get the object containing the game data
 * @method getGameData
 * @return The object associated to the game, which can be parsed with jQuery.
 */
gdjs.RuntimeGame.prototype.getGameData = function() {
	return this._data;
}

/**
 * Get the data associated to a scene.
 *
 * @method getSceneData
 * @param sceneName The name of the scene. If not defined, the first scene will be returned.
 * @return The data associated to the scene.
 */
gdjs.RuntimeGame.prototype.getSceneData = function(sceneName) {
	var scene = undefined;
	gdjs.iterateOver(this._data.Scenes, "Scene", function(sceneData) {
		if ( sceneName == undefined || sceneData.attr.nom === sceneName ) {
			scene = sceneData;
			return false;
		}
	});

	if ( scene == undefined )
		console.warn("The game has no scene called \""+sceneName+"\"");

	return scene;
}

/**
 * Check if a scene exists
 *
 * @method hasScene
 * @param sceneName The name of the scene to search.
 * @return true if the scene exists. If sceneName is undefined, true if the game has a scene.
 */
gdjs.RuntimeGame.prototype.hasScene = function(sceneName) {
	var isTrue = false;
	gdjs.iterateOver(this._data.Scenes, "Scene", function(sceneData) {
		if ( sceneName == undefined || sceneData.attr.nom == sceneName ) {
			isTrue = true;
			return false;
		}
	});

	return isTrue;
}

/**
 * Get the data representing all the initial objects of the game.
 * @method getInitialObjectsData
 * @return The data associated to the initial objects.
 */
gdjs.RuntimeGame.prototype.getInitialObjectsData = function() {
	return this._data.Objects;
}

/**
 * Should be called whenever a key is pressed
 * @method onKeyPressed
 * @param keyCode {Number} The key code associated to the key press.
 */
gdjs.RuntimeGame.prototype.onKeyPressed = function(keyCode) {
	this._pressedKeys.put(keyCode, true);
}

/**
 * Should be called whenever a key is released
 * @method onKeyReleased
 * @param keyCode {Number} The key code associated to the key release.
 */
gdjs.RuntimeGame.prototype.onKeyReleased = function(keyCode) {
	this._pressedKeys.put(keyCode, false);
}

/**
 * Return true if the key corresponding to keyCode is pressed.
 * @method isKeyPressed
 * @param keyCode {Number} The key code to be tested.
 */
gdjs.RuntimeGame.prototype.isKeyPressed = function(keyCode) {
	return this._pressedKeys.containsKey(keyCode) && this._pressedKeys.get(keyCode);
}

/**
 * Return true if any key is pressed
 * @method anyKeyPressed
 */
gdjs.RuntimeGame.prototype.anyKeyPressed = function(keyCode) {
	var allKeys = this._pressedKeys.entries();

	for(var i = 0, len = allKeys.length;i<len;++i) {
		if (allKeys[i][1]) {
			return true;
		}
	}

	return false;
}

/**
 * Should be called when the mouse is moved.<br>
 * Please note this.the coordinates must be expressed relative to the view position.
 *
 * @method onMouseMove
 * @param x {Number} The mouse new X position
 * @param y {Number} The mouse new Y position
 */
gdjs.RuntimeGame.prototype.onMouseMove = function(x,y) {
	this._mouseX = x;
	this._mouseY = y;
}

/**
 * Get the mouse X position
 *
 * @method getMouseX
 * @return the mouse X position, relative to the game view.
 */
gdjs.RuntimeGame.prototype.getMouseX = function() {
	return this._mouseX;
}

/**
 * Get the mouse Y position
 *
 * @method getMouseY
 * @return the mouse Y position, relative to the game view.
 */
gdjs.RuntimeGame.prototype.getMouseY = function() {
	return this._mouseY;
}

/**
 * Should be called whenever a mouse button is pressed
 * @method onMouseButtonPressed
 * @param buttonCode {Number} The mouse button code associated to the event.<br>0: Left button<br>1: Right button
 */
gdjs.RuntimeGame.prototype.onMouseButtonPressed = function(buttonCode) {
	this._pressedMouseButtons[buttonCode] = true;
}

/**
 * Should be called whenever a mouse button is released
 * @method onMouseButtonReleased
 * @param buttonCode {Number} The mouse button code associated to the event. ( See onMouseButtonPressed )
 */
gdjs.RuntimeGame.prototype.onMouseButtonReleased = function(buttonCode) {
	this._pressedMouseButtons[buttonCode] = false;
}

/**
 * Return true if the mouse button corresponding to buttonCode is pressed.
 * @method isMouseButtonPressed
 * @param buttonCode {Number} The mouse button code.<br>0: Left button<br>1: Right button
 */
gdjs.RuntimeGame.prototype.isMouseButtonPressed = function(buttonCode) {
	return this._pressedMouseButtons[buttonCode] != undefined && this._pressedMouseButtons[buttonCode];
}

/**
 * Should be called whenever the mouse wheel is used
 * @method onMouseWheel
 * @param wheelDelta {Number} The mouse wheel delta
 */
gdjs.RuntimeGame.prototype.onMouseWheel = function(wheelDelta) {
	this._mouseWheelDelta = wheelDelta;
}

/**
 * Return the mouse wheel delta
 * @method getMouseWheelDelta
 */
gdjs.RuntimeGame.prototype.getMouseWheelDelta = function() {
	return this._mouseWheelDelta;
}

/**
 * Return the minimal fps this.must be guaranteed by the game.
 * ( Otherwise, game is slowed down ).
 * @method getMinimalFramerate
 */
gdjs.RuntimeGame.prototype.getMinimalFramerate = function() {
	return this._minFPS;
}


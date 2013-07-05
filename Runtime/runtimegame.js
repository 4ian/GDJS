/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The runtimeGame object represents a game being played.
 *
 * @namespace gdjs
 * @class runtimeGame
 */
gdjs.runtimeGame = function(data)
{
    var that = {};
    var my = {};

    my.variables = gdjs.variablesContainer();
    my.data = data;
    my.imageManager = gdjs.imageManager(that);
    my.minFPS = data ? parseInt(data.Info.FPSmin.attr.value) : 15;
    my.variables.initFrom(data.Variables);

    //Inputs :
    my.pressedKeys = new Hashtable();
    my.pressedMouseButtons = new Array(5);
    my.mouseX = 0;
    my.mouseY = 0;
    my.mouseWheelDelta = 0;

    /**
     * Get the variables of the runtimeGame.
     * @method getVariables
     * @return a variablesContainer object.
     */
    that.getVariables = function() {
        return my.variables;
    }

    that.getImageManager = function() {
        return my.imageManager;
    }

    /**
     * Get the object containing the game data
     * @method getGameData
     * @return The object associated to the game, which can be parsed with jQuery.
     */
    that.getGameData = function() {
        return my.data;
    }

    /**
     * Get the data associated to a scene.
     *
     * @method getSceneData
     * @param sceneName The name of the scene. If not defined, the first scene will be returned.
     * @return The data associated to the scene.
     */
    that.getSceneData = function(sceneName) {
        var scene = undefined;
        gdjs.iterateOver(my.data.Scenes, "Scene", function(sceneData) {
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
    that.hasScene = function(sceneName) {
        var isTrue = false;
        gdjs.iterateOver(my.data.Scenes, "Scene", function(sceneData) {
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
    that.getInitialObjectsData = function() {
        return my.data.Objects;
    }

    /**
     * Should be called whenever a key is pressed
     * @method onKeyPressed
     * @param keyCode {Number} The key code associated to the key press.
     */
    that.onKeyPressed = function(keyCode) {
        my.pressedKeys.put(keyCode, true);
    }

    /**
     * Should be called whenever a key is released
     * @method onKeyReleased
     * @param keyCode {Number} The key code associated to the key release.
     */
    that.onKeyReleased = function(keyCode) {
        my.pressedKeys.put(keyCode, false);
    }

    /**
     * Return true if the key corresponding to keyCode is pressed.
     * @method isKeyPressed
     * @param keyCode {Number} The key code to be tested.
     */
    that.isKeyPressed = function(keyCode) {
        return my.pressedKeys.containsKey(keyCode) && my.pressedKeys.get(keyCode);
    }

    /**
     * Return true if any key is pressed
     * @method anyKeyPressed
     */
    that.anyKeyPressed = function(keyCode) {
        var allKeys = my.pressedKeys.entries();

        for(var i = 0, len = allKeys.length;i<len;++i) {
            if (allKeys[i][1]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Should be called when the mouse is moved.<br>
     * Please note that the coordinates must be expressed relative to the view position.
     *
     * @method onMouseMove
     * @param x {Number} The mouse new X position
     * @param y {Number} The mouse new Y position
     */
    that.onMouseMove = function(x,y) {
        my.mouseX = x;
        my.mouseY = y;
    }

    /**
     * Get the mouse X position
     *
     * @method getMouseX
     * @return the mouse X position, relative to the game view.
     */
    that.getMouseX = function() {
        return my.mouseX;
    }

    /**
     * Get the mouse Y position
     *
     * @method getMouseY
     * @return the mouse Y position, relative to the game view.
     */
    that.getMouseY = function() {
        return my.mouseY;
    }

    /**
     * Should be called whenever a mouse button is pressed
     * @method onMouseButtonPressed
     * @param buttonCode {Number} The mouse button code associated to the event.<br>0: Left button<br>1: Right button
     */
    that.onMouseButtonPressed = function(buttonCode) {
        my.pressedMouseButtons[buttonCode] = true;
    }

    /**
     * Should be called whenever a mouse button is released
     * @method onMouseButtonReleased
     * @param buttonCode {Number} The mouse button code associated to the event. ( See onMouseButtonPressed )
     */
    that.onMouseButtonReleased = function(buttonCode) {
        my.pressedMouseButtons[buttonCode] = false;
    }

    /**
     * Return true if the mouse button corresponding to buttonCode is pressed.
     * @method isMouseButtonPressed
     * @param buttonCode {Number} The mouse button code.<br>0: Left button<br>1: Right button
     */
    that.isMouseButtonPressed = function(buttonCode) {
        return my.pressedMouseButtons[buttonCode] != undefined && my.pressedMouseButtons[buttonCode];
    }

    /**
     * Should be called whenever the mouse wheel is used
     * @method onMouseWheel
     * @param wheelDelta {Number} The mouse wheel delta
     */
    that.onMouseWheel = function(wheelDelta) {
        my.mouseWheelDelta = wheelDelta;
    }

    /**
     * Return the mouse wheel delta
     * @method getMouseWheelDelta
     */
    that.getMouseWheelDelta = function() {
        return my.mouseWheelDelta;
    }

    /**
     * Return the minimal fps that must be guaranteed by the game.
     * ( Otherwise, game is slowed down ).
     * @method getMinimalFramerate
     */
    that.getMinimalFramerate = function() {
        return my.minFPS;
    }

    return that;
}

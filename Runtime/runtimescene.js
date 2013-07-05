/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The runtimeScene object represents a scene being played and rendered in the browser in a canvas.
 *
 * @class RuntimeScene 
 * @param PixiRenderer The PIXI.Renderer to be used
 */
gdjs.RuntimeScene = function(runtimeGame, pixiRenderer)
{ 
    this._eventsFunction = null;
    this._instances = new Hashtable();
    this._objects = new Hashtable();
    this._layers = new Hashtable();
    this._timers = new Hashtable();
    this._pixiRenderer = pixiRenderer;
    this._pixiStage = new PIXI.Stage();
    this._latestFrameDate = new Date;
    this._variables = new gdjs.VariablesContainer();
    this._runtimeGame = runtimeGame;
    this._lastId = 0;
    this._initialObjectsData; 
    this._elapsedTime = 0;
    this._timeScale = 1;
    this._timeFromStart = 0;
    this._firstFrame = true;
    this._soundManager = new gdjs.SoundManager();
    this._gameStopRequested = false;
    this._requestedScene = "";
    this._collisionGrid = new HSHG();
    this._isLoaded = false; // True if loadFromScene was called and the scene is being played.
    this.layers = this._layers;
    this._postPoneObjectsDeletion = false; //If set to true, objects will only be removed when doObjectsDeletion will be called ( And not at markObjectForDeletion call ).
    this._objectsToDestroy = []; //The objects to be destroyed when doObjectsDeletion is called.
} 

/**
 * Load the runtime scene from the given scene.
 * @method loadFromScene
 * @param sceneData An object containing the scene data.
 */
gdjs.RuntimeScene.prototype.loadFromScene = function(sceneData) {
	if ( sceneData == undefined ) {
		console.error("loadFromScene was called without a scene");
		return;
	}

	if ( this._isLoaded ) this.unloadScene();

	//Setup main properties
	document.title = sceneData.attr.titre;
	this._firstFrame = true;
	this.setBackgroundColor(parseInt(sceneData.attr.r), 
			parseInt(sceneData.attr.v),
			parseInt(sceneData.attr.b));

	//Load layers
    var that = this;
	gdjs.iterateOver(sceneData.Layers, "Layer", function(layerData) { 
		var name = layerData.attr.Name;

		that._layers.put(name, new gdjs.Layer(name, that));
		console.log("Created layer : \""+name+"\".");
	});

    //Load variables
    this._variables = new gdjs.VariablesContainer(sceneData.Variables);

    //Load objects
    this._initialObjectsData = sceneData.Objets;
    gdjs.iterateOver(this._initialObjectsData, "Objet", function(objData) {
        var objectName = objData.attr.nom;

        that._objects.put(objectName, objData);
        that._instances.put(objectName, []); //Also reserve an array for the instances
        console.log("Loaded "+objectName+" in memory");
    });

    //Create initial instances of objects
    gdjs.iterateOver(sceneData.Positions, "Objet", function(instanceData) {

        var objectName = instanceData.attr.nom;

        if ( that._objects.get(objectName) === null ) {
            console.log("Unable to create an instance for object"+objectName+"!");
        }
        else {

            var associatedObject = that._objects.get(objectName);
            var objectType = associatedObject.attr.type;

            var ctor = gdjs.getObjectConstructor(objectType);
            newObject = new ctor(that, associatedObject);
            newObject.setPosition(parseFloat(instanceData.attr.x), parseFloat(instanceData.attr.y));
            newObject.setZOrder(parseFloat(instanceData.attr.plan));
            newObject.setAngle(parseFloat(instanceData.attr.angle));
            newObject.setLayer(instanceData.attr.layer);
            newObject.getVariables().initFrom(instanceData.InitialVariables);
            newObject.extraInitializationFromInitialInstance(instanceData);

            that.addObject(newObject);
        }
    });

    //Set up the function to be executed at each tick
    var module = gdjs[sceneData.attr.mangledName+"Code"];
    if ( module && module.func ) this._eventsFunction = module.func;

    isLoaded = true;
}

gdjs.RuntimeScene.prototype.unloadScene = function() {
	if ( !this._isLoaded ) return;

}

/**
 * Update the list of the potentially colliding objects.
 * @method updatePotentialCollidingObjects
 */
gdjs.RuntimeScene.prototype.updatePotentialCollidingObjects = function () {
	this._collisionGrid.update();
}

/**
 * Get an array of potentially colliding objects having the specified name identifiers.<br>
 * You need to call updatePotentialCollidingObjects method before calling this.
 *
 * @method getPotentialCollidingObjects
 * @param obj1NameId {Number} The number representing the first objects.
 * @param obj2NameId {Number} The number representing the second objects.
 */
gdjs.RuntimeScene.prototype.getPotentialCollidingObjects = function(obj1NameId, obj2NameId) {

	var pairs = this._collisionGrid.queryForCollisionPairs(obj1NameId, obj2NameId,
			gdjs.RuntimeObject.collisionTest);
	return pairs;
}


/**
 * Set the function called each time the runtimeScene is stepped.<br>
 * The function will be passed the runtimeScene as argument.
 *
 * Note this.this is already set up by the runtimeScene constructor and this.you should
 * not need to use this method.
 *
 * @method setEventsFunction
 * @param The function to be called.
 */
gdjs.RuntimeScene.prototype.setEventsFunction = function(func) {
	this._eventsFunction = func;
}

/**
 * Step and render the scene.<br>
 * Should be called in a game loop.
 *
 * @method renderAndStep
 * @return true if the game loop should continue, false if a scene change or a game stop was
 * requested.
 */
gdjs.RuntimeScene.prototype.renderAndStep = function() {
	this._updateTime();
	this._updateObjectsPreEvents();
	this._eventsFunction(this);
	this._updateObjects();
	this.render();

	this._firstFrame = false;

	return this._requestedScene == "" && !this._gameStopRequested;
}

/** 
 * Render the PIXI stage associated to the runtimeScene.
 * @method render
 */
gdjs.RuntimeScene.prototype.render = function(){    
	// render the PIXI stage   
	this._pixiRenderer.render(this._pixiStage);
}

/**
 * Called when rendering to do all times related tasks.
 * @method updateTime
 * @private
 */
gdjs.RuntimeScene.prototype._updateTime = function() {
	//Compute the elapsed time since last frame
	this._elapsedTime = Date.now() - this._latestFrameDate;
	this._latestFrameDate = Date.now();
	this._elapsedTime = Math.min(this._elapsedTime, 1000/this._runtimeGame.getMinimalFramerate());
	this._elapsedTime *= this._timeScale;

	//Update timers and others members
	var timers = this._timers.values();
	for ( var i = 0, len = timers.length;i<len;++i) {
		timers[i].updateTime(this._elapsedTime);
	}
	this._timeFromStart += this._elapsedTime;
}

gdjs.RuntimeScene.prototype._doObjectsDeletion = function() {
	for(var k =0, lenk=this._objectsToDestroy.length;k<lenk;++k)
		this._removeObject(this._objectsToDestroy[k]);

	this._objectsToDestroy.length = 0;
}

/**
 * Update the objects before launching the events.
 * @method updateObjectsPreEvents
 * @private
 */
gdjs.RuntimeScene.prototype._updateObjectsPreEvents = function() {
	var allObjectsLists = this._instances.entries();

	this._postPoneObjectsDeletion = true;
	for( var i = 0, len = allObjectsLists.length;i<len;++i) {
		for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
			allObjectsLists[i][1][j].stepAutomatismsPreEvents(this);
		}
	}
	this._postPoneObjectsDeletion = false;
	this._doObjectsDeletion();
}

/**
 * Update the objects (update positions, time management...)
 * @method updateObjects
 * @private
 */
gdjs.RuntimeScene.prototype._updateObjects = function() {
	var allObjectsLists = this._instances.entries();

	this.updateObjectsForces(allObjectsLists);

	this._postPoneObjectsDeletion = true;
	for( var i = 0, len = allObjectsLists.length;i<len;++i) {
		for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
			var obj = allObjectsLists[i][1][j];
			obj.updateTime(this._elapsedTime/1000);
			obj.stepAutomatismsPostEvents(this);
		}
	}
	this._postPoneObjectsDeletion = false;
	this._doObjectsDeletion();
}

/**
 * Change the background color
 * @method setBackgroundColor
 */
gdjs.RuntimeScene.prototype.setBackgroundColor = function(r,g,b) {
	this._pixiStage.setBackgroundColor(parseInt(gdjs.rgbToHex(r,g,b),16));
}

/**
 * Update the objects positions according to their forces
 * @method updateObjectsForces
 */
gdjs.RuntimeScene.prototype.updateObjectsForces = function(objects) {
	var allObjectsLists = objects ? objects : this._instances.entries();

	for( var i = 0, len = allObjectsLists.length;i<len;++i) {
		for( var j = 0, listLen = allObjectsLists[i][1].length;j<listLen;++j) {
			var obj = allObjectsLists[i][1][j];
			if ( !obj.hasNoForces() ) {
				var averageForce = obj.getAverageForce();

				obj.setX(obj.getX() + averageForce.getX()*this._elapsedTime/1000);
				obj.setY(obj.getY() + averageForce.getY()*this._elapsedTime/1000);
				obj.updateForces();
			}
		}
	}
}

/**
 * Add an object to the instances living on the scene.
 * @method addObject
 * @param obj The object to be added.
 */
gdjs.RuntimeScene.prototype.addObject = function(obj) {
	if ( !this._instances.containsKey(obj.name) ) {
		console.log("RuntimeScene.addObject: No objects called \""+obj.name+"\"! Adding it.");
		this._instances.put(obj.name, []);
	}

	this._instances.get(obj.name).push(obj);
	this._collisionGrid.addObject(obj);
}

/**
 * Get all the instances of the object called name.
 * @method getObjects
 * @param name Name of the object the instances must be returned.
 */
gdjs.RuntimeScene.prototype.getObjects = function(name){
	if ( !this._instances.containsKey(name) ) {
		console.log("RuntimeScene.getObjects: No instances called \""+name+"\"! Adding it.");
		this._instances.put(name, []);
	}

	return this._instances.get(name);
}

/**
 * Remove an object from the scene, deleting it from the list of instances.<br>
 * Most of the time, do not call this method directly: Use markObjectForDeletion method
 * which will remove the objects either directly or when it can be done safely.
 *
 * @method getObjects
 * @param obj The object to be removed from the scene.
 * @private
 */
gdjs.RuntimeScene.prototype._removeObject = function(obj) {
	this._collisionGrid.removeObject(obj);

	if ( !this._instances.containsKey(obj.getName()) ) return;

	var objId = obj.id;
	var allInstances = this._instances.get(obj.getName());
	for(var i = 0, len = allInstances.length;i<len;++i) {
		if (allInstances[i].id == objId) {
			allInstances.remove(i);
			return;
		}
	}
}

/**
 * Must be called whenever an object must be removed from the scene.
 * @method markObjectForDeletion
 * @param object The object to be removed.
 */
gdjs.RuntimeScene.prototype.markObjectForDeletion = function(obj) {
	if ( this._postPoneObjectsDeletion ) {
		if ( this._objectsToDestroy.indexOf(obj) === -1 ) this._objectsToDestroy.push(obj);
		return;
	}

	this._removeObject(obj);
}

/**
 * Return the time elapsed since the last frame, in milliseconds.
 * @method getElapsedTime
 */
gdjs.RuntimeScene.prototype.getElapsedTime = function() {
	return this._elapsedTime;
}

/**
 * Create an identifier for a new object.
 * @method createNewUniqueId
 */
gdjs.RuntimeScene.prototype.createNewUniqueId = function() {
	this._lastId++;
	return this._lastId;
}

/**
 * Get the PIXI.Stage associated to the RuntimeScene.
 * @method getPIXIStage
 */
gdjs.RuntimeScene.prototype.getPIXIStage = function() {
	return this._pixiStage;
}

/**
 * Get the PIXI renderer associated to the RuntimeScene.
 * @method getPIXIRenderer
 */
gdjs.RuntimeScene.prototype.getPIXIRenderer = function() {
	return this._pixiRenderer;
}

/**
 * Get the runtimeGame associated to the RuntimeScene.
 * @method getGame
 */
gdjs.RuntimeScene.prototype.getGame = function() {
	return this._runtimeGame;
}

/**
 * Get the variables of the runtimeScene.
 * @method getVariables
 * @return The container holding the variables of the scene.
 */
gdjs.RuntimeScene.prototype.getVariables = function() {
	return this._variables;
}

/**
 * Get the data representing all the initial objects of the scene.
 * @method getInitialObjectsData
 */
gdjs.RuntimeScene.prototype.getInitialObjectsData = function() {
	return this._initialObjectsData;
}

gdjs.RuntimeScene.prototype.getLayer = function(name) {
	if ( this._layers.containsKey(name) )
		return this._layers.get(name);

	return this._layers.get("");
}

gdjs.RuntimeScene.prototype.hasLayer = function(name) {
	return this._layers.containsKey(name);
}

gdjs.RuntimeScene.prototype.addTimer = function(name) {
	this._timers.put(name, new gdjs.Timer(name));
}

gdjs.RuntimeScene.prototype.hasTimer = function(name) {
	return this._timers.containsKey(name);
}

gdjs.RuntimeScene.prototype.getTimer = function(name) {
	return this._timers.get(name);
}

gdjs.RuntimeScene.prototype.removeTimer = function(name) {
	if ( this._timers.containsKey(name) ) this._timers.remove(name);
}

gdjs.RuntimeScene.prototype.getTimeFromStart = function() {
	return this._timeFromStart;
}

/**
 * Get the soundManager of the scene.
 * @return The soundManager of the scene.
 */
gdjs.RuntimeScene.prototype.getSoundManager = function() {
	return this._soundManager;
}

/**
 * Return true if the scene is rendering its first frame.
 * @method isFirstFrame
 */
gdjs.RuntimeScene.prototype.isFirstFrame = function() {
	return this._firstFrame;
}

/**
 * Set the time scale of the scene
 * @method setTimeScale
 * @param timeScale {Number} The new time scale ( Must be positive ).
 */
gdjs.RuntimeScene.prototype.setTimeScale = function(timeScale) {
	if ( timeScale >= 0 ) this._timeScale = timeScale;
}

/**
 * Get the time scale of the scene
 * @method getTimeScale
 */
gdjs.RuntimeScene.prototype.getTimeScale = function() {
	return this._timeScale;
}

/**
 * Return true if the scene requested the game to be stopped.
 * @method gameStopRequested
 */
gdjs.RuntimeScene.prototype.gameStopRequested = function() { 
	return this._gameStopRequested;
}

/**
 * When called, the scene will be flagged as requesting the game to be stopped.<br>
 * ( i.e: gameStopRequested will return true ).
 *
 * @method requestGameStop
 */
gdjs.RuntimeScene.prototype.requestGameStop = function() {
	this._gameStopRequested = true;
}

/**
 * Return the name of the new scene to be launched instead of this one.
 * @method getRequestedScene
 */
gdjs.RuntimeScene.prototype.getRequestedScene = function() { 
	return this._requestedScene;
}

/**
 * When called, the scene will be flagged as requesting a new scene to be launched.
 *
 * @method requestSceneChange
 */
gdjs.RuntimeScene.prototype.requestSceneChange = function(sceneName) {
	this._requestedScene = sceneName;
}


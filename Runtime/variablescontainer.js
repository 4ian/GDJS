/*
 * Game Develop JS Platform
 * Copyright 2013-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * VariablesContainer stores variables, usually for a a RuntimeGame, a RuntimeScene
 * or a RuntimeObject.
 *
 * @namespace gdjs
 * @class VariablesContainer
 * @constructor
 * @param initialVariablesData Optional object containing initial variables.
 */
gdjs.VariablesContainer = function(initialVariablesData)
{
    if ( this._variables == undefined ) this._variables = new Hashtable();
    if ( this._variablesArray == undefined ) this._variablesArray = [];

    if ( initialVariablesData != undefined ) this.initFrom(initialVariablesData);
};

/**
 * Initialize variables from a container data.<br>
 * If keepOldVariables is set to false ( by default ), all already existing variables will be
 * erased, but the new variables will be accessible thanks to getFromIndex. <br>
 * if keepOldVariables is set to true, already existing variables won't be erased and will be
 * still accessible thanks to getFromIndex.
 *
 * @method initFrom
 * @param data The object containing the variables.
 * @param keepOldVariables {Boolean} If set to true, already existing variables won't be erased.
 */
gdjs.VariablesContainer.prototype.initFrom = function(data, keepOldVariables) {
    if ( keepOldVariables == undefined ) keepOldVariables = false;
    if ( !keepOldVariables ) var deletedVars = this._variables.keys();

    var that = this;
    var i = 0;
	gdjs.iterateOverArray(data, function(varData) {

        //Get the variable:
        var variable = that.get(varData.name);
        gdjs.Variable.call(variable, varData);

        if ( !keepOldVariables ) {
            //Register the variable in the extra array to ensure a fast lookup using getFromIndex.
            if ( i < that._variablesArray.length )
                that._variablesArray[i] = variable;
            else
                that._variablesArray.push(variable);

            ++i;

            //Remove the variable from the list of variables to be deleted.
            var idx = deletedVars.indexOf(varData.name)
            if (idx !== -1) deletedVars[idx] = undefined;
        }
	});

    if ( !keepOldVariables ) {
        this._variablesArray.length = i;

        //If we do not want to keep the already existing variables,
        //remove all the variables not assigned above.
        //(Here, remove means flag the variable as not existing, to avoid garbage creation ).
        for(var i =0, len = deletedVars.length;i<len;++i) {
            if ( deletedVars[i] != undefined )
                this._variables.get(deletedVars[i]).setUndefinedInContainer();
        }
    }
};

/**
 * Add a new variable.
 * @method add
 * @param name {String} Variable name
 * @param variable The variable to be added
 */
gdjs.VariablesContainer.prototype.add = function(name, variable) {
	this._variables.put(name, variable);
};

/**
 * Remove a variable.<br>
 * ( In fact, the variable is not really removed from the container to avoid creating garbage )
 * @method remove
 * @param name {String} Variable to be removed
 */
gdjs.VariablesContainer.prototype.remove = function(name) {
	if ( this._variables.containsKey(name) ) {
        this._variables.get(name).setUndefinedInContainer();
    }
};

/**
 * Get a variable.
 * @method get
 * @param name {String} The variable's name
 * @return The specified variable. If not found, an empty variable is added to the container.
 */
gdjs.VariablesContainer.prototype.get = function(name) {
    var variable = null;
	if ( !this._variables.containsKey(name) ) { //Add automatically inexisting variables.
        variable = new gdjs.Variable();
        this._variables.put(name, variable);
	}
    else {
        variable = this._variables.get(name);
        if ( variable.isUndefinedInContainer() ) { //Reuse variables removed before.
            gdjs.Variable.call(variable);
        }
    }

	return variable;
};

/**
 * Get a variable using its index.<br>
 * The index of a variable is its index in the data passed to initFrom.<br>
 *
 * This method is generally used by events generated code to increase lookup speed for variables.<br>
 * If you're unsure about how to use this method, prefer to use get.
 *
 * @method getFromIndex
 * @param id {Number} The variable index
 * @return The specified variable. If not found, an empty variable is added to the container, but it
 * should not happen.
 */
gdjs.VariablesContainer.prototype.getFromIndex = function(id) {
	if ( id >= this._variablesArray.length ) { //Add automatically inexisting variables.
        var variable = new gdjs.Variable();
        return this._variables.put(name, variable);
	}
    else {
        var variable = this._variablesArray[id];
        if ( variable.isUndefinedInContainer() ) { //Reuse variables removed before.
            gdjs.Variable.call(variable);
        }
        return variable;
    }
};

/**
 * Check if a variable exists in the container
 * @method has
 * @param name {String} The variable's name
 * @return true if the variable exists.
 */
gdjs.VariablesContainer.prototype.has = function(name) {
	return this._variables.containsKey(name) && !this._variables.get(name).isUndefinedInContainer();
};


/**
 * "Bad" variable container, used by events when no other valid container can be found.
 * This container has no state and always returns the bad variable ( see gdjs.VariablesContainer.badVariable ).
 * @static
 */
gdjs.VariablesContainer.badVariablesContainer = {
    has: function() {return false;},
    getFromIndex : function() { return gdjs.VariablesContainer.badVariable; },
    get : function() { return gdjs.VariablesContainer.badVariable; },
    remove : function() { return; },
    add : function() { return; },
    initFrom : function() { return; }
};

/**
 * "Bad" variable, used by events when no other valid variable can be found.
 * This variable has no state and always return 0 or the empty string.
 * @static
 */
gdjs.VariablesContainer.badVariable = {
    getChild : function() { return gdjs.VariablesContainer.badVariable; },
    hasChild: function() {return false;},
    isStructure: function() {return false;},
    isNumber: function() {return true;},
    removeChild : function() { return; },
    setNumber : function() { return; },
    setString : function() { return; },
    getAsString : function() { return ""; },
    getAsNumber : function() { return 0; },
    getAllChildren : function() { return {}; },
    add : function() { return; },
    sub : function() { return; },
    mul : function() { return; },
    div : function() { return; },
    concatenate : function() { return; },
    setUndefinedInContainer : function() { return; },
    isUndefinedInContainer : function() { return; }
};
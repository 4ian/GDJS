/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The variablesContainer stores variables for a runtimeScene or a runtimeObject.
 * @namespace gdjs
 * @class VariablesContainer
 * @constructor
 * @param initialVariablesData Optional object containing initial variables.
 */
gdjs.VariablesContainer = function(initialVariablesData)
{
    this._variables = new Hashtable();
    
    if ( initialVariablesData != undefined ) this.initFrom(initialVariablesData);
}

/**
 * Initialize variables from a container data.
 * @method initFrom
 * @param data The object containing the variables.
 */
gdjs.VariablesContainer.prototype.initFrom = function(data) {
    var that = this;
	gdjs.iterateOver(data, "Variable", function(varData) {
		var variable = new gdjs.Variable();
		var initialValue = varData.attr.Value;
		//Try to guess the type of the value, as GD has no way ( for now ) to specify
		//the type of a variable.
		if(!isNaN(initialValue)) {  //Number
			variable.setNumber(parseFloat(initialValue));
		}
		else { //We have a string ( Maybe empty ).
			if ( initialValue.length === 0 )
				variable.setNumber(0);
			else
				variable.setString(initialValue);
		}

		that._variables.put(varData.attr.Name, variable);
	});
}

/**
 * Add a new variable.
 * @method add
 * @param name {String} Variable name
 * @param variable The variable to be added
 */
gdjs.VariablesContainer.prototype.add = function(name, variable) {
	this._variables.put(name, variable);
}

/**
 * Remove a variable.
 * @method remove
 * @param name {String} Variable to be removed
 */
gdjs.VariablesContainer.prototype.remove = function(name) {
	this._variables.remove(name);
}

/**
 * Get a variable.
 * @method get
 * @param name {String} The variable's name
 * @return The specified variable. If not found, an empty variable is added to the container.
 */
gdjs.VariablesContainer.prototype.get = function(name) {
	if ( !this._variables.containsKey(name) ) {
		this._variables.put(name, new gdjs.Variable());
	}

	return this._variables.get(name);
}

/**
 * Check if a variable exists in the container
 * @method has
 * @param name {String} The variable's name
 * @return true if the variable exists.
 */
gdjs.VariablesContainer.prototype.has = function(name) {
	return this._variables.containsKey(name);
}


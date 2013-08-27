/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
}

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
	gdjs.iterateOver(data, "Variable", function(varData) {
		
        //Get the variable:
        var variable = that.get(varData.attr.Name); 

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
        
        if ( !keepOldVariables ) {
            //Register the variable in the extra array to ensure a fast lookup using getFromIndex.
            if ( i < that._variablesArray.length )
                that._variablesArray[i] = variable;
            else
                that._variablesArray.push(variable);
            
            ++i;
        
            //Remove the variable from the list of variables to be deleted.
            var idx = deletedVars.indexOf(varData.attr.Name)
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
 * @static
 */
gdjs.VariablesContainer.badVariablesContainer = gdjs.VariablesContainer();

/**
 * "Bad" variable, used by events when no other valid variable can be found.
 * @static
 */
gdjs.VariablesContainer.badVariable = gdjs.Variable();
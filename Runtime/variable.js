/*
 * Game Develop JS Platform
 * Copyright 2013-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * A Variable is an object storing a value (number or a string) or children variables.
 *
 * @constructor
 * @namespace gdjs
 * @class Variable
 * @param varData optional object used to initialize the variable.
 */
gdjs.Variable = function(varData)
{
    this._value = 0;
    this._str = "";
    this._numberDirty = false;
    this._stringDirty = true;
    this._isStructure = false;
    this._children = {};
    this._undefinedInContainer = false;

	if ( varData !== undefined ) {
		if ( varData.value !== undefined ) { //Variable is a string or a number
			var initialValue = varData.value;

			//Try to guess the type of the value, as GD has no way ( for now ) to specify
			//the type of a variable.
			var valueWhenConsideredAsNumber = parseFloat(initialValue, 10);
			if(valueWhenConsideredAsNumber === valueWhenConsideredAsNumber) { //"Since NaN is the only JavaScript value that is treated as unequal to itself, you can always test if a value is NaN by checking it for equality to itself"
				this._value = parseFloat(initialValue, 10);
			}
			else { //We have a string (Maybe empty).
				if ( initialValue.length === 0 )
					this._value = 0;
				else {
					this._str = initialValue;
					this._numberDirty = true;
					this._stringDirty = false;
				}
			}
		}
		else { //Variable is a structure
			this._isStructure = true;

			if (varData.children !== undefined) {
				var that = this;
				gdjs.iterateOverArray(varData.children, function(childData) {
					that._children[childData.name] = new gdjs.Variable(childData);
				});
			}
		}
	}
};


/**
 * Used ( usually by VariablesContainer ) to set that the variable must be
 * considered as not existing in the container.
 * @method setUndefinedInContainer
 */
gdjs.Variable.prototype.setUndefinedInContainer = function() {
    this._undefinedInContainer = true;
};

/**
 * Check if the variable must be considered as not existing in its container
 * ( Usually a VariablesContainer ).
 * @method isUndefinedInContainer
 * @return true if the container must consider that the variable does not exist.
 */
gdjs.Variable.prototype.isUndefinedInContainer = function() {
    return this._undefinedInContainer;
};

/**
 * Get the child with the specified name.
 *
 * If the variable has not the specified child, an empty variable with the specified name
 * is added as child.
 * @method getChild
 */
gdjs.Variable.prototype.getChild = function(childName) {

	if ( this._children.hasOwnProperty(childName) && this._children[childName] !== undefined )
		return this._children[childName];

	this._isStructure = true;
	this._children[childName] = new gdjs.Variable();
	return this._children[childName];
};

/**
 * Get the child with the specified name.
 *
 * If the variable has not the specified child, an empty variable with the specified name
 * is added as child.
 * @method getChild
 */
gdjs.Variable.prototype.hasChild = function(childName) {
	return (this._isStructure && this._children.hasOwnProperty(childName) );
};

/**
 * Remove the child with the specified name.
 *
 * If the variable has not the specified child, nothing is done.
 * @method removeChild
 * @param childName The name of the child to be removed
 */
gdjs.Variable.prototype.removeChild = function(childName) {
	if ( !this._isStructure ) return;
	delete this._children[childName];
}

/**
 * Get the value of the variable, considered as a number
 * @method getAsNumber
 * @return {Number} The number stored
 */
gdjs.Variable.prototype.getAsNumber = function() {
	if ( this._numberDirty ) {
		this._value = parseFloat(this._str, 10);
		if ( this._value !== this._value ) this._value = 0; //Ensure NaN is not returned as a value.
		this._numberDirty = false;
	}

	return this._value;
};

/**
 * Change the value of the variable, considered as a number
 * @method setNumber
 * @param newValue {Number} The new value to be set
 */
gdjs.Variable.prototype.setNumber = function(newValue) {
	this._value = newValue;
	this._stringDirty = true;
	this._numberDirty = false;
};

/**
 * Get the value of the variable, considered as a string
 * @method getAsString
 * @return {String} The number stored
 */
gdjs.Variable.prototype.getAsString = function() {
	if ( this._stringDirty ) {
		this._str = this._value.toString();
		this._stringDirty = false;
	}

	return this._str;
};

/**
 * Change the value of the variable, considered as a string
 * @method setString
 * @param newValue {String} The new string to be set
 */
gdjs.Variable.prototype.setString = function(newValue) {
	this._str = newValue;
	this._numberDirty = true;
	this._stringDirty = false;
};

/**
 * Return true if the variable is a structure.
 * @method isStructure
 */
gdjs.Variable.prototype.isStructure = function() {
	return this._isStructure;
};

/**
 * Return true if the variable is a number.
 * @method isNumber
 */
gdjs.Variable.prototype.isNumber = function() {
	return !this._isStructure && !this._numberDirty;
};

/**
 * Return the object containing all the children of the variable
 * @method getAllChildren
 */
gdjs.Variable.prototype.getAllChildren = function() {
	return this._children;
}

gdjs.Variable.prototype.add = function(val) {
	this.setNumber(this.getAsNumber()+val);
};
gdjs.Variable.prototype.sub = function(val) {
	this.setNumber(this.getAsNumber()-val);
};
gdjs.Variable.prototype.mul = function(val) {
	this.setNumber(this.getAsNumber()*val);
};
gdjs.Variable.prototype.div = function(val) {
	this.setNumber(this.getAsNumber()/val);
};

gdjs.Variable.prototype.concatenate = function(str) {
	this.setString(this.getAsString()+str);
};

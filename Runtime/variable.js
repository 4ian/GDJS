/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * A Variable is an object storing a value (number or a string) or children variables.
 *
 * @constructor
 * @namespace gdjs
 * @class Variable
 */
gdjs.Variable = function()
{
    this._value = 0;
    this._str = "";
    this._numberDirty = false;
    this._stringDirty = true;
    this._isStructure = false;
    this._children = {};
    this._undefinedInContainer = false;
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

	if ( this._children.hasOwnProperty(childName) )
		return this._children[childName];

	this._isStructure = true;
	this._children[childName] = gdjs.Variable();
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
 * Get the value of the variable, considered as a number
 * @method getAsNumber
 * @return {Any} The number stored
 */
gdjs.Variable.prototype.getAsNumber = function() {
	if ( this._numberDirty ) {
		this._value = parseFloat(this._str);
		this._numberDirty = false;
	}

	return this._value;
};

/**
 * Change the value of the variable, considered as a number
 * @method setNumber
 * @param newValue {Any} The new value to be set
 */
gdjs.Variable.prototype.setNumber = function(newValue) {
	this._value = newValue;
	this._stringDirty = true;
	this._numberDirty = false;
};

/**
 * Get the value of the variable, considered as a string
 * @method getAsString
 * @return {Any} The number stored
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
 * @param newValue {Any} The new string to be set
 */
gdjs.Variable.prototype.setString = function(newValue) {
	this._str = newValue;
	this._numberDirty = true;
	this._stringDirty = false;
};

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

/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * The imageManager stores textures this.can be used by the objects
 *
 * @class ImageManager
 * @namespace gdjs
 * @param runtimeGame The runtimeGame to be imageManager belongs to.
 */
gdjs.ImageManager = function(runtimeGame)
{
    this._game = runtimeGame;
    this._invalidTexture = PIXI.Texture.fromImage("bunny.png"); //TODO
    this._loadedTextures = new Hashtable();
}

gdjs.ImageManager.prototype.getPIXITexture = function(name) {
	if ( this._loadedTextures.containsKey(name) ) {
		return this._loadedTextures.get(name);
	}
	if ( name == "" ) {
		return this._invalidTexture;
	}

	var resources = this._game.getGameData().Resources.Resources;
	if ( resources ) {
		var texture = null;
		gdjs.iterateOver(resources, "Resource", function(res) {
			if ( res.attr.name === name &&
				res.attr.kind === "image" ) {

				texture = PIXI.Texture.fromImage(res.attr.file);
				return false;
			}
		});

		if ( texture != null ) {
			console.log("Loaded texture \""+name+"\".");
			this._loadedTextures.put(name, texture);
			return texture;
		}
	}

	console.warn("Unable to find texture \""+name+"\".");
	return this._invalidTexture;
}

gdjs.ImageManager.prototype.getInvalidPIXITexture = function() {
	return this._invalidTexture;
}


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
    this._loadedPow2ConvertedTextures = new Hashtable();
};

/**
 * Return the PIXI texture associated to the specified name.
 * Returns a placeholder texture if not found.
 * @param name The name of the texture to get.
 * @method getPIXITexture
 */
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
};

/**
 * Return the PIXI texture associated to the specified name, ensuring that this texture is a power of 2
 * ( If not a power of 2, a resized texture is returned )
 *
 * @param name The name of the texture to get.
 * @method getPowerOf2PIXITexture
 */
gdjs.ImageManager.prototype.getPowerOf2PIXITexture = function(name) {
	var pixiTexture = this.getPIXITexture(name);
    if (!isPowerOfTwo(pixiTexture.baseTexture.width) || !isPowerOfTwo(pixiTexture.baseTexture.height)) {

		//Return a cached version of the resized texture
		if ( this._loadedPow2ConvertedTextures.containsKey(name) ) {
			return this._loadedPow2ConvertedTextures.get(name);
		}

		//No cached version: Use a render texture to resize the texture to a power of 2.
		var newWidth = nearestPowerOf2(pixiTexture.baseTexture.width);
		var newHeight = nearestPowerOf2(pixiTexture.baseTexture.height);

		var renderTexture = new PIXI.RenderTexture(newWidth, newHeight);
		var sprite = new PIXI.Sprite(pixiTexture);
		var doc = new PIXI.DisplayObjectContainer();
		doc.addChild(sprite);
		sprite.scale.x = newWidth/pixiTexture.baseTexture.width;
		sprite.scale.y = newHeight/pixiTexture.baseTexture.height;
		renderTexture.render(doc);

		this._loadedPow2ConvertedTextures.put(name, renderTexture);
		return renderTexture;
    }

    return pixiTexture;
};
 
function isPowerOfTwo(x) {
    return (x & (x - 1)) == 0;
}
 
function nearestPowerOf2(x) {
    return Math.pow(2, Math.round(Math.log(x) / Math.LN2));
}

/**
 * Return a PIXI texture which can be used as a placeholder when no
 * suitable texture can be found.
 * @method getInvalidPIXITexture
 */
gdjs.ImageManager.prototype.getInvalidPIXITexture = function() {
	return this._invalidTexture;
};


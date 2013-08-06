/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * A wrapper around an Audio object.
 * @namespace gdjs
 * @class Sound
 * @private
 */
gdjs.Sound = function(soundFile) {
	this.audio = new Audio(soundFile || "");
	this._volume = 100;
}

gdjs.Sound.prototype.setVolume = function(volume, globalVolume) {
	this._volume = volume;
	this.updateVolume(globalVolume);
}

gdjs.Sound.prototype.updateVolume = function(globalVolume) {
	this.audio.volume = this._volume/100*globalVolume/100;
}

gdjs.Sound.prototype.getVolume = function() {
	return this._volume;
}

gdjs.Sound.prototype.hasEnded = function() {
	return !this.audio.loop && this.audio.currentTime == this.audio.duration;
}

/**
 * SoundManager is used to manage the sounds and musics of a RuntimeScene.
 *
 * @namespace gdjs
 * @class SoundManager
 * @constructor
 */
gdjs.SoundManager = function()
{
    this._sounds = [];
    this._musics = [];
    this._freeSounds = []; //Sounds without an assigned channel.
    this._freeMusics = []; //Musics without an assigned channel.
    this._globalVolume = 100;
}

gdjs.SoundManager.prototype._getRecyledResource = function(arr) {
	//Try to recycle an old sound.
	for(var i = 0, len = arr.length;i<len;++i) {
		if (arr[i] != null && arr[i].hasEnded() ) {
			return arr[i];
		}
	}

	theSound = new gdjs.Sound();
	arr.push(theSound);
	return theSound;
}

gdjs.SoundManager.prototype.playSound = function(soundFile, loop, volume, pitch) {
	var theSound = this._getRecyledResource(this._freeSounds);

	theSound.audio.src = soundFile;
	theSound.audio.loop = loop;
	theSound.setVolume(volume, this._globalVolume);
	theSound.audio.play();
}

gdjs.SoundManager.prototype.playSoundOnChannel = function(soundFile, channel, loop, volume, pitch) {
	if ( this._sounds[channel] == null ) {
		this._sounds[channel] = new gdjs.Sound();;
	}

	var theSound = this._sounds[channel];

	theSound.audio.src = soundFile;
	theSound.audio.loop = loop;
	theSound.setVolume(volume, this._globalVolume);
	theSound.audio.play();
}

gdjs.SoundManager.prototype.stopSoundOnChannel = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound != null ) theSound.stop();
}

gdjs.SoundManager.prototype.pauseSoundOnChannel = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound != null ) theSound.pause();
}

gdjs.SoundManager.prototype.continueSoundOnChannel = function(channel) {
	var theSound = this._sounds[channel];
	if ( theSound != null ) theSound.play();
}

gdjs.SoundManager.prototype.playMusic = function(soundFile, loop, volume, pitch) {
	var theMusic = this._getRecyledResource(this._freeMusics);

	theMusic.audio.src = soundFile;
	theMusic.audio.loop = loop;
	theMusic.setVolume(volume, this._globalVolume);
	theMusic.audio.play();
}

gdjs.SoundManager.prototype.playMusicOnChannel = function(soundFile, channel, loop, volume, pitch) {
	if ( this._musics[channel] == null ) {
		this._musics[channel] = new gdjs.Sound();;
	}

	var theMusic = this._musics[channel];

	theMusic.audio.src = soundFile;
	theMusic.audio.loop = loop;
	theMusic.setVolume(volume, this._globalVolume);
	theMusic.audio.play();
}

gdjs.SoundManager.prototype.stopMusicOnChannel = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic != null ) theMusic.stop();
}

gdjs.SoundManager.prototype.pauseMusicOnChannel = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic != null ) theMusic.pause();
}

gdjs.SoundManager.prototype.continueMusicOnChannel = function(channel) {
	var theMusic = this._musics[channel];
	if ( theMusic != null ) theMusic.play();
}

gdjs.SoundManager.prototype.setGlobalVolume = function(volume) {
	this._globalVolume = volume;

	//Update the volumes of sounds.
	for(var i = 0, len = this._freeSounds.length;i<len;++i) {
		if ( this._freeSounds[i] != null ) {
			this._freeSounds[i].updateVolume(this._globalVolume);
		}
	}
	for(var i = 0, len = this._freeMusics.length;i<len;++i) {
		if ( this._freeMusics[i] != null ) {
			this._freeMusics[i].updateVolume(this._globalVolume);
		}
	}
	for(var i = 0, len = this._sounds.length;i<len;++i) {
		if ( this._sounds[i] != null ) {
			this._sounds[i].updateVolume(this._globalVolume);
		}
	}
	for(var i = 0, len = this._musics.length;i<len;++i) {
		if ( this._musics[i] != null ) {
			this._musics[i].updateVolume(this._globalVolume);
		}
	}
}

gdjs.SoundManager.prototype.getGlobalVolume = function() {
	return this._globalVolume;
}

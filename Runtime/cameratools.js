/*
 * Game Develop JS Platform
 * Copyright 2013-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * @namespace gdjs.evtTools
 * @class camera
 * @private
 * @static
 */
gdjs.evtTools.camera = gdjs.evtTools.camera || {};

gdjs.evtTools.camera.setCameraX = function(runtimeScene, x, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    runtimeScene.getLayer(layer).setCameraX(x, cameraId);
}

gdjs.evtTools.camera.setCameraY = function(runtimeScene, y, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    runtimeScene.getLayer(layer).setCameraY(y, cameraId);
}

gdjs.evtTools.camera.getCameraX = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraX();
}

gdjs.evtTools.camera.getCameraY = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraY();
}

gdjs.evtTools.camera.getCameraWidth = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraWidth();
}

gdjs.evtTools.camera.getCameraHeight = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraHeight();
}

gdjs.evtTools.camera.showLayer = function(runtimeScene, layer) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).show(true);
}

gdjs.evtTools.camera.hideLayer = function(runtimeScene, layer) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).show(false);
}

gdjs.evtTools.camera.layerIsVisible = function(runtimeScene, layer) {
    return runtimeScene.hasLayer(layer) && runtimeScene.getLayer(layer).isVisible();
}

gdjs.evtTools.camera.setCameraRotation = function(runtimeScene, rotation, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).setCameraRotation(rotation, cameraId);
}
gdjs.evtTools.camera.getCameraRotation = function(runtimeScene, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return 0; }

    return runtimeScene.getLayer(layer).getCameraRotation(cameraId);
}

gdjs.evtTools.camera.setCameraZoom = function(runtimeScene, newZoom, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) ) { return; }

    return runtimeScene.getLayer(layer).setCameraZoom(newZoom, cameraId);
}

gdjs.evtTools.camera.centerCamera = function(runtimeScene, object, anticipateMove, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) || object == null ) { return; }

    var layer = runtimeScene.getLayer(layer);
    var xOffset = 0; var yOffset = 0;
    if ( anticipateMove && !object.hasNoForces() ) {
        var objectAverageForce  = object.getAverageForce();
        xOffset = objectAverageForce.getX()*runtimeScene.getElapsedTime()/1000;
        yOffset = objectAverageForce.getY()*runtimeScene.getElapsedTime()/1000;
    }

    layer.setCameraX(object.getDrawableX()+object.getCenterX(), cameraId);
    layer.setCameraY(object.getDrawableY()+object.getCenterY(), cameraId);
}

gdjs.evtTools.camera.centerCameraWithinLimits = function(runtimeScene, object, left, top, right, bottom, anticipateMove, layer, cameraId) {
    if ( !runtimeScene.hasLayer(layer) || object == null ) { return; }

    var layer = runtimeScene.getLayer(layer);
    var xOffset = 0; var yOffset = 0;
    if ( anticipateMove && !object.hasNoForces() ) {
        var objectAverageForce  = object.getAverageForce();
        xOffset = objectAverageForce.getX()*runtimeScene.getElapsedTime()/1000;
        yOffset = objectAverageForce.getY()*runtimeScene.getElapsedTime()/1000;
    }

    var newX = object.getDrawableX()+object.getCenterX()+xOffset;
    if ( newX < left +layer.getCameraWidth(cameraId)/2 ) newX = left+layer.getCameraWidth(cameraId)/2;
    if ( newX > right-layer.getCameraWidth(cameraId)/2 ) newX = right-layer.getCameraWidth(cameraId)/2;
    
    var newY = object.getDrawableY()+object.getCenterY()+yOffset;
    if ( newY < top   +layer.getCameraHeight(cameraId)/2 ) newY = top+layer.getCameraHeight(cameraId)/2;
    if ( newY > bottom-layer.getCameraHeight(cameraId)/2 ) newY = bottom-layer.getCameraHeight(cameraId)/2;

    layer.setCameraX(newX, cameraId);
    layer.setCameraY(newY, cameraId);
}

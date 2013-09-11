/*
 * Game Develop JS Platform
 * Copyright 2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/**
 * @namespace gdjs.evtTools
 * @class network
 * @static
 * @private
 */
gdjs.evtTools.network = gdjs.evtTools.network || {};

gdjs.evtTools.network.sendHttpRequest = function(host, uri, body, method, contentType, responseVar)
{
	try {
		var xhr;
	    if (typeof XMLHttpRequest !== 'undefined')
			xhr = new XMLHttpRequest();
	    else {
	        var versions = ["MSXML2.XmlHttp.5.0",
	                        "MSXML2.XmlHttp.4.0",
	                        "MSXML2.XmlHttp.3.0",
	                        "MSXML2.XmlHttp.2.0",
	                        "Microsoft.XmlHttp"]

	         for(var i = 0, len = versions.length; i < len; i++) {
	            try {
	                xhr = new ActiveXObject(versions[i]);
	                break;
	            }
	            catch(e){}
	         } // end for
	    }

	    if ( xhr === undefined ) return;
	     
	    xhr.open(method, host+uri, false);
	    xhr.setRequestHeader( "Content-Type", contentType === "" ? "application/x-www-form-urlencoded" : contentType );
	    xhr.send(body);
		responseVar.setString(xhr.responseText);
	}
	catch(e){}
};
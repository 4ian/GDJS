/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */

/*
 * When cross-compiling using emscripten, this file exposes the GDJS API
 * to javascript.
 */
#if defined(EMSCRIPTEN)
#include <emscripten/bind.h>
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDJS/EventsCodeGenerator.h"
#include "GDJS/JsPlatform.h"

using namespace emscripten;
using namespace gdjs;

namespace gdjs
{

JsPlatform & AsJSPlatform(gd::Platform & platform)
{
	return static_cast<JsPlatform &>(platform);
}

}

EMSCRIPTEN_BINDINGS(gdjs_JsPlatform) {

    class_<JsPlatform, base<gd::Platform>>("JsPlatform")
        .constructor<>()
        .class_function("get", &JsPlatform::Get)
        ;

    function("asJSPlatform", &gdjs::AsJSPlatform);
}

EMSCRIPTEN_BINDINGS(gdjs_EventsCodeGenerator) {
        function("GenerateSceneEventsCompleteCode", &EventsCodeGenerator::GenerateSceneEventsCompleteCode)
        ;

}
#endif
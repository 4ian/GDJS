/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "MouseExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

MouseExtension::MouseExtension()
{
    SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Built-in extensions allowing to use the mouse"),
                          "Florian Rival",
                          "Open source ( LGPL )");
    CloneExtension("Game Develop C++ platform", "BuiltinMouse");

    GetAllConditions()["SourisX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.h");
    GetAllConditions()["SourisY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.h");
    GetAllConditions()["SourisBouton"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.isMouseButtonPressed").SetIncludeFile("inputtools.h");
    GetAllActions()["CacheSouris"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.hideCursor").SetIncludeFile("inputtools.h");
    GetAllActions()["MontreSouris"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.showCursor").SetIncludeFile("inputtools.h");

    GetAllExpressions()["MouseX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.h");
    GetAllExpressions()["SourisX"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseX").SetIncludeFile("inputtools.h"); //Deprecated
    GetAllExpressions()["MouseY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.h");
    GetAllExpressions()["SourisY"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.input.getMouseY").SetIncludeFile("inputtools.h"); //Deprecated

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddAction("CentreSourisX",
                   _("Center mouse horizontaly"),
                   _("Put the cursor in the middle of the screen horizontally."),
                   _("Center mouse horizontaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("CenterCursorHorizontally").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    AddAction("CentreSourisY",
                   _("Center mouse verticaly"),
                   _("Put the cursor in the middle of the screen vertically."),
                   _("Center mouse verticaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("CenterCursorVertically").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    AddAction("SetSourisXY",
                   _("Position the cursor of the mouse"),
                   _("Position the cursor to given coordinates."),
                   _("Position cursor at _PARAM1_;_PARAM2_"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .codeExtraInformation.SetFunctionName("SetCursorPosition").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");

    AddAction("CentreSouris",
                   _("Center the mouse"),
                   _("Center the mouse."),
                   _("Center the mouse"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("CenterCursor").SetIncludeFile("GDCpp/BuiltinExtensions/MouseTools.h");
*/
}

}

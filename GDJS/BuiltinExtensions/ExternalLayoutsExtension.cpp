/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "ExternalLayoutsExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

ExternalLayoutsExtension::ExternalLayoutsExtension()
{
    SetExtensionInformation("BuiltinExternalLayouts",
                          _("External layouts"),
                          _("Built-in extension providing actions and conditions related to external layouts"),
                          "Florian Rival",
                          "Open source ( LGPL )");

    CloneExtension("Game Develop C++ platform", "BuiltinExternalLayouts");

    GetAllActions()["BuiltinExternalLayouts::CreateObjectsFromExternalLayout"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.createObjectsFromExternalLayout");

    StripUnimplementedInstructionsAndExpressions();
}

}

/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "GDJS/BuiltinExtensions/SpriteExtension.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

namespace gdjs
{

SpriteExtension::SpriteExtension()
{
    SetExtensionInformation("Sprite",
                          _("Sprite"),
                          _("Extension for adding animated objects in the scene, which can contain animations with directions within each."),
                          "Florian Rival",
                          "Open source ( LGPL )");
    CloneExtension("Game Develop C++ platform", "Sprite");

    std::map<std::string, gd::InstructionMetadata > & spriteActions = GetAllActionsForObject("Sprite");
    std::map<std::string, gd::InstructionMetadata > & spriteConditions = GetAllConditionsForObject("Sprite");
    std::map<std::string, gd::ExpressionMetadata > & spriteExpressions = GetAllExpressionsForObject("Sprite");
    spriteActions["ChangeBlendMode"].codeExtraInformation.
        SetFunctionName("setBlendMode").SetIncludeFile("spriteruntimeobject.js");
    spriteActions["Opacity"].codeExtraInformation.
        SetFunctionName("setOpacity").SetAssociatedGetter("getOpacity").SetIncludeFile("spriteruntimeobject.js");
    spriteConditions["BlendMode"].codeExtraInformation.
        SetFunctionName("getBlendMode").SetIncludeFile("spriteruntimeobject.js");
    spriteConditions["Opacity"].codeExtraInformation.
        SetFunctionName("getOpacity").SetIncludeFile("spriteruntimeobject.js");

    spriteActions["ChangeAnimation"].codeExtraInformation.
        SetFunctionName("setAnimation").SetAssociatedGetter("getAnimation");
    spriteActions["ChangeDirection"].codeExtraInformation.
        SetFunctionName("setDirectionOrAngle").SetAssociatedGetter("getDirectionOrAngle");
    spriteActions["ChangeSprite"].codeExtraInformation.
        SetFunctionName("setAnimationFrame").SetAssociatedGetter("getAnimationFrame");
    spriteConditions["Animation"].codeExtraInformation.
        SetFunctionName("getAnimation");
    spriteConditions["Direction"].codeExtraInformation.
        SetFunctionName("getDirectionOrAngle");
    spriteConditions["Sprite"].codeExtraInformation.
        SetFunctionName("getAnimationFrame");
    spriteConditions["AnimationEnded"].codeExtraInformation.
        SetFunctionName("hasAnimationEnded");
    spriteActions["PauseAnimation"].codeExtraInformation.
        SetFunctionName("pauseAnimation");
    spriteActions["PlayAnimation"].codeExtraInformation.
        SetFunctionName("playAnimation");
    spriteConditions["AnimStopped"].codeExtraInformation.
        SetFunctionName("animationPaused");

    spriteActions["ChangeScaleWidth"].codeExtraInformation.
        SetFunctionName("setScaleX").SetAssociatedGetter("getScaleX");
    spriteActions["ChangeScaleHeight"].codeExtraInformation.
        SetFunctionName("setScaleY").SetAssociatedGetter("getScaleY");
    spriteConditions["ScaleWidth"].codeExtraInformation
        .SetFunctionName("getScaleX");
    spriteConditions["ScaleHeight"].codeExtraInformation
        .SetFunctionName("getScaleY");
    spriteActions["TourneVersPos"].codeExtraInformation.
        SetFunctionName("turnTowardPosition");
    spriteActions["TourneVers"].codeExtraInformation.
        SetFunctionName("turnTowardObject");
    spriteActions["FlipX"].codeExtraInformation.
        SetFunctionName("flipX");
    spriteActions["FlipY"].codeExtraInformation.
        SetFunctionName("flipY");

    spriteConditions["SourisSurObjet"].codeExtraInformation.
        SetFunctionName("cursorOnObject");

    GetAllConditions()["Collision"]
        .AddCodeOnlyParameter("currentScene", "") //We need an extra parameter pointing to the scene.
        .codeExtraInformation //No pixel perfect collision for now on the JS platform.
        .SetFunctionName("gdjs.evtTools.object.hitBoxesCollisionTest");

    GetAllConditions()["EstTourne"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.object.turnedTowardTest");

    spriteExpressions["X"].codeExtraInformation.
        SetFunctionName("getPointX");
    spriteExpressions["Y"].codeExtraInformation.
        SetFunctionName("getPointY");
    spriteExpressions["PointX"].codeExtraInformation.
        SetFunctionName("getPointX");
    spriteExpressions["PointY"].codeExtraInformation.
        SetFunctionName("getPointY");
    spriteExpressions["Direc"].codeExtraInformation. //Deprecated
        SetFunctionName("getDirectionOrAngle");
    spriteExpressions["Direction"].codeExtraInformation.
        SetFunctionName("getDirectionOrAngle");
    spriteExpressions["Anim"].codeExtraInformation.  //Deprecated
        SetFunctionName("getAnimation");
    spriteExpressions["Animation"].codeExtraInformation.
        SetFunctionName("getAnimation");
    spriteExpressions["Sprite"].codeExtraInformation.
        SetFunctionName("getAnimationFrame");
    spriteExpressions["ScaleX"].codeExtraInformation.
        SetFunctionName("getScaleX");
    spriteExpressions["ScaleY"].codeExtraInformation.
        SetFunctionName("getScaleY");


    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*
    //Objects instructions:
    {


        obj.AddAction("ChangeScale",
                       _("Modify the scale of an object"),
                       _("Modify the scale of the specified object."),
                       _("Do _PARAM1__PARAM2_ to the scale of _PARAM0_"),
                       _("Size"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("operator", _("Modification's sign"), "",false)
            .AddParameter("expression", _("Value"), "",false)
            .codeExtraInformation.SetFunctionName("ChangeScale").SetIncludeFile("GDCpp/SpriteObject.h");

        obj.AddCondition("BlendMode",
                       _("Blend mode"),
                       _("Compare the number of the blend mode currently used by an object"),
                       _("The number of the current blend mode of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Effects"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("relationalOperator", _("Sign of the test"), "",false)
            .AddParameter("expression", _("Value to test  ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false)
            .codeExtraInformation.SetFunctionName("GetBlendMode").SetManipulatedType("number").SetIncludeFile("GDCpp/SpriteObject.h");

        obj.AddAction("CopyImageOnImageOfSprite",
                       _("Copy an image on the current one of an object"),
                       _("Copy an image on the current image of an object.\nNote that the source image must be preferably kept loaded in memory."),
                       _("Copy image _PARAM2_ on the current of _PARAM0_ at _PARAM3_;_PARAM4_"),
                       _("Effects"),
                       "res/copy24.png",
                       "res/copyicon.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddCodeOnlyParameter("currentScene", "")
            .AddParameter("string", _("Name of the source image"), "",false)
            .AddParameter("expression", _("X position"), "",false)
            .AddParameter("expression", _("Y position"), "",false)
            .AddParameter("yesorno", _("Should the copy take in account the source transparency\?"), "",false)
            .codeExtraInformation.SetFunctionName("CopyImageOnImageOfCurrentSprite").SetIncludeFile("GDCpp/SpriteObject.h");



        obj.AddAction("CreateMaskFromColorOnActualImage", //Actual is indeed a mistake : Current should have been chosen.
                       _("Make a color of the image of an object transparent"),
                       _("Make a color of the image of an object transparent."),
                       _("Make color _PARAM1_ of the current image of _PARAM0_ transparent"),
                       _("Effects"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("color", _("Color to make transparent"), "",false)
            .codeExtraInformation.SetFunctionName("MakeColorTransparent").SetIncludeFile("GDCpp/SpriteObject.h");


        obj.AddAction("ChangeColor",
                       _("Change the global color"),
                       _("Change the global color of an object. The default color is white."),
                       _("Change color of _PARAM0_ to _PARAM1_"),
                       _("Effects"),
                       "res/actions/color24.png",
                       "res/actions/color.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("color", _("Color"), "",false)
            .codeExtraInformation.SetFunctionName("SetColor").SetIncludeFile("GDCpp/SpriteObject.h");


        obj.AddAction("ChangeBlendMode",
                       _("Change Blend mode"),
                       _("Change the number of the blend mode of an object.\nThe default blend mode is 0 ( Alpha )."),
                       _("Change Blend mode of _PARAM0_ to _PARAM1_"),
                       _("Effects"),
                       "res/actions/color24.png",
                       "res/actions/color.png")

            .AddParameter("object", _("Object"), "Sprite", false)
            .AddParameter("expression", _("Mode ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), "",false)
            .codeExtraInformation.SetFunctionName("SetBlendMode").SetIncludeFile("GDCpp/SpriteObject.h");
        #endif

    }

*/
}

}

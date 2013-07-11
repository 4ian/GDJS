/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "StringInstructionsExtension.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

namespace gdjs
{

StringInstructionsExtension::StringInstructionsExtension()
{
    SetExtensionInformation("BuiltinStringInstructions",
                          _("Text manipulation"),
                          _("Built-in extension providing expressions related to strings."),
                          "Florian Rival",
                          "Open source ( LGPL )");


    CloneExtension("Game Develop C++ platform", "BuiltinStringInstructions");

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
/*

    AddStrExpression("SubStr",
                   _("Get a portion of text from a text"),
                   _("Get a portion of text from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("Start position of the portion ( The first letter is at position 0 )"), "",false)
        .AddParameter("expression", _("Length of the portion"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");

    AddStrExpression("StrAt",
                   _("Get a character from a text"),
                   _("Get a character from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("Position of the character ( The first letter is at position 0 )"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");

    AddExpression("StrLength",
                   _("Length of a text"),
                   _("Length of a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrFind",
                   _("Search in a text"),
                   _("Search in a text ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrRFind",
                   _("Search in a text from end"),
                   _("Search in a text from the end ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrFindFrom",
                   _("Search in a text, starting from a position"),
                   _("Search in a text starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .AddParameter("expression", _("Position from which searching must begin"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrRFindFrom",
                   _("Search in a text from the end, starting from a position"),
                   _("Search in a text from the end, starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .AddParameter("expression", _("Position from which searching must begin"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");


*/
}

}

/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include <sstream>
#include <fstream>
#include <streambuf>
#include <string>
#include <wx/filename.h>
#include <wx/dir.h>
#include <wx/log.h>
#include <wx/msgdlg.h>
#include <wx/config.h>
#include <wx/progdlg.h>
#include <wx/zipstrm.h>
#include <wx/wfstream.h>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/property_tree/json_parser.hpp>
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/IDE/ProjectResourcesCopier.h"
#include "GDCore/CommonTools.h"
#include "GDJS/Exporter.h"
#include "GDJS/EventsCodeGenerator.h"
#include "GDJS/Dialogs/ProjectExportDialog.h"

using namespace boost::property_tree;

namespace gdjs
{

//Nice tools functions
static void InsertUnique(std::vector<std::string> & container, std::string str)
{
    if ( std::find(container.begin(), container.end(), str) == container.end() )
        container.push_back(str);
}

static void ClearDirectory(wxString dir)
{
    wxString file = wxFindFirstFile( dir + "/*" );
    while ( !file.empty() )
    {
        wxRemoveFile( file );
        file = wxFindNextFile();
    }
}

static void GenerateFontsDeclaration(const std::string & outputDir, std::string & css, std::string & html)
{
    wxString file = wxFindFirstFile( outputDir + "/*" );
    while ( !file.empty() )
    {
        if ( file.Upper().EndsWith(".TTF") )
        {
            wxFileName relativeFile(file);
            relativeFile.MakeRelativeTo(outputDir);
            css += "@font-face{ font-family : \"gdjs_font_";
            css += gd::ToString(relativeFile.GetFullPath());
            css += "\"; src : url('";
            css += gd::ToString(relativeFile.GetFullPath());
            css +="') format('truetype'); }";

            html += "<div style=\"font-family: 'gdjs_font_";
            html += gd::ToString(relativeFile.GetFullPath());
            html += "';\">.</div>";
        }

        file = wxFindNextFile();
    }
}

template<typename Ptree>
static void NormalizeProjectPropertyTree(Ptree & pt)
{
    typedef typename Ptree::key_type::value_type Ch;
    typedef typename std::basic_string<Ch> Str;

    //When a node has a data and children ( which won't be accepted
    //for writing the property tree to json ), the data is sent to a child called "value".
    if (!pt.template get_value<Str>().empty() && !pt.empty())
    {
        pt.put("value", pt.template get_value<Str>());
        pt.put_value("");
    }

    //Rename the child node "<xmlattr>" to "attr", if any.
    if ( pt.find("<xmlattr>") != pt.not_found() )
    {
        pt.put_child("attr", pt.get_child("<xmlattr>"));
        pt.erase("<xmlattr>");
    }

    //Transform multiple child with the same name into an array
    typename Ptree::iterator it = pt.begin();
    while (it != pt.end())
    {
        typename Ptree::key_type key = it->first;
        if ( key != "" && pt.count(key) > 1 ) //More than one child with the same name..
        {
            Ptree array; //...put every children with this name into an array
            for (typename Ptree::iterator arrElem = pt.begin(); arrElem != pt.end(); ++arrElem)
            {
                if ( arrElem->first == key ) array.push_back(std::make_pair("", arrElem->second));
            }
            pt.erase(key);
            pt.put_child(key, array);
            it = pt.begin();
        }
        else
            ++it;
    }

    for (typename Ptree::iterator it = pt.begin(); it != pt.end(); ++it)
        NormalizeProjectPropertyTree(it->second);
}

Exporter::~Exporter()
{
}


bool Exporter::ExportLayoutForPreview(gd::Layout & layout, std::string exportDir)
{
    if ( !project ) return false;

    gd::RecursiveMkDir::MkDir(exportDir);
    ClearDirectory(exportDir);
    gd::RecursiveMkDir::MkDir(exportDir+"/libs");
    gd::RecursiveMkDir::MkDir(exportDir+"/Extensions");
    std::vector<std::string> includesFiles;

    gd::Project exportedProject = *project;

    //Export resources ( *before* generating events as some resources filenames may be updated )
    ExportResources(exportedProject, exportDir);

    //Generate events code
    if ( !ExportEventsCode(exportedProject, gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/"), includesFiles) )
        return false;

    //Strip the project ( *after* generating events as the events may use strioped things ( objects groups... ) ) 
    StripProject(exportedProject);
    exportedProject.SetFirstLayout(layout.GetName());

    //Export the project
    std::string result = ExportToJSON(exportedProject, gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js"),
                                      "gdjs.projectData", false);
    includesFiles.push_back(gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js"));

    //Copy all the dependencies
    ExportIncludesAndLibs(includesFiles, exportDir, false);

    //Create the index file
    if ( !ExportIndexFile(exportedProject, exportDir, includesFiles) ) return false;

    return true;
}

std::string Exporter::ExportToJSON(const gd::Project & project, std::string filename, std::string wrapIntoVariable, bool prettyPrinting)
{
    gd::RecursiveMkDir::MkDir(wxFileName::FileName(filename).GetPath());

    //Save the project in memory
    TiXmlDocument doc;
    TiXmlElement * root = new TiXmlElement( "Project" );
    doc.LinkEndChild( root );
    project.SaveToXml(root);

    TiXmlPrinter printer;
    printer.SetStreamPrinting();
    doc.Accept( &printer );
    std::string xml = printer.CStr();

    //Convert it automatically to JSON
    std::string output;
    try
    {
        ptree pt;
        std::stringstream input(xml);
        xml_parser::read_xml(input, pt);
        NormalizeProjectPropertyTree(pt);

        std::stringstream outputStream;
        json_parser::write_json(outputStream, pt, prettyPrinting);
        output = outputStream.str();
    }
    catch(json_parser_error & e)
    {
        return e.what();
    }
    catch(...)
    {
        return "Unknown error!";
    }

    if (!wrapIntoVariable.empty()) output = wrapIntoVariable + " = " + output + ";";

    //Save to file
    {
        std::ofstream file;
        file.open ( filename.c_str() );
        if ( file.is_open() )
        {
            file << output;
            file.close();
        }
        else
            return "Unable to write "+filename;
    }

    return "";
}

bool Exporter::ExportMetadataFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles)
{
    std::string metadata = "{";

    //Fonts metadata
    metadata += "\"fonts\":[";
    bool first = true;
    wxString file = wxFindFirstFile( exportDir + "/*" );
    while ( !file.empty() )
    {
        if ( file.Upper().EndsWith(".TTF") )
        {
            wxFileName relativeFile(file);
            relativeFile.MakeRelativeTo(exportDir);

            if ( !first ) metadata += ", ";
            metadata += "{\"ffamilyname\":\"gdjs_font_"+gd::ToString(relativeFile.GetFullPath())+"\"";
            metadata += ", \"filename\":\""+gd::ToString(relativeFile.GetFullPath())+"\", \"format\":\"truetype\"}";

            first = false;
        }

        file = wxFindNextFile();
    }

    //Used scripts files
    metadata += "],\"scripts\":[";
    for (std::vector<std::string>::const_iterator it = includesFiles.begin(); it != includesFiles.end(); ++it)
    {
        if ( !wxFileExists(exportDir+"/"+*it) )
            continue;

        if (it != includesFiles.begin()) metadata += ", ";

        wxFileName relativeFile(exportDir+"/"+*it);
        relativeFile.MakeRelativeTo(exportDir);
        metadata += "\""+gd::ToString(relativeFile.GetFullPath(wxPATH_UNIX))+"\""; 
    }

    //Other metadata
    metadata += "], ";
    metadata += "\"windowSize\":{\"w\": "+gd::ToString(project.GetMainWindowDefaultWidth())
        +", \"h\": "+gd::ToString(project.GetMainWindowDefaultHeight())+"}";
    metadata += "}";

    {
        std::ofstream file;
        file.open ( std::string(exportDir+"/gd_metadata.json").c_str() );
        if ( file.is_open() ) {
            file << metadata;
            file.close();
        }
        else {
            lastError = "Unable to write the metadata file.";
            return false;
        }
    }

    return true;
}

bool Exporter::ExportIndexFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles)
{
    std::ifstream t("./JsPlatform/Runtime/index.html");
    std::stringstream buffer;
    buffer << t.rdbuf();
    std::string str = buffer.str();

    //Generate custom declarations for font resources
    std::string customCss;
    std::string customHtml;
    GenerateFontsDeclaration(exportDir, customCss, customHtml);

    size_t pos = str.find("<!-- GDJS_CUSTOM_STYLE -->");
    if ( pos < str.length() )
        str = str.replace(pos, 26, customCss);
    else
    {
        std::cout << "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file.";
        return false;
    }

    pos = str.find("<!-- GDJS_CUSTOM_HTML -->");
    if ( pos < str.length() )
        str = str.replace(pos, 25, customHtml);
    else
    {
        std::cout << "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CUSTOM_STYLE --> in index file.";
        return false;
    }

    pos = str.find("<!-- GDJS_CODE_FILES -->");
    if ( pos < str.length() )
    {

        std::string codeFilesIncludes;
        for (std::vector<std::string>::const_iterator it = includesFiles.begin(); it != includesFiles.end(); ++it)
        {
            if ( !wxFileExists(exportDir+"/"+*it) )
            {
                std::cout << "Warning: Unable to found " << exportDir+"/"+*it << "." << std::endl;
                continue;
            }

            wxFileName relativeFile = wxFileName::FileName(exportDir+"/"+*it);
            relativeFile.MakeRelativeTo(exportDir);
            codeFilesIncludes += "\t<script src=\""+gd::ToString(relativeFile.GetFullPath(wxPATH_UNIX))+"\"></script>\n";
        }

        str = str.replace(pos, 24, codeFilesIncludes);
    }
    else
    {
        std::cout << "Unable to find <!-- GDJS_CODE_FILES --> in index file." << std::endl;
        lastError = "Unable to find <!-- GDJS_CODE_FILES --> in index file.";
        return false;
    }

    {
        std::ofstream file;
        file.open ( std::string(exportDir+"/index.html").c_str() );
        if ( file.is_open() ) {
            file << str;
            file.close();
        }
        else {
            lastError = "Unable to write index file.";
            return false;
        }
    }

    return true;
}

bool Exporter::ExportEventsCode(gd::Project & project, std::string outputDir, std::vector<std::string> & includesFiles)
{
    gd::RecursiveMkDir::MkDir(outputDir);

    //First, do not forget common includes ( They must be included before events generated code files ).
    InsertUnique(includesFiles, "libs/pixi.js");
    InsertUnique(includesFiles, "libs/jshashtable.js");
    InsertUnique(includesFiles, "libs/hshg.js");
    InsertUnique(includesFiles, "gd.js");
    InsertUnique(includesFiles, "commontools.js");
    InsertUnique(includesFiles, "runtimeobject.js");
    InsertUnique(includesFiles, "runtimescene.js");
    InsertUnique(includesFiles, "polygon.js");
    InsertUnique(includesFiles, "force.js");
    InsertUnique(includesFiles, "layer.js");
    InsertUnique(includesFiles, "timer.js");
    InsertUnique(includesFiles, "imagemanager.js");
    InsertUnique(includesFiles, "runtimegame.js");
    InsertUnique(includesFiles, "variable.js");
    InsertUnique(includesFiles, "variablescontainer.js");
    InsertUnique(includesFiles, "runtimescene.js");
    InsertUnique(includesFiles, "runtimeautomatism.js");
    InsertUnique(includesFiles, "runtimeobject.js");
    InsertUnique(includesFiles, "spriteruntimeobject.js");
    InsertUnique(includesFiles, "soundmanager.js");

    //Common includes for events only.
    InsertUnique(includesFiles, "runtimescenetools.js");
    InsertUnique(includesFiles, "inputtools.js");
    InsertUnique(includesFiles, "objecttools.js");
    InsertUnique(includesFiles, "cameratools.js");
    InsertUnique(includesFiles, "soundtools.js");
    InsertUnique(includesFiles, "storagetools.js");
    InsertUnique(includesFiles, "stringtools.js");

    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        std::set<std::string> eventsIncludes;
        gd::Layout & exportedLayout = project.GetLayout(i);
        std::string eventsOutput = EventsCodeGenerator::GenerateSceneEventsCompleteCode(project, exportedLayout,
                                                                                        exportedLayout.GetEvents(), eventsIncludes,
                                                                                        false /*Export for edittime*/);
        //Export the code
        std::ofstream file;
        file.open ( std::string(outputDir+"code"+gd::ToString(i)+".js").c_str() );
        if ( file.is_open() ) {
            file << eventsOutput;
            file.close();

            for ( std::set<std::string>::iterator include = eventsIncludes.begin() ; include != eventsIncludes.end(); ++include )
                InsertUnique(includesFiles, *include);

            InsertUnique(includesFiles, std::string(outputDir+"code"+gd::ToString(i)+".js"));
        }
        else {
            lastError = gd::ToString(_("Unable to write ")+outputDir+"code"+gd::ToString(i)+".js");
            return false;
        }
    }

    return true;
}

bool Exporter::ExportIncludesAndLibs(std::vector<std::string> & includesFiles, std::string exportDir, bool minify)
{
    //Includes files :
    if ( minify )
    {
        std::string javaExec = GetJavaExecutablePath();
        if ( javaExec.empty() || !wxFileExists(javaExec) )
        {
            std::cout << "Java executable not found." << std::endl;
            wxLogWarning(_("The exported script could not be minified : Check that the Java Runtime Environment is installed."));
            minify = false;
        }
        else
        {
            std::string jsPlatformDir = gd::ToString(wxGetCwd()+"/JsPlatform/");
            std::string cmd = javaExec+" -jar \""+jsPlatformDir+"Tools/compiler.jar\" --js ";

            std::string allJsFiles;
            for ( std::vector<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
            {
                if ( wxFileExists(jsPlatformDir+"Runtime/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/"+*include+"\" ";
                else if ( wxFileExists(jsPlatformDir+"Runtime/Extensions/"+*include) )
                    allJsFiles += "\""+jsPlatformDir+"Runtime/Extensions/"+*include+"\" ";
                else if ( wxFileExists(*include) )
                    allJsFiles += "\""+*include+"\" ";
            }

            cmd += allJsFiles;
            cmd += "--js_output_file \""+exportDir+"/code.js\"";

            wxArrayString output;
            wxArrayString errors;
            long res = wxExecute(cmd, output, errors);
            if ( res != 0 )
            {
                std::cout << "Execution of the closure compiler failed ( Command line : " << cmd << ")." << std::endl;
                std::cout << "Output: ";
                bool outOfMemoryError = false;
                for (size_t i = 0;i<output.size();++i)
                {
                    outOfMemoryError |= output[i].find("OutOfMemoryError") < output[i].length();
                    std::cout << output[i] << std::endl;
                } 
                for (size_t i = 0;i<errors.size();++i)
                {
                    outOfMemoryError |= errors[i].find("OutOfMemoryError") < errors[i].length();
                    std::cout << errors[i] << std::endl;
                } 

                if ( outOfMemoryError)
                    wxLogWarning(_("The exported script could not be minified: It seems that the script is too heavy and need too much memory to be minified.\n\nTry using sub events and reduce the number of events."));
                else
                    wxLogWarning(_("The exported script could not be minified.\n\nMay be an extension is triggering this error: Try to contact the developer if you think it is the case."));
                minify = false;
            }
            else
            {
                includesFiles.clear();
                InsertUnique(includesFiles, "code.js");
                return true;
            }

        }
    }

    //If the closure compiler failed or was not request, simply copy all the include files.
    if ( !minify )
    {
        for ( std::vector<std::string>::iterator include = includesFiles.begin() ; include != includesFiles.end(); ++include )
        {
            std::cout << *include << std::endl;
            wxLogNull noLogPlease;
            if ( wxFileExists("./JsPlatform/Runtime/"+*include) )
            {
                wxString path = wxFileName::FileName(exportDir+"/Extensions/"+*include).GetPath();
                if ( !wxDirExists(path) ) gd::RecursiveMkDir::MkDir(path);

                wxCopyFile("./JsPlatform/Runtime/"+*include, exportDir+"/"+*include);
                //Ok, the filename is relative to the export dir.
            }
            else if ( wxFileExists("./JsPlatform/Runtime/Extensions/"+*include) )
            {
                wxString path = wxFileName::FileName(exportDir+"/Extensions/"+*include).GetPath();
                if ( !wxDirExists(path) ) gd::RecursiveMkDir::MkDir(path);

                wxCopyFile("./JsPlatform/Runtime/Extensions/"+*include, exportDir+"/Extensions/"+*include);
                *include = "Extensions/"+*include; //Ensure filename is relative to the export dir.
            }
            else if ( wxFileExists(*include) )
            {
                wxCopyFile(*include, exportDir+"/"+wxFileName::FileName(*include).GetFullName());
                *include = gd::ToString(wxFileName::FileName(*include).GetFullName()); //Ensure filename is relative to the export dir.
            }
            else
            {
                std::cout << "Could not copy include file " << *include << " (File not found)." << std::endl;
            }
        }
    }

    return true;
}

void Exporter::StripProject(gd::Project & strippedProject)
{
    strippedProject.GetObjectGroups().clear();
    while ( strippedProject.GetExternalEventsCount() > 0 ) strippedProject.RemoveExternalEvents(strippedProject.GetExternalEvents(0).GetName());

    for (unsigned int i = 0;i<strippedProject.GetLayoutCount();++i)
    {
            strippedProject.GetLayout(i).GetObjectGroups().clear();
            strippedProject.GetLayout(i).GetEvents().clear();
    }
}

void Exporter::ExportResources(gd::Project & project, std::string exportDir, wxProgressDialog * progressDialog)
{
    gd::ProjectResourcesCopier::CopyAllResourcesTo(project, exportDir, true, progressDialog, false, false);
}

void Exporter::ShowProjectExportDialog(gd::Project & project)
{
    ProjectExportDialog dialog(NULL, project);
    if ( dialog.ShowModal() != 1 ) return;

    bool exportForOnlineUpload = true;
    bool minify = dialog.RequestMinify();
    std::string exportDir = dialog.GetExportDir();

    {
        wxProgressDialog progressDialog(_("Export in progress ( 1/2 )"), _("Exporting the project..."));

        //Prepare the export directory
        gd::RecursiveMkDir::MkDir(exportDir);
        ClearDirectory(exportDir);
        gd::RecursiveMkDir::MkDir(exportDir+"/libs");
        gd::RecursiveMkDir::MkDir(exportDir+"/Extensions");
        std::vector<std::string> includesFiles;

        gd::Project exportedProject = project;

        //Export the resources ( before generating events as some resources filenames may be updated )
        ExportResources(exportedProject, exportDir, &progressDialog);

        progressDialog.SetTitle(_("Export in progress ( 2/2 )"));
        progressDialog.Update(50, _("Exporting events..."));

        //Export events 
        if ( !ExportEventsCode(exportedProject, gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/"), includesFiles) )
        {
            wxLogError(_("Error during exporting: Unable to export events ( "+lastError+")."));
            return;
        }

        progressDialog.Update(60, _("Preparing the project..."));

        //Strip the project ( *after* generating events as the events may use stripped things ( objects groups... ) )...
        StripProject(exportedProject);

        progressDialog.Update(70, _("Exporting files..."));

        //...and export it
        std::string result = ExportToJSON(exportedProject, gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js"),
                                          "gdjs.projectData", false);
        includesFiles.push_back(gd::ToString(wxFileName::GetTempDir()+"/GDTemporaries/JSCodeTemp/data.js"));

        progressDialog.Update(80, minify ? _("Exporting files and minifying them...") : _("Exporting files..."));

        //Copy all dependencies and the index (or metadata) file.
        ExportIncludesAndLibs(includesFiles, exportDir, minify);
        if ( (!exportForOnlineUpload && !ExportIndexFile(exportedProject, exportDir, includesFiles)) ||
             (exportForOnlineUpload && !ExportMetadataFile(exportedProject, exportDir, includesFiles)) )
        {
            wxLogError(_("Error during exporting:\n"+lastError));
            return;
        }

        //Exporting for online upload requires to zip the whole game.
        if ( exportForOnlineUpload )
        {
            progressDialog.Update(90, _("Creating the zip file..."));

            //Getting all the files to includes in the directory
            wxArrayString files;
            wxDir::GetAllFiles(exportDir, &files);

            wxString zipTempName = wxFileName::GetTempDir()+"/GDTemporaries/zipped_"+ToString(&project)+".zip";
            wxFFileOutputStream out(zipTempName);
            wxZipOutputStream zip(out);
            for(unsigned int i = 0; i < files.size(); ++i)
            {
                wxFileName filename(files[i]);
                filename.MakeRelativeTo(exportDir);
                wxFileInputStream file(files[i]);
                if ( file.IsOk() )
                {
                    zip.PutNextEntry(filename.GetFullPath());
                    zip.Write(file);
                }
            }

            if ( !zip.Close() || !out.Close() )
                wxLogWarning(_("Unable to finalize the creation of the zip file!\n\nThe exported project won't be put in a zip file."));
            else
            {
                progressDialog.Update(95, _("Cleaning files..."));

                ClearDirectory(exportDir);
                wxCopyFile(zipTempName, exportDir+"/zipped_project.zip");
                wxRemoveFile(zipTempName);
            }
        }
    }

    //Finished!
    if ( exportForOnlineUpload )
    {

    }
    else
    { 
        if ( wxMessageBox(_("Compilation achieved. Do you want to open the folder where the project has been compiled\?"),
                          _("Compilation finished"), wxYES_NO) == wxYES )
        {
            #if defined(WINDOWS)
            wxExecute("explorer.exe \""+exportDir+"\"");
            #elif defined(LINUX)
            system(std::string("xdg-open \""+exportDir).c_str());
            #elif defined(MAC)
            system(std::string("open \""+exportDir).c_str());
            #endif
        }
    }
}

std::string Exporter::GetProjectExportButtonLabel()
{
    return gd::ToString(_("Export to the web"));
}

std::string Exporter::GetJavaExecutablePath()
{
    std::vector<std::string> guessPaths;
    wxString userPath;
    if ( wxConfigBase::Get()->Read("Paths/Java" , &userPath) && !userPath.empty() )
        guessPaths.push_back(gd::ToString(userPath));
    else
    {
        #if defined(WINDOWS)

        //Try some common paths.
        guessPaths.push_back("C:/Program Files/java/jre7/bin/java.exe");
        guessPaths.push_back("C:/Program Files (x86)/java/jre7/bin/java.exe");
        guessPaths.push_back("C:/Program Files/java/jre6/bin/java.exe");
        guessPaths.push_back("C:/Program Files (x86)/java/jre6/bin/java.exe");

        #elif defined(LINUX)
        guessPaths.push_back("/usr/bin/java");
        guessPaths.push_back("/usr/local/bin/java");
        #else
            #warning Please complete this so as to return a path to the Java executable.
        #endif
    }

    for (size_t i = 0;i<guessPaths.size();++i)
    {
        if ( wxFileExists(guessPaths[i]) )
            return guessPaths[i];
    }

    return "";
}

}

/*
 * Game Develop JS Platform
 * Copyright 2008-2013 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef EXPORTER_H
#define EXPORTER_H
#include <vector>
#include <string>
#include <set>
#include "GDCore/IDE/ProjectExporter.h"
namespace gd { class Project; }
namespace gd { class Layout; }
class wxProgressDialog;

namespace gdjs
{

/**
 * \brief Export a project or a layout to a playable HTML5/Javascript based game.
 */
class Exporter : public gd::ProjectExporter
{
public:
    Exporter() : project(NULL) {};
    Exporter(gd::Project * project_) : project(project_) {};
    virtual ~Exporter();


    /**
     * \brief Show a dialog that will enable the user to export the project.
     */
    virtual void ShowProjectExportDialog(gd::Project & project);

    /**
     * \brief Return the label that will be displayed on the button or menu item
     * allowing the user to export the project for the JS Platform.
     */
    virtual std::string GetProjectExportButtonLabel();

    /**
     * \brief Create a preview for the specified layout.
     * \note The preview is not launched, it is the caller responsibility to open a browser pointing to the preview.
     *
     * \param layout The layout to be previewed.
     * \param exportDir The directory where the preview must be created.
     * \return true if export was successful.
     */
    bool ExportLayoutForPreview(gd::Layout & layout, std::string exportDir);

    /**
     * \brief Return the error that occurred during the last export.
     */
    const std::string & GetLastError() const { return lastError; };

    /**
     * \brief Try to locate the Java Executable. ( The JRE must be installed ).
     * \return An empty string if not found, a full path to the java executable otherwise.
     */
    static std::string GetJavaExecutablePath();

private:

    /**
     * \brief Create a stripped version of the project for export: Objects groups are deleted as well as all events.
     *
     * \param project The project to be stripped.
     * \param layout Optional layout name. If not empty, all layouts will be removed except this layout.
     */
    static void StripProject(gd::Project & project);

    /**
     * \brief Export a project to JSON
     *
     * \param project The project to be exported.
     * \param filename The filename where export the project
     * \param wrapIntoVariable If not empty, the resulting json will be wrapped in this javascript
     * variable allowing to use it as a classical javascript object.
     * \param prettyPrinting If set to true, the JSON will be nicely indented
     * \return Empty string if everthing is ok, description of the error otherwise.
     */
    static std::string ExportToJSON(const gd::Project & project, std::string filename, std::string wrapIntoVariable = "", bool prettyPrinting = false);

    /**
     * \brief Copy all the resources of the project to to the export directory, updating the resources filenames.
     *
     * \param project The project with resources to be exported.
     * \param exportDir The directory where the preview must be created.
     * \param progressDlg Optional wxProgressDialog which will be updated with the progress.
     */
    static void ExportResources(gd::Project & project, std::string exportDir, wxProgressDialog * progressDlg = NULL);

    /**
     * \brief Copy all the includes files and the standard libraries files to the export directory.
     *
     * The includes files are also modified so as to be relative to the export directory
     * ( Files with absolute filenames are copied into the export directory and their path are stripped ).
     *
     * \param includesFiles A vector with filenames to be copied.
     * \param exportDir The directory where the preview must be created.
     * \param minify If true, the includes files must be merged into one file using Google Closure Compiler.
     * ( includesFiles parameter will be updated with the new filename )
     */
    bool ExportIncludesAndLibs(std::vector<std::string> & includesFiles, std::string exportDir, bool minify);

    /**
     * \brief Generate the events JS code, and save them to the export directory.
     *
     * Files are named "codeX.js", X being the number of the layout in the project.
     * \param project The project with resources to be exported.
     * \param outputDir The directory where the events code must be generated.
     * \param includesFiles A reference to a vector that will be filled with JS files to be exported along with the project.
     * ( including "codeX.js" files ).
     */
    bool ExportEventsCode(gd::Project & project, std::string outputDir, std::vector<std::string> & includesFiles);

    /**
     * \brief Generate the index file and save it to the export directory.
     *
     * The includes files must be relative to the export directory.
     *
     * \param project The project with layouts to be exported.
     * \param exportDir The directory where the preview must be created.
     * \param includesFiles The JS files to be included in the HTML file. Order is important.
     * \param additionalSpec JSON string that will be passed to the gdjs.RuntimeGame object.
     */
    bool ExportIndexFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles, std::string additionalSpec = "");

    /**
     * \brief Generate the metadata file and save it to the export directory.
     * The metadata is used for the online game sharing service.
     *
     * The includes files must be relative to the export directory.
     *
     * \param project The project with layouts to be exported.
     * \param exportDir The directory where the preview/export must be done.
     * \param includesFiles The JS files to be included in the metadata
     */
    bool ExportMetadataFile(gd::Project & project, std::string exportDir, const std::vector<std::string> & includesFiles);

    gd::Project * project; ///< The project being exported. Can be NULL if no project was set.
    std::string lastError; ///< The last error that occurred.
};

}
#endif // EXPORTER_H

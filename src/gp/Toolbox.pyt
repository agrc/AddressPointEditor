import arcpy, uuid, os
from zipfile import ZipFile, ZIP_DEFLATED

class Toolbox(object):
    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "Broadband"
        self.alias = "Broadband"

        # List of tool classes associated with this toolbox
        self.tools = [DownloadTool]


class DownloadTool(object):
    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "Download Address Points"
        self.description = "Download a counties address points."
        self.canRunInBackground = False

    def getParameterInfo(self):
        """Define parameter definitions"""

        p0 = arcpy.Parameter(
                displayName="County",
                name="county",
                datatype="String",
                parameterType="Required",
                direction="Input")

        p1 = arcpy.Parameter(
                displayName="File type",
                name="f_type",
                datatype="String",
                parameterType="Required",
                direction="Input")

        p2 = arcpy.Parameter(
                displayName="Coordinate System",
                name="c_system",
                datatype="String",
                parameterType="Required",
                direction="Input")

        p3 = arcpy.Parameter(
                displayName="Zip file",
                name="zip",
                datatype="File",
                parameterType = "Derived",
                direction="Output")

        ps = [p0,p1,p2,p3]

        return ps

    def isLicensed(self):
        """Set whether tool is licensed to execute."""
        return True

    def updateParameters(self, parameters):
        """Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed."""
        return

    def updateMessages(self, parameters):
        """Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation."""
        return

    def _create_scratch_folder(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)

    def get_extension(self, f):
        file_name, file_extension = os.path.splitext(f)
        
        return file_extension.lower()

    def zip_output_directory(self, location, name):
        with ZipFile(name, "w", ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(location):
                for fn in files:
                    if self.get_extension(fn) == ".zip":
                        continue

                    absfn = os.path.join(root, fn)
                    zfn = absfn[len(location)+len(os.sep):] #XXX: relative path
                    z.write(absfn, zfn)

    def execute(self, parameters, messages):
        """The source code of the tool."""

        arcpy.AddMessage('---executing')

        database_connection = r"C:\Projects\GitHub\Broadband.Editing\src\gp\AddressTest on itdb110sp.dts.utah.gov.sde\{}"
        feature_name = None
        county = parameters[0].valueAsText
        file_type = parameters[1].valueAsText
        coordinate_system = parameters[2].valueAsText

        arcpy.AddMessage("{}, {}, {}".format(county, file_type, coordinate_system))

        unique_folder = str(uuid.uuid4())
        output_location = arcpy.env.scratchFolder
        
        output_location = os.path.join(arcpy.env.scratchFolder, unique_folder)
        folder_to_zip = output_location

        self._create_scratch_folder(output_location)

        spatial_reference = {
            'stateplane_south': 3567,
            'stateplane_central': 3566,
            'stateplane_north': 3560,
            'utm12' : 26912
        }

        county_lookup = {
            'kane':  "AddressTest.ADDRESSADMIN.KaneAP"
        }

        database_connection = database_connection.format(county_lookup[county])
        feature_name = "{}AddressPoints".format(county)

        if file_type == "fgdb":
            arcpy.AddMessage("Creating File Geodatabase")

            fgdb = "AddressPoints.gdb"
            arcpy.CreateFileGDB_management(output_location, fgdb)

            output_location = os.path.join(output_location, fgdb)

        arcpy.AddMessage(output_location)
        
        arcpy.env.outputCoordinateSystem = arcpy.SpatialReference(spatial_reference[coordinate_system])
        
        arcpy.AddMessage("Reprojecting and Exporting")
        arcpy.FeatureClassToFeatureClass_conversion(database_connection, 
                                                    output_location, 
                                                    feature_name)

        arcpy.AddMessage("Zipping result")
        zip_location = os.path.join(folder_to_zip, feature_name + ".zip")    
        
        self.zip_output_directory(folder_to_zip, zip_location)

        arcpy.SetParameterAsText(3, zip_location)
        
        return
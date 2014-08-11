import arcpy
import os
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

    version = '1.0.3'
    database_connections = None
    feature_name = 'AddressPoints'
    county = None
    file_type = None
    coordinate_system = None

    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "Download Address Points"
        self.description = "Download a counties address points."
        self.canRunInBackground = False
        self.database_connections = {
            'addresses': 'C:\\Projects\\GitHub\\Broadband.Editing\\src\\gp\\Address.sde',
            'sgid': 'C:\\Projects\\GitHub\\Broadband.Editing\\src\\gp\\SGID10.sde'
        }

    def getParameterInfo(self):
        """Define parameter definitions"""

        p0 = arcpy.Parameter(
            displayName='County',
            name='county',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p1 = arcpy.Parameter(
            displayName='File type',
            name='f_type',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p2 = arcpy.Parameter(
            displayName='Coordinate System',
            name='c_system',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p3 = arcpy.Parameter(
            displayName='Zip file',
            name='zip',
            datatype='File',
            parameterType='Derived',
            direction='Output')

        ps = [p0, p1, p2, p3]

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
        with ZipFile(name, 'w', ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(location):
                if 'scratch.gdb' in root:
                    continue
                for fn in files:
                    arcpy.AddMessage(fn)
                    if self.get_extension(fn) == '.zip':
                        arcpy.AddMessage('added')
                        continue

                    absfn = os.path.join(root, fn)
                    # XXX: relative path
                    zfn = absfn[len(location) + len(os.sep):]
                    z.write(absfn, zfn)

    def _get_county(self, county):
        county_fc = 'SGID10.BOUNDARIES.Counties'
        location = self.database_connections['sgid'] + '\\' + county_fc
        where_clause = "NAME = '{}'".format(county)

        arcpy.MakeFeatureLayer_management(location, 'selection', where_clause)

    def _get_address_points(self):
        address_fc = 'AddressPoints'
        location = self.database_connections['addresses'] + '\\' + address_fc

        arcpy.MakeFeatureLayer_management(location, 'address_points')

    def select_features(self, county):
        self._get_county(county)
        self._get_address_points()

        arcpy.SelectLayerByLocation_management('address_points',
                                               'intersect',
                                               'selection')

    def execute(self, parameters, messages):
        """The source code of the tool."""

        arcpy.AddMessage('---executing version ' + self.version)

        self.county = parameters[0].valueAsText
        self.file_type = parameters[1].valueAsText
        self.coordinate_system = parameters[2].valueAsText

        arcpy.AddMessage('{}, {}, {}'.format(
            self.county, self.file_type, self.coordinate_system))

        output_location = arcpy.env.scratchFolder

        folder_to_zip = output_location

        self._create_scratch_folder(output_location)

        spatial_reference = {
            'stateplane_south': 3567,
            'stateplane_central': 3566,
            'stateplane_north': 3560,
            'utm12': 26912
        }

        if self.file_type == 'fgdb':
            arcpy.AddMessage('Creating File Geodatabase')

            fgdb = 'AddressPoints.gdb'
            arcpy.CreateFileGDB_management(output_location, fgdb)

            output_location = os.path.join(output_location, fgdb)

        arcpy.AddMessage(output_location)

        arcpy.env.outputCoordinateSystem = arcpy.SpatialReference(
            spatial_reference[self.coordinate_system])

        arcpy.AddMessage('Selecting Features')
        self.select_features(self.county)

        arcpy.AddMessage('Reprojecting and Exporting')
        name = '{}_{}'.format(self.county.lower(), self.feature_name)
        arcpy.FeatureClassToFeatureClass_conversion('address_points',
                                                    output_location,
                                                    self.feature_name)

        arcpy.AddMessage('Zipping result')
        zip_location = os.path.join(folder_to_zip, name + '.zip')

        self.zip_output_directory(folder_to_zip, zip_location)

        arcpy.SetParameterAsText(3, zip_location)

        return

import arcpy
from os import path

class Toolbox(object):
    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "Toolbox"
        self.alias = ""

        # List of tool classes associated with this toolbox
        self.tools = [Tool]

class Tool(object):
    def __init__(self):
        """Define the tool (tool name is the name of the class)."""
        self.label = "Validate Address Point Upload"
        self.description = ("Unzips an uploaded file and runs validation checks. "
                           "Appends the data to the correct county address point layer.")
        self.canRunInBackground = True

    def getParameterInfo(self):
        """Define parameter definitions"""
        upload_param = arcpy.Parameter(displayName="Address point zip file",
                                       name="zip",
                                       datatype="File",
                                       parameterType="Required",
                                       direction="Input")
        
        output = arcpy.Parameter(displayName="output",
                                      name='output',
                                      datatype='String',
                                      parameterType="Derived",
                                      direction="Output")
                                       
        upload_param.value = "*.zip"
        
        return [upload_param, output]

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
    
    def set_return_value(self, parameters, message):
        pass
    
    def validate_input(self, file_location):
        message = None
        
        is_file = path.isfile(file_location)
        
        if not is_file:
            message = "Please upload a *.zip file containing your address points."
            return message
        
        ftype = file_location.split('.')[2]
#        ms = magic.open(magic.MAGIC_NONE)
#        ms.load()
#        ftype =  ms.file(file_location)
        
        if ftype.lower() != "zip":
            message = "Please upload a *.zip file containing your address points."
            return message
            
        return message

    def execute(self, parameters, messages):
        """The source code of the tool."""
        file_location = parameters[0].value
        message = self.validate_input(file_location)
        
        
        
        return message

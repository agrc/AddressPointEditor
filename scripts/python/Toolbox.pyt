import arcpy

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
                                       
        upload_param.value="The zip file containing your shapefile information or file geodatabase."
        
        return [upload_param]

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

    def execute(self, parameters, messages):
        """The source code of the tool."""
        return
    
def main():
    tool = Tool()
    tool.execute(tool.getParameterInfo(), None)
        
if __name__ == '__main__':
    main()
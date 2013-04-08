import arcpy, os, zipfile

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
        
        is_file = os.path.isfile(file_location)
        
        if not is_file:
            message = "Please upload a *.zip file containing your address points."
            return message
        
        parts = file_location.split('.')
        ftype = parts[len(parts) - 1]
        
        if ftype.lower() != "zip":
            message = "Please upload a *.zip file containing your address points."
            return message
            
        return message
    
    def unzip(self, file_location):
        unzip_location = None
        
        with zipfile.ZipFile(file_location) as zf:
            for member in zf.infolist():
                words = member.filename.split('\\')
                parts = file_location.split('\\')
                
                destination_dir = "\\".join(parts[:-1])
                
                path = destination_dir
                
                for word in words[:-1]:
                    drive, word = os.path.splitdrive(word)
                    head, word = os.path.split(word)
                    
                    if word in (os.curdir, os.pardir, ''):
                        continue
                    path = os.path.join(path, word)
                    
                if unzip_location is None:
                    unzip_location = os.path.join(path,words[0])
                    
                zf.extract(member, path)
        
        return unzip_location

    def execute(self, parameters, messages):
        """The source code of the tool."""
        file_location = parameters[0].value
        message = self.validate_input(file_location)
        
        return message

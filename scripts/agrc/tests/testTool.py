from unittest import TestCase, main
from agrc.gp.Toolbox import Tool
from agrc.tests import helpers
from os import listdir, path

class TestFileInput(TestCase):
                
    def setUp(self):
        self.tool = Tool()
        
        self.bad_file_directory = path.join(path.abspath(path.dirname(__file__)), r"data\bad")
        self.bad_file = path.join(path.abspath(path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
        
        self.good_file = path.join(path.abspath(path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        self.good_file_directory = path.join(path.abspath(path.dirname(__file__)), r'data\good')
            
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\KaneAddressPoints.zip'), self.good_file_directory)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\bad.somethingNotZip'), self.bad_file_directory)
    
    def tearDown(self):
        helpers.delete_directory(self.good_file_directory)
        helpers.delete_directory(self.bad_file_directory)        
    
    def test_bad_file_input(self):
        value = self.tool.validate_input(self.bad_file)
        
        self.assertEqual(value, "Please upload a *.zip file containing your address points.", "wrong message")       
    
    def test_empty_file_input(self):
        empty_location = ""
        
        value = self.tool.validate_input(empty_location)
        
        self.assertEqual(value, "Please upload a *.zip file containing your address points.", "wrong message")             
    
    def test_good_file_input(self):
        value = self.tool.validate_input(self.good_file)
        
        self.assertEqual(value, None, "shoult not get error sinze ends with zip")

class TestDecompression(TestCase):
            
    def setUp(self):
        self.tool = Tool()
        self.bad_file_directory = path.join(path.abspath(path.dirname(__file__)), r"data\bad")
        self.bad_file = path.join(path.abspath(path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
    
        self.good_file = path.join(path.abspath(path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        self.good_file_directory = path.join(path.abspath(path.dirname(__file__)), r'data\good')
        
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\KaneAddressPoints.zip'), self.good_file_directory)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\bad.somethingNotZip'), self.bad_file_directory)
        
    def tearDown(self):
        helpers.delete_directory(self.good_file_directory)
        helpers.delete_directory(self.bad_file_directory)
        
    def test_can_decompress(self):
        location = self.tool.unzip(self.good_file)

        self.assertEqual(len(listdir(location)), 7, 'unzipped count is off') 

class TestShapefileParts(TestCase):
    
    def setUp(self):
        self.tool = Tool()
    
        self.valid_shapefile = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped\shapefile')
        self.missing_schema_shapefile = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped\incompleteshapefile')
        self.parent_shapefile_directory = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped')
        
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\shapefile'), self.valid_shapefile)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\incompleteshapefile'), self.missing_schema_shapefile)

    def tearDown(self):
        helpers.delete_directory(self.parent_shapefile_directory)
            
    def test_valid_shapefile_parts(self):
        is_valid = self.tool.validate_shapefile_parts(self.valid_shapefile)
        
        self.assertEqual(is_valid, True, "this shapefile should be seen as valid")
        
    def test_incomplete_shapefile_parts(self):
        is_valid = self.tool.validate_shapefile_parts(self.missing_schema_shapefile)
        
        self.assertEqual(is_valid, False, "missing dbf and prj")    
    
class TestInputSchema(TestCase):
    
    def setUp(self):
        self.tool = Tool()
    
        self.valid_shapefile = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped\shapefile')
        self.valid_fgdb = path.join(path.abspath(path.dirname(__file__)), r'data\good\KaneAddressPoints.gdb')
        
        self.missing_schema_shapefile = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped\missingschemashapefile')
        
        self.parent_shapefile_directory = path.join(path.abspath(path.dirname(__file__)), r'data\unzipped')
        self.parent_fgdb_directory = path.join(path.abspath(path.dirname(__file__)), r'data\good')
        
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\shapefile'), self.valid_shapefile)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\missingschemashapefile'), self.missing_schema_shapefile)
        helpers.copy(path.join(path.abspath(path.dirname(__file__)), r'data\source\KaneAddressPoints.gdb'), self.valid_fgdb)

    def tearDown(self):
        helpers.delete_directory(self.parent_shapefile_directory)
        helpers.delete_directory(self.parent_fgdb_directory)
    
    def test_valid_shapefile_schema(self):
        errors = self.tool.validate_schema(path.join(self.valid_shapefile, 'Kane Address Points.shp'))
        
        self.assertEqual(len(errors), 0, "schema is valid")
        
    def test_valid_fgdb_schema(self):
        errors = self.tool.validate_schema(path.join(self.valid_fgdb, 'Kane_Address_Points'))
        
        self.assertEqual(len(errors), 0, "schema is valid")
        
    def test_invalid_shapefile_schema(self):
        errors = self.tool.validate_schema(path.join(self.missing_schema_shapefile, 'Kane Address Points.shp'))
        
        self.assertEqual(len(errors), 1)
        self.assertEqual(errors.pop()[0], 'HouseAddr', 'house addr is missing from schema')
    
if __name__=='__main__':
    main()
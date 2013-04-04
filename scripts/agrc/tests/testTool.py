from unittest import TestCase, main
from agrc.gp.Toolbox import Tool
from os import path

class TestFileInput(TestCase):
    tool = None
    
    def setUp(self):
        self.tool = Tool()    
    
    def test_bad_file_input(self):
        location = path.join(path.abspath(path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
        
        value = self.tool.validate_input(location)
        
        self.assertEqual(value, "Please upload a *.zip file containing your address points.", "wrong message")       
    
    def test_empty_file_input(self):
        location = ""
        
        value = self.tool.validate_input(location)
        
        self.assertEqual(value, "Please upload a *.zip file containing your address points.", "wrong message")       
    
    
    def test_zip_file_input_expands_to_new_folder(self):
        location = path.join(path.abspath(path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        
        value = self.tool.validate_input(location)
        
        self.assertEqual(value, None, "shoult not get error sinze ends with zip")

if __name__=='__main__':
    main()
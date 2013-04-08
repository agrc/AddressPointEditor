from unittest import TestCase, main
from agrc.gp.Toolbox import Tool
import os
from shutil import copy, rmtree

class TestFileInput(TestCase):
    
    def create_directory(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        return directory
            
    def setUp(self):
        self.tool = Tool()
        
        self.bad_file_directory = os.path.join(os.path.abspath(os.path.dirname(__file__)), r"data\bad")
        self.bad_file = os.path.join(os.path.abspath(os.path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
        
        self.good_file = os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        self.good_file_directory = os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\good')
            
        copy(os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\KaneAddressPoints.zip'), self.create_directory(self.good_file_directory))
        copy(os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\bad.somethingNotZip'), self.create_directory(self.bad_file_directory))
    
    def tearDown(self):
        if os.path.exists(self.good_file_directory):
            rmtree(self.good_file_directory)
        
        if os.path.exists(self.bad_file_directory):
            rmtree(self.bad_file_directory)
        
    
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

class TestDecompress(TestCase):

    def create_directory(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        return directory
            
    def setUp(self):
        self.tool = Tool()
        self.bad_file_directory = os.path.join(os.path.abspath(os.path.dirname(__file__)), r"data\bad")
        self.bad_file = os.path.join(os.path.abspath(os.path.dirname(__file__)), r"data\bad\bad.somethingNotZip")
    
        self.good_file = os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\good\KaneAddressPoints.zip')
        self.good_file_directory = os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\good')
        
        copy(os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\KaneAddressPoints.zip'), self.create_directory(self.good_file_directory))
        copy(os.path.join(os.path.abspath(os.path.dirname(__file__)), r'data\bad.somethingNotZip'), self.create_directory(self.bad_file_directory))
        
    def tearDown(self):
        if os.path.exists(self.good_file_directory):
            rmtree(self.good_file_directory)
        
        if os.path.exists(self.bad_file_directory):
            rmtree(self.bad_file_directory)
        
    def test_can_decompress(self):
        location = self.tool.unzip(self.good_file)
        print location
        self.assertEqual(len(os.listdir(location)), 7, 'unzipped count is off') 
        
if __name__=='__main__':
    main()
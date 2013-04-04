from unittest import TestCase, main
from agrc.gp.toolbox import Tool
from agrc.gp.models import Parameters

class Tests(TestCase):
    
    def test_output_is_path(self):
        tool = Tool()
        p1 = Parameters('test')
        p2 = Parameters('test2')
    
        value = tool.execute([p1,p2], None)
        self.assertEqual(value, 'test', 'messages arent euqal')
    
if __name__=='__main__':
    main()
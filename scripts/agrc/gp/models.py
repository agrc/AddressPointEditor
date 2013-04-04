class Parameters(object):
    """
        a mostly unnecessary object except for faking arcpy parameters
    """
    def __init__(self, value = None):
        self.value = value
        
    @property
    def get_value(self):
        return self.value
        
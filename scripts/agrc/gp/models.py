class Parameters(object):
    def __init__(self, value = None):
        self.value = value
        
    @property
    def get_value(self):
        return self.value
        
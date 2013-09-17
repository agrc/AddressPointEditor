from os import path, makedirs
from shutil import copy2
from distutils.dir_util import copy_tree, remove_tree

def create_directory(directory):
    if not path.exists(directory):
        makedirs(directory)
    
    return directory

def delete_directory(directory):
    if path.exists(directory):
        remove_tree(directory)
        
def copy(src, dst):
    try:
        copy_tree(src, dst)
    except Exception as inst:
        if 'not a directory' in inst.message:
            create_directory(dst)
            copy2(src, dst)
        else: raise
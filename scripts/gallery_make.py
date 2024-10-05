import os
from jinja2 import Environment, FileSystemLoader
import glob

# Function to find all image files in a directory (recursively)
def find_images_with_dirs(directory):
    supported_extensions = ('.png', '.jpg', '.jpeg', '.gif')
    images_with_dirs = {}
    
    for root, _, files in os.walk(directory):
        relative_path = os.path.relpath(root, directory)
        images = []
        
        for file in files:
            if file.lower().endswith(supported_extensions):
                images.append(file)
        
        if images:
            images_with_dirs[relative_path] = ['/pengers/' + os.path.join(relative_path, img) for img in images]
    
    return images_with_dirs

def collect_museum_images(directory):
    remove_path = directory + '/'
    replace_path_with = '../museum/pengers/'
    image_extensions = ['*.png', '*.gif']
    
    image_files = []
    
    for ext in image_extensions:
        for image_path in glob.glob(os.path.join(directory, ext)):
            image_info = {"original": replace_path_with + image_path.replace(remove_path, ''), "resized": None}
            
            image_files.append(image_info)
    
    return image_files

# Directory to search for images
directory = './site/pengers'  # Change this to your directory
museum_directory = './site/museum/pengers'

# Find all images with their relative directories
images_with_dirs = find_images_with_dirs(directory)
museum_images = collect_museum_images(museum_directory)

# Set up Jinja2 environment and template
env = Environment(loader=FileSystemLoader('.'))  # The current directory
template = env.get_template('./scripts/gallery_template.html')

# Data to pass to the template
data = {
    'title': 'Gallery of Penger',
    'images_with_dirs': images_with_dirs,
    'museum_images': museum_images
}

# Render the HTML file
output_html = template.render(data)

# Write the output to a file
with open('./site/gallery/index.html', 'w') as file:
    file.write(output_html)

print("HTML file created successfully with images!")
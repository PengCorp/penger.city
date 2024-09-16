import os
from jinja2 import Environment, FileSystemLoader

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

# Directory to search for images
directory = './site/pengers'  # Change this to your directory

# Find all images with their relative directories
images_with_dirs = find_images_with_dirs(directory)

# Set up Jinja2 environment and template
env = Environment(loader=FileSystemLoader('.'))  # The current directory
template = env.get_template('./scripts/gallery_template.html')

# Data to pass to the template
data = {
    'title': 'My Image Gallery',
    'images_with_dirs': images_with_dirs
}

# Render the HTML file
output_html = template.render(data)

# Write the output to a file
with open('./site/gallery.html', 'w') as file:
    file.write(output_html)

print("HTML file created successfully with images!")
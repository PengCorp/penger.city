import os
import glob
from PIL import Image
from jinja2 import Environment, FileSystemLoader

def collect_images_with_resize(directory):
    remove_path = directory + '/'
    replace_path_with = 'pengers/'
    image_extensions = ['*.png', '*.gif']
    
    image_files = []
    
    for ext in image_extensions:
        for image_path in glob.glob(os.path.join(directory, ext)):
            image_info = {"original": replace_path_with + image_path.replace(remove_path, ''), "resized": None}
            
            if image_path.find('.gif') == -1:
                try:
                    with Image.open(image_path) as img:
                        width, height = img.size
                        
                        if width < 64 or height < 64:
                            base_name, ext = os.path.splitext(image_path)
                            resized_image_path = f"{base_name}_8x{ext}"
                            
                            resized_img = img.resize((width * 8, height * 8), Image.NEAREST)
                            
                            resized_img.save(resized_image_path)
                            
                            image_info["resized"] = replace_path_with + resized_image_path.replace(remove_path, '')
                except Exception as e:
                    print(f"Error processing image {image_path}: {e}")
            
            image_files.append(image_info)
    
    return image_files

directory = 'site/museum/pengers'
images_with_resizes = collect_images_with_resize(directory)

env = Environment(loader=FileSystemLoader('.'))  # The current directory
template = env.get_template('./scripts/museum_template.html')
    
output_html = template.render({
    "images": images_with_resizes
})

with open('./site/museum/index.html', 'w') as file:
    file.write(output_html)

print("HTML file created successfully with images!")

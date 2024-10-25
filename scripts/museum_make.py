import os
import glob
from jinja2 import Environment, FileSystemLoader

def collect_images_with_resize(directory):
    remove_path = directory + '/'
    replace_path_with = 'pengers/'
    image_extensions = ['*.png', '*.gif']

    image_files = []

    for ext in image_extensions:
        for image_path in glob.glob(os.path.join(directory, ext)):
            image_info = {
                "original": replace_path_with + image_path.replace(remove_path, ''),
                "emoji_name": ":" + os.path.basename(image_path).split(".")[0] + ":"
            }

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

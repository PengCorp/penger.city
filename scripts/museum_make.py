import os
import glob
from jinja2 import Environment, FileSystemLoader

def collect_images(directory):
    remove_path = directory + '/'
    replace_path_with = 'pengers/'
    image_extensions = ['*.png', '*.gif', '*.webp']

    image_files = []

    for ext in image_extensions:
        for image_path in glob.glob(os.path.join(directory, ext)):
            image_info = {
                "original": replace_path_with + image_path.replace(remove_path, ''),
                "emoji_name": ":" + os.path.basename(image_path).split(".")[0] + ":",
                "name": os.path.basename(image_path).split(".")[0],
                "file_name": os.path.basename(image_path)
            }

            image_files.append(image_info)

    return image_files

directory = 'site/museum/pengers'
images_with_resizes = collect_images(directory)
images_with_resizes.sort(key=lambda x: x['name'])

# for i in images_with_resizes:
#     print({
#         'name': i['name'],
#         'file_name': i['file_name'],
#         'emoji_name': i['emoji_name'],
#     })
# exit(0)

env = Environment(loader=FileSystemLoader('.'))  # The current directory
template = env.get_template('./scripts/museum_template.html')

output_html = template.render({
    "images": images_with_resizes
})

with open('./site/museum/index.html', 'w') as file:
    file.write(output_html)

print("HTML file created successfully with images!")

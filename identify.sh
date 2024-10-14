#!/bin/bash

# Check if directory is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

# Check if directory exists
if [ ! -d "$1" ]; then
  echo "Error: Directory $1 does not exist."
  exit 1
fi

# Loop through all files and check if they are valid image files
for file in "$1"/*; do
  # Check for image files by extension
  if [[ $file =~ \.(jpg|jpeg|png|gif|bmp|tiff)$ ]]; then
    # For GIFs, only read the dimensions of the first frame
    if [[ $file =~ \.gif$ ]]; then
      dimensions=$(identify -format "%wx%h" "$file"[0] 2>/dev/null)
    else
      dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
    fi
    
    # Check if identify succeeded
    if [ $? -eq 0 ]; then
      echo "File: $(basename "$file") | Dimensions: $dimensions"
    else
      echo "File: $(basename "$file") | Error reading dimensions"
    fi
  else
    echo "Skipping non-image file: $(basename "$file")"
  fi
done
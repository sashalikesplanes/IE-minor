#!/Users/sasha/.pyenv/versions/ie-minor/bin/python
import json
import numpy as np
import imageio.v3 as iio
import sys
import os

print(sys.argv) 
image_files = []

for file in sys.argv[1:]:

    try:
        im = iio.imread(file)
    except Exception as e:
        print('error: ', e)
        continue
    im_no_transparency = im[:, :, 0:3]

# Flip every other row to allign with pattern of LEDs
    im_flipped = []
    for i, row in enumerate(im_no_transparency):
        if i % 2 == 0:
            im_flipped.append(row[::-1])
        else:
            im_flipped.append(row)

    im_reshaped = np.reshape(np.array(im_flipped), (256, 3))
    pixel_list = [tuple(pixel.tolist()) for pixel in im_reshaped]

    with open(file.split('.')[0] + '.json', 'w') as f:
        json.dump(pixel_list, f)

    print('done converting: ' + file)




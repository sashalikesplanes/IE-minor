#!/Users/sasha/.pyenv/versions/ie-minor/bin/python
import json
import numpy as np
import imageio.v3 as iio
import sys

im = iio.imread(sys.argv[1] + '.png')
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

with open(sys.argv[1] + '.json', 'w') as f:
    json.dump(pixel_list, f)

print('done converting: ' + sys.argv[1])


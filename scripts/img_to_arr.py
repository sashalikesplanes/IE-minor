#!/Users/sasha/.pyenv/versions/ie-minor/bin/python
import json
import numpy as np
import imageio.v3 as iio
import sys

im = iio.imread(sys.argv[1] + '.png')
im = np.reshape(im[:, :, 0:3], (256, 3))
pixel_list = [tuple(pixel.tolist()) for pixel in im]

with open(sys.argv[1] + '.json', 'w') as f:
    json.dump(pixel_list, f)

print('done converting: ' + sys.argv[1])


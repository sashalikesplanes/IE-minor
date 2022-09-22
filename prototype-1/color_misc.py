
RED = (255, 0, 0)
MINUS_RED = (-255, 0, 0)
YELLOW = (255, 150, 0)
GREEN = (0, 255, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
MINUS_BLUE = (0, 0, -255)
PURPLE = (180, 0, 255)

def clear_pixels(pixels, num_pixels):
    for i in range(0, num_pixels):
        pixels[i] = (0, 0, 0)

def colour_strip(colour, strips):
    for strip in strips:
        for i in range(strip*16, strip*16+16):
            previous_colour = pixels[i]
            new_colour = tuple([max(0, min(255, prev_colour_channel + new_colour_channel)) for prev_colour_channel, new_colour_channel in zip(previous_colour, colour)])
            pixels[i] = new_colour

            if colour == CLEAR:
                pixels[i] = CLEAR

def colour_chase(colour, wait):
    for i in range(num_pixels):
        pixels[i] = colour
        time.sleep(wait)
        pixels.show()
    time.sleep(0.5)

def rainbow_cycle(wait):
    for j in range(255):
        for i in range(num_pixels):
            rc_index = (i * 256 // num_pixels) + j
            pixels[i] = colorwheel(rc_index & 255)
            if i in eyes_pix or i in smile_pix:
                pixels[i] = (255, 255, 255)
        pixels.show()
        time.sleep(wait)

def epilepsy():
    for i in range(0, 256):
        pixels[i] = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    pixels.show()

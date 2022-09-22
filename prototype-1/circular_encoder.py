    # Fit encoder within bounds
    # position 0 is all off
    # position = encoder.position
    #
    # if position > 15:
    #     position = 15
    #     encoder.position = 15
    # elif position < 0:
    #     position = 0
    #     encoder.position = 0
    #
    # if position != last_position:
    #     print(position, last_position)
    #     if position - last_position > 0:
    #         colour_strip(RED, range(last_position, position + 1))
    #         colour_strip(BLUE, range(15 - last_position, 15 - position - 1, -1))
    #         pixels.show()
    #     else:
    #         colour_strip(MINUS_RED, range(last_position, position, -1))
    #         colour_strip(MINUS_BLUE, range(15 - last_position, 15 - position))
    #         pixels.show()
    # last_position = position

    # if button.value is True and last_state is False:
    #     print("Reset Encoder Position...")
    #     encoder.position = 0
    # last_state = button.value

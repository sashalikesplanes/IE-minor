#include <Arduino.h>

struct SolidBehaviour
{
  float start_time;
  uint32_t colour;
  float duration;
  float fadein_duration;
  float fadeout_duration;
  float fade_power;
  int pixels[5][2]; // NOTE have to fill all these
};

struct MessageBehaviour
{
  float start_time;
  uint32_t colour;
  float message_width;
  float pace;
  int strip_idx;
  int start_idx;
  int end_idx;
};

std::vector <

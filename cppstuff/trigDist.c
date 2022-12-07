#include <assert.h>
#include <math.h>
#include <stdio.h>

float calculateTrigDistance(int x1, int y1, int z1, int x2, int y2, int z2) {
  // Calculate the trig distance between two 3D points
  float trigDistance =
      pow(pow((x2 - x1), 2.0) + pow((y2 - y1), 2.0) + pow((z2 - z1), 2.0), 0.5);

  return trigDistance;
}

float linearWithCutoff(float x, int xMax, int xMin, float yMax, float yMin) {
  // Maps the input value (x) on a linear graph where:
  //  if x < xMax return yMax
  //  if x > xMin return yMin
  //  if xMax < x < xMin a proportional scaling between yMax and yMin
  if (x < (float)xMax) {
    return yMax;
  };
  if (x > (float)xMin) {
    return yMin;
  };

  float gradient = (yMin - yMax) / ((float)xMin - (float)xMax);
  return yMax + gradient * (x - xMax);
}

float distanceInfluence(int x1, int y1, int z1, int x2, int y2, int z2,
                        int dInner, int dOuter) {
  // Compute the trig distance between point 1 and point 2 and output a float
  // between 0 and 1 inc If the distance is smaller than rInner then 1 If grater
  // than rOuter then 0 Between rOuter and rInner have a linear scale
  float rOuter = (float)dOuter / 2.0;
  float rInner = (float)dInner / 2.0;
  float trigDist = calculateTrigDistance(x1, y1, z1, x2, y2, z2);

  float returnValue = linearWithCutoff(trigDist, rInner, rOuter, 1.0, 0.0);
  return returnValue;
}

int main() {
  // Tests for trig distance function
  assert(calculateTrigDistance(1, 1, 1, 1, 1, 1) == 0);
  assert(fabs(calculateTrigDistance(1, 1, 1, 0, 0, 0) - 1.732) < 0.01);
  assert(fabs(calculateTrigDistance(2, 4, 9, 0, 5, 4) - 5.47723) < 0.0001);

  // Test the linear interpolation
  assert(fabs(linearWithCutoff(2.0, 1, 3, 1.0, 0.0) - 0.5) < 0.00001);
  assert(fabs(linearWithCutoff(1.2, 1, 9, 17.0, 12.0) - 16.875) < 0.00001);
  assert(fabs(linearWithCutoff(0.5, 1, 3, 1.0, 0.0) - 1.0) < 0.00001);
  assert(fabs(linearWithCutoff(3.754, 1, 3, 1.0, 0.0) - 0.0) < 0.00001);

  // Test the main function
  assert(fabs(distanceInfluence(1, 1, 1, 0, 0, 0, 2, 6) - 0.6339746) < 0.00001);
}

#include <iostream>
#include "nanodet.h"
int main()
{
    NanoDet detector = NanoDet("./nanodet-train2.param", "./nanodet-train2.bin", true);
    std::cout << "Hello from ny first CPP project" << std::endl;
    return 0;
}
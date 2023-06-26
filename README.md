# MIKE - Mycorrhizal Interactive Kinetic Exhibit

MIKE, short for Mycorrhizal Interactive Kinetic Exhibit, is an interactive control system designed to mimic the behaviors of mycorrhizal networks, the complex networks formed by fungi and plant roots underground. By using moving LED lights and infrared cameras to detect human presence, this project provides an interactive and illustrative representation of these fascinating biological networks. The project was developed as part of the Industrial Design program at TU Delft during the academic years 2022-2023.

## Features

- The system uses a C++ program to access and process data from the infrared cameras. The data is processed through an object detection neural network.
- A TypeScript controller that triggers behaviors based on human detection from the neural network.
- An embedded program on a microcontroller using CircuitPython to perform the behaviors through updating the LEDs.

## Project Structure

The project is divided into several parts as seen in the directory structure:

- `comp-node`: This directory contains the TypeScript controller, which serves as the event message handler. It triggers the behaviors based on detections made by the neural network.
- `images`: This directory contains the training data used for the object detection neural network.
- `itsy-bitsy`: This directory holds the embedded program for the microcontroller, written in CircuitPython, which is responsible for updating the LEDs to perform various behaviors.
- `kinect-nn`: Here, you'll find the C++ program that interfaces with the Kinect devices and feeds the data into the Nanodet neural network for object (in this case, human) detection.
- `nanodet-params`: This directory contains the parameters of the trained Nanodet model.
- `scripts`: A collection of helper scripts used for various tasks in the project.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgements

This project was developed during the academic years 2022-2023 as part of an Industrial Design program at TU Delft.

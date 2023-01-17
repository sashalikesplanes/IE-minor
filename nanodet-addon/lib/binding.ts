const addon = require("../build/Release/nanodet-native");

function NanoDet(
  bin: string,
  param: string,
  useGPU: boolean,
  showImage: boolean
) {
  // @ts-ignore
  this.detectFromImage = function (imagePath: string) {
    return _addonInstance.detectFromImage(imagePath);
  };

  var _addonInstance = new addon.NanoDet(bin, param, useGPU, showImage);
}

module.exports = NanoDet;

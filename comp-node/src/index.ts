import { imageBuffer, imageBuffer$ } from "./express";
import * as fs from "fs";
import { ArgumentOutOfRangeError, map, tap } from "rxjs";
import { join } from "path";
const sizeOf = require("image-size");
const NanoDet = require("nanodet");
console.log(NanoDet);

function saveImage(img: imageBuffer) {
  console.log(__dirname);
  fs.writeFile(
    join(__dirname, "..", "..", "images", "17-01-morning", img.name),
    img.buffer,
    "binary",
    () => {
      console.log("image saved sucesffully");
    }
  );
}

const detection$ = imageBuffer$.pipe(tap(saveImage));

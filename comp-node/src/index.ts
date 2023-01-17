import { imageBuffer, imageBuffer$ } from "./express";
import { Nanodet } from "./nanodet-wrapper";
import * as fs from "fs";
import { map } from "rxjs";
import { join } from "path";
const sizeOf = require("image-size");

imageBuffer$.subscribe((img) => {
  console.log("got image");
});

function saveImage(img: imageBuffer) {
  console.log(__dirname);
  fs.writeFile(join(__dirname, "test.jpg"), img.buffer, "binary", () => {
    console.log("image saved sucesffully");
  });
}

// Nanodet.then((nanodet) => {
//   const detection$ = imageBuffer$
//     .pipe(
//       map(({ buffer, name }) => {
//         const imageInfo = sizeOf(buffer);

//         buffer.BYTES_PER_ELEMENT;
//         console.log("about to go in");
//         const pointer = nanodet._malloc(
//           buffer.length * buffer.BYTES_PER_ELEMENT
//         );
//         nanodet.HEAPU8.set(buffer, pointer);
//         nanodet._nanodet_ncnn(pointer, imageInfo.width, imageInfo.height);

//         const result = nanodet.HEAPU8.subarray(
//           pointer,
//           pointer + buffer.length
//         );
//         console.log("got result from ncnn", result);
//       })
//     )
//     .subscribe((detections) => {
//       console.log(detections);
//     });
// });

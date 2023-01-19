import { Observable } from "rxjs";
import * as fs from "fs";
import { tap } from "rxjs";
import { join } from "path";

const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({ storage });

const expressApp = express();
const port = 3000;

export type imageBuffer = { buffer: Buffer; name: string };

export const imageBuffer$ = new Observable<imageBuffer>((subscriber) => {
  // @ts-ignore
  expressApp.post("/cam0", upload.single("image"), (req, res) => {
    subscriber.next({ buffer: req.file.buffer, name: req.file.originalname });
    res.end();
  });
});

expressApp.listen(port, () => {
  console.log("listening on port " + port);
});

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

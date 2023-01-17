import { Observable } from "rxjs";

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

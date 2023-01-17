const moduleFactory = require("./nanodet-basic.js");
type Module = {
  _malloc: (size: number) => number;
  _free: (pointer: number) => void;
  ccall: (args: any[]) => void;
  HEAPU8: Uint8Array;
  _nanodet_ncnn: (pointer: number, width: number, height: number) => number;
  UTF8ToString: (pointer: number) => string;
};

export const Nanodet = new Promise<Module>((res) => {
  moduleFactory().then((Module: any) => {
    res(Module);
  });
});

Nanodet.then((nanodet) => {
  let pointer = null;
  const detection$ = imageBuffer$
    .pipe(
      tap(saveImage),
      map(async ({ buffer, name }) => {
        const imageSrc = await Jimp.read(buffer);
        imageSrc.write();
        const imageData = imageSrc.bitmap;

        const pointer = nanodet._malloc(imageData.length);
        console.log("pointer ", pointer);
        console.log("the raw image ", imageData);

        nanodet.HEAPU8.set(imageData.data, pointer);

        console.time("detection");
        const objectPointer = nanodet._nanodet_ncnn(
          pointer,
          imageData.width,
          imageData.height
        );
        const objects = nanodet.UTF8ToString(objectPointer);
        console.timeLog("detection");
        console.timeEnd("detection");

        console.log("detection objects", objects);

        const result = nanodet.HEAPU8.subarray(
          pointer,
          pointer + imageData.data.length
        );

        await Jimp.read(result);

        imageData.data = result;
        imageData.write(
          join(__dirname, "..", "..", "images", "17-01-morning", "det-" + name)
        );

        nanodet._free(pointer);
        return objects;
      })
    )
    .subscribe((detections) => {
      console.log(detections);
    });
});

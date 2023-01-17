const moduleFactory = require("./nanodet-basic.js");
type Module = {
  _malloc: (size: number) => number;
  _free: (buf: Uint8Array) => void;
  ccall: (args: any[]) => void;
  HEAPU8: Uint8Array;
  _nanodet_ncnn: (pointer: number, width: number, height: number) => void;
};

export const Nanodet = new Promise<Module>((res) => {
  moduleFactory().then((Module: any) => {
    console.log("about to go in");
    res(Module);
  });
});

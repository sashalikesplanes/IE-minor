const moduleFactory = require('./nanodet-basic.js');
export const Nanodet = new Promise((res) => {
  moduleFactory().then((Module: any) => {
    res(Module)
  });
})
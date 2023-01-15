export const Module = require('./nanodet-basic.js')
Module.locateFile = (path: string, prefix: string) => {
  console.warn('locateFile', path, prefix);
  return `./nanodet/${path}`;
} 
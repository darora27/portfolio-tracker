declare module "three/addons/libs/ktx-parse.module.js" {
  export type KtxContainer = {
    pixelWidth: number;
    pixelHeight: number;
  };

  export function read(data: Uint8Array): KtxContainer;
}

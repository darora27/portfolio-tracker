import { read } from "three/addons/libs/ktx-parse.module.js";
import { ZSTDDecoder } from "three/addons/libs/zstddec.module.js";

const KHR_SUPERCOMPRESSION_ZSTD = 2;
const VK_FORMAT_R8_UNORM = 9;
const VK_FORMAT_R8G8_UNORM = 16;
const VK_FORMAT_R8G8B8A8_UNORM = 37;
const VK_FORMAT_R8G8B8A8_SRGB = 43;

type RawKtxContainer = {
  vkFormat: number;
  pixelWidth: number;
  pixelHeight: number;
  pixelDepth: number;
  layerCount: number;
  faceCount: number;
  supercompressionScheme: number;
  levels: Array<{
    levelData: Uint8Array;
    uncompressedByteLength: number;
  }>;
};

type TextureDecodeRequest = {
  id: number;
  url: string;
};

type TextureDecodeResponse =
  | {
      id: number;
      data: ArrayBuffer;
      width: number;
      height: number;
      channels: 1 | 2 | 4;
    }
  | {
      id: number;
      error: string;
    };

const workerScope = self as unknown as {
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<TextureDecodeRequest>) => void,
  ): void;
  postMessage(message: TextureDecodeResponse, transfer?: Transferable[]): void;
};

const decoderPromise = (async () => {
  const decoder = new ZSTDDecoder();
  await decoder.init();
  return decoder;
})();

function channelsForFormat(vkFormat: number): 1 | 2 | 4 {
  if (vkFormat === VK_FORMAT_R8_UNORM) return 1;
  if (vkFormat === VK_FORMAT_R8G8_UNORM) return 2;
  if (
    vkFormat === VK_FORMAT_R8G8B8A8_SRGB ||
    vkFormat === VK_FORMAT_R8G8B8A8_UNORM
  ) {
    return 4;
  }
  throw new Error(`Unsupported raw KTX2 vkFormat: ${vkFormat}`);
}

workerScope.addEventListener("message", async ({ data: request }) => {
  try {
    const response = await fetch(request.url);
    if (!response.ok) {
      throw new Error(`Texture request failed with ${response.status}`);
    }
    const container = read(
      new Uint8Array(await response.arrayBuffer()),
    ) as unknown as RawKtxContainer;
    if (
      container.supercompressionScheme !== KHR_SUPERCOMPRESSION_ZSTD ||
      container.levels.length !== 1 ||
      container.pixelDepth !== 0 ||
      container.layerCount !== 0 ||
      container.faceCount !== 1
    ) {
      throw new Error("Unsupported KTX2 container layout");
    }
    const level = container.levels[0];
    const decoder = await decoderPromise;
    const decoded = decoder.decode(
      level.levelData,
      level.uncompressedByteLength,
    );
    const output = decoded.slice().buffer as ArrayBuffer;
    workerScope.postMessage(
      {
        id: request.id,
        data: output,
        width: container.pixelWidth,
        height: container.pixelHeight,
        channels: channelsForFormat(container.vkFormat),
      },
      [output],
    );
  } catch (error) {
    workerScope.postMessage({
      id: request.id,
      error: error instanceof Error ? error.message : "Texture decode failed",
    });
  }
});

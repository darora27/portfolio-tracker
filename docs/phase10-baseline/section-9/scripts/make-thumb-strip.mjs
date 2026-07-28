import sharp from "sharp";
import path from "node:path";

const tickers = ["asml", "goog", "msft", "ibm", "cost", "intc", "nbis", "cbrs"];
const tiles = await Promise.all(
  tickers.map((ticker) =>
    sharp(`public/textures/planets/thumbs/${ticker}-base-32.png`)
      .resize(128, 64, { kernel: "nearest" })
      .extend({ top: 0, bottom: 22, left: 0, right: 0, background: "#020706" })
      .composite([{
        input: Buffer.from(
          `<svg width="128" height="22"><rect width="128" height="22" fill="#020706"/><text x="64" y="16" text-anchor="middle" fill="#eef8ef" font-family="monospace" font-size="14">${ticker.toUpperCase()}</text></svg>`,
        ),
        top: 64,
        left: 0,
      }])
      .png()
      .toBuffer(),
  ),
);

await sharp({
  create: {
    width: 512,
    height: 172,
    channels: 3,
    background: "#020706",
  },
})
  .composite(
    tiles.map((input, index) => ({
      input,
      left: (index % 4) * 128,
      top: Math.floor(index / 4) * 86,
    })),
  )
  .png()
  .toFile(
    path.resolve(
      "docs/phase10-baseline/section-9/texture-thumbs/authored-map-thumbs-strip.png",
    ),
  );

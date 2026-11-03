// Achtergrond weghalen in een aparte worker. De bibliotheek gebruikt eval (ndarray); in de worker
// mag dat zonder de CSP van de pagina zelf te verzwakken. Ontvangt een Blob, stuurt een Blob terug.
import { removeBackground } from "@imgly/background-removal";

/** Snijdt de doorzichtige rand weg zodat de uitsnede het vak vult. */
async function trim(png: Blob) {
  const bmp = await createImageBitmap(png);
  const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext("2d")!;
  g.drawImage(bmp, 0, 0);
  const a = g.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (a[(y * c.width + x) * 4 + 3]! > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 <= x0 || y1 <= y0) return null; // niets overgebleven: geen bruikbare uitsnede
  const out = new OffscreenCanvas(x1 - x0 + 1, y1 - y0 + 1);
  out.getContext("2d")!.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.convertToBlob({ type: "image/webp", quality: 0.85 });
}

self.onmessage = async (e: MessageEvent<Blob>) => {
  try {
    const png = await removeBackground(e.data, {
      model: "isnet_fp16",
      output: { format: "image/png" },
      // Moet void teruggeven: de bibliotheek valideert de callback.
      progress: (key, cur, total) => { if (key.startsWith("fetch")) postMessage({ p: Math.round((cur / total) * 100) }); },
    });
    postMessage({ blob: await trim(png) });
  } catch (err) {
    postMessage({ error: String(err) });
  }
};

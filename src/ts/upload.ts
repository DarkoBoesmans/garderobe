// Stuk toevoegen: foto opnieuw coderen (weg met EXIF en GPS), achtergrond weg in de browser, opladen.
import { S } from "./state";
import { isStatic, load } from "./store";
import { BUCKET, sb } from "./supa";

const MAX = 1600;

/** Draait volgens EXIF, verkleint en codeert opnieuw als WebP. Zo verdwijnt alle metadata, ook de GPS-locatie. */
async function clean(file: Blob) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const s = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
  const c = new OffscreenCanvas(Math.round(bmp.width * s), Math.round(bmp.height * s));
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.convertToBlob({ type: "image/webp", quality: 0.85 });
}

/** Laat de worker de achtergrond weghalen. Eén worker per sessie; het model blijft daarin geladen. */
let worker: Worker | null = null;
function cutout(img: Blob, progress: (t: string) => void) {
  worker ??= new Worker("cutout.worker.js", { type: "module" });
  const w = worker;
  return new Promise<Blob | null>((ok, fail) => {
    w.onmessage = (e: MessageEvent<{ p?: number; blob?: Blob | null; error?: string }>) => {
      if (e.data.p != null) progress(`Model laden ${e.data.p}%`);
      else if (e.data.error) fail(new Error(e.data.error));
      else ok(e.data.blob ?? null);
    };
    w.postMessage(img);
  });
}

const put = async (path: string, blob: Blob) => {
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp" });
  if (error) throw error;
};

/** Voegt foto's toe als nieuwe stukken. Geeft het id van het laatste stuk terug. */
export async function addPhotos(files: File[], removeBg: boolean, progress: (t: string) => void) {
  let last = "";
  for (const [i, f] of files.entries()) {
    const tag = files.length > 1 ? `Foto ${i + 1} van ${files.length}: ` : "";
    progress(`${tag}foto voorbereiden…`);
    let img: Blob;
    try { img = await clean(f); } catch { throw new Error("Deze foto kan de browser niet openen. Kies een JPG of PNG (iPhone: deel als 'Meest compatibel')."); }
    const id = crypto.randomUUID(), photo = `${S.uid}/${id}-o.webp`;
    let cut: Blob | null = null;
    if (removeBg) {
      progress(`${tag}achtergrond weghalen…`);
      cut = await cutout(img, (t) => progress(tag + t)).catch((e) => { console.warn("Achtergrond weghalen mislukt", e); return null; }); // we houden de gewone foto
    }
    progress(`${tag}opladen…`);
    await put(photo, img);
    if (cut) await put(`${S.uid}/${id}-c.webp`, cut);
    const { error } = await sb.from("items").insert({
      id, photo_path: photo, cutout_path: cut ? `${S.uid}/${id}-c.webp` : null,
      data: { added: new Date().toISOString().slice(0, 10), missing: ["name", "brand", "category", "colors", "size"] },
    });
    if (error) throw error;
    last = id;
  }
  await load();
  return last;
}

/** Slechte uitsnede: terug naar de gewone foto. */
export async function dropCutout(id: string, path: string) {
  const { error } = await sb.from("items").update({ cutout_path: null }).eq("id", id);
  if (error) throw error;
  if (!isStatic(path)) await sb.storage.from(BUCKET).remove([path]);
  await load();
}

/** Uitsneden maken voor stukken die er nog geen hebben (bv. na de import). Slaat mislukte over. */
export async function cutoutAll(progress: (t: string) => void) {
  const todo = S.items.filter((i) => !i.cutout && i.photo);
  let done = 0;
  for (const [n, it] of todo.entries()) {
    progress(`Stuk ${n + 1} van ${todo.length}…`);
    const cut = await cutout(await (await fetch(it.photo!)).blob(), (t) => progress(`Stuk ${n + 1} van ${todo.length}: ${t}`)).catch(() => null);
    if (!cut) continue;
    const path = `${S.uid}/${it.id}-c.webp`;
    await put(path, cut);
    const { error } = await sb.from("items").update({ cutout_path: path }).eq("id", it.id);
    if (error) throw error;
    done++;
  }
  await load();
  return done;
}

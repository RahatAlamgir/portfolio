/* Image / PDF fields: pick a file, resize and convert photos to WebP in the browser, upload on save. */

import { state, pending, refreshDirty, FILE_KEYS, MAX_IMAGE_WIDTH } from "./state.js";
import { el, toast } from "./util.js";

const isPdf = (value) => /\.pdf$/i.test(value || "");
const previewSrc = (value) => (value ? pending.get(value)?.url || `../${value}` : "");

const readAsDataURL = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

export function fileField(parent, key, label) {
  const input = el("input", { type: "text", placeholder: "assets/…" });
  input.value = parent[key] || "";
  const note = el("span", { className: "img-note" });
  const thumbHolder = el("span", {});

  const drawThumb = () => {
    const value = parent[key];
    thumbHolder.replaceChildren(isPdf(value)
      ? el("span", { className: "img-thumb file", text: "PDF" })
      : el("img", { className: "img-thumb", alt: "", src: previewSrc(value), onerror: (e) => { e.target.style.visibility = "hidden"; } }));
  };
  drawThumb();

  input.addEventListener("input", () => { parent[key] = input.value; drawThumb(); refreshDirty(); });

  const picker = el("input", { type: "file", hidden: true, accept: key === "cv" ? "application/pdf" : "image/*" });
  picker.addEventListener("change", async () => {
    const file = picker.files[0];
    if (!file) return;
    note.textContent = "Processing…";
    try {
      const asset = await prepareUpload(file, key, parent[key]);
      pending.set(asset.path, { b64: asset.b64, url: asset.url, owner: state.current });
      parent[key] = asset.path;
      input.value = asset.path;
      drawThumb();
      note.textContent = `Ready (${Math.round(asset.size / 1024)} KB), uploads on save`;
      refreshDirty();
    } catch (error) {
      note.textContent = "";
      toast(`Upload failed: ${error.message}`, true);
    }
    picker.value = "";
  });

  return el("div", { className: "field" }, [
    el("span", { className: "field-label", text: label }),
    el("div", { className: "img-field" }, [
      thumbHolder,
      el("div", { className: "img-main" }, [
        input,
        el("button", { className: "btn small", type: "button", text: key === "cv" ? "Upload PDF" : "Upload image", onclick: () => picker.click() }),
        note,
        picker
      ])
    ])
  ]);
}

/** Photos are resized and converted to WebP in the browser, like the site's existing images. */
async function prepareUpload(file, key, currentValue) {
  const folder = currentValue && currentValue.includes("/") ? currentValue.slice(0, currentValue.lastIndexOf("/")) : FILE_KEYS[key];
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "file";
  let blob = file;
  let ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || "bin").toLowerCase();

  if (/^image\/(png|jpe?g|webp)$/.test(file.type)) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) throw new Error("This browser cannot convert to WebP.");
    ext = "webp";
  } else if (key !== "cv" && file.type !== "image/svg+xml") {
    throw new Error("Please choose a PNG, JPG, WebP or SVG image.");
  }
  if (blob.size > 5 * 1024 * 1024) throw new Error("File is larger than 5 MB.");

  const url = await readAsDataURL(blob);
  return { path: `${folder}/${base}.${ext}`, b64: url.slice(url.indexOf(",") + 1), url, size: blob.size };
}

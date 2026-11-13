/* Form builders: turn any JSON value into editable fields (objects, arrays, primitives, raw JSON). */

import { docs, openCards, hooks, refreshDirty, FILE_KEYS } from "./state.js";
import { el, isObject, humanize } from "./util.js";
import { fileField } from "./uploads.js";

export function objectEditor(obj, sig, path, doc) {
  const box = el("div", {});
  for (const [key, value] of Object.entries(obj)) {
    const childSig = `${sig}.${key}`;
    const childPath = `${path}.${key}`;
    if (Array.isArray(value)) box.append(arrayEditor(value, humanize(key), childSig, childPath, doc));
    else if (isObject(value)) {
      box.append(el("fieldset", { className: "group" }, [el("legend", { text: humanize(key) }), objectEditor(value, childSig, childPath, doc)]));
    } else box.append(primitiveField(obj, key, humanize(key), doc));
  }
  return box;
}

function summarize(item, index) {
  if (isObject(item)) {
    const pick = item.title ?? item.name ?? item.label ?? item.id ?? item.prefix;
    if (typeof pick === "string" && pick.trim()) return pick;
  }
  return `Item ${index + 1}`;
}

export function arrayEditor(arr, label, sig, path, doc, isRoot = false) {
  const itemSig = `${sig}[]`;
  const allPrimitive = arr.every((v) => !isObject(v) && !Array.isArray(v));
  const makeNew = () => {
    const template = doc.templates.get(sig);
    return template === undefined ? "" : structuredClone(template);
  };

  const add = el("button", { className: "btn small", type: "button", text: "+ Add", onclick: () => {
    arr.push(makeNew());
    if (!allPrimitive || isObject(arr[arr.length - 1])) openCards.add(`${path}.${arr.length - 1}`);
    hooks.render();
  } });

  const head = el("div", { className: "group-head" }, [
    el("span", { text: label }),
    el("span", { className: "count", text: `(${arr.length})` }),
    el("span", { className: "grow" }),
    add
  ]);

  const list = el("div", {});
  arr.forEach((item, index) => {
    const move = (to) => { if (to < 0 || to >= arr.length) return; [arr[index], arr[to]] = [arr[to], arr[index]]; hooks.render(); };
    const remove = () => {
      if (confirm(`Delete "${isObject(item) ? summarize(item, index) : item}"?`)) { arr.splice(index, 1); hooks.render(); }
    };
    const iconBtn = (text, title, onclick, extra = "") =>
      el("button", { className: `btn small icon ${extra}`, type: "button", title, "aria-label": title, text, onclick: (e) => { e.preventDefault(); e.stopPropagation(); onclick(); } });

    if (isObject(item) || Array.isArray(item)) {
      const cardPath = `${path}.${index}`;
      const title = el("span", { className: "card-title", text: summarize(item, index) });
      const body = el("div", { className: "card-body" }, [
        isObject(item) ? objectEditor(item, itemSig, cardPath, doc) : arrayEditor(item, "Items", itemSig, cardPath, doc)
      ]);
      const card = el("details", { className: "card" }, [
        el("summary", {}, [
          el("span", { className: "card-num", text: String(index + 1).padStart(2, "0") }),
          title,
          el("span", { className: "card-actions" }, [
            iconBtn("↑", "Move up", () => move(index - 1)),
            iconBtn("↓", "Move down", () => move(index + 1)),
            iconBtn("⧉", "Duplicate", () => { arr.splice(index + 1, 0, structuredClone(item)); hooks.render(); }),
            iconBtn("✕", "Delete", remove, "danger")
          ])
        ]),
        body
      ]);
      card.open = openCards.has(cardPath) || (isRoot && arr.length <= 3);
      card.addEventListener("toggle", () => { card.open ? openCards.add(cardPath) : openCards.delete(cardPath); });
      card.addEventListener("input", () => { title.textContent = summarize(item, index); });
      list.append(card);
    } else {
      list.append(el("div", { className: "prim-row" }, [
        primitiveField(arr, index, "", doc),
        iconBtn("↑", "Move up", () => move(index - 1)),
        iconBtn("↓", "Move down", () => move(index + 1)),
        iconBtn("✕", "Delete", remove, "danger")
      ]));
    }
  });

  return el("div", { className: isRoot ? "" : "group" }, [head, list]);
}

function primitiveField(parent, key, label, doc) {
  const value = parent[key];
  const labelEl = label && el("span", { className: "field-label", text: label });

  if (typeof value === "boolean") {
    const box = el("input", { type: "checkbox" });
    box.checked = value;
    box.addEventListener("change", () => { parent[key] = box.checked; refreshDirty(); });
    return el("label", { className: "field inline" }, [box, el("span", { className: "field-label", text: label })]);
  }

  if (typeof value === "number") {
    const input = el("input", { type: "number", step: "any" });
    input.value = value;
    input.addEventListener("input", () => { parent[key] = input.value === "" ? 0 : Number(input.value); refreshDirty(); });
    return el("label", { className: "field" }, [labelEl, input]);
  }

  if (typeof key === "string" && key in FILE_KEYS) return fileField(parent, key, label);

  const text = value == null ? "" : String(value);
  const long = text.length > 90 || text.includes("\n");
  const input = long
    ? el("textarea", { rows: Math.min(12, Math.max(3, Math.ceil(text.length / 80) + text.split("\n").length - 1)) })
    : el("input", { type: "text" });
  input.value = text;
  input.addEventListener("input", () => { parent[key] = input.value; refreshDirty(); });
  return el("label", { className: "field" }, [labelEl, input]);
}

export function rawEditor(doc) {
  const message = el("p", { className: "error", hidden: true });
  const area = el("textarea", { className: "raw", spellcheck: "false", "aria-label": "Raw JSON" });
  area.value = JSON.stringify(doc.data, null, 2);
  area.addEventListener("input", () => {
    try {
      doc.data = JSON.parse(area.value);
      doc.rawError = "";
      message.hidden = true;
    } catch (error) {
      doc.rawError = error.message;
      message.textContent = error.message;
      message.hidden = false;
    }
    refreshDirty();
  });
  return el("div", {}, [area, message]);
}

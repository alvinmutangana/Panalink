"use client";

import { useState } from "react";
import type { PhotoLabels } from "../lib/photos-i18n";

const MAX = 3;

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("compress"))),
      "image/jpeg",
      0.7
    )
  );
}

export default function PhotoUploader({
  initial = [],
  labels,
}: {
  initial?: string[];
  labels: PhotoLabels;
}) {
  const [urls, setUrls] = useState<string[]>(initial.slice(0, MAX));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || urls.length >= MAX) return;

    try {
      setBusy(true);
      setStatus(labels.compressing);
      const blob = await compress(file);

      setStatus(labels.uploading);
      const fd = new FormData();
      fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error("upload");

      setUrls((prev) => [...prev, data.url].slice(0, MAX));
      setStatus("");
    } catch {
      setStatus(labels.error);
    } finally {
      setBusy(false);
    }
  }

  function remove(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
    setStatus("");
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{labels.title}</legend>
      <p className="text-sm text-muted-foreground">{labels.hint}</p>

      {urls.map((u) => (
        <input key={u} type="hidden" name="images" value={u} />
      ))}

      {urls.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {urls.map((u, i) => (
            <li key={u} className="relative">
              <img
                src={u}
                alt=""
                width={192}
                height={192}
                className="size-24 rounded-lg object-cover ring-1 ring-foreground/15 sm:size-28"
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {labels.cover}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`${labels.remove} ${i + 1}`}
                className="absolute -right-2 -top-2 flex size-11 items-center justify-center"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {urls.length < MAX ? (
        <div>
          <label htmlFor="photo-file" className="mb-1.5 block text-sm font-medium">
            {urls.length === 0 ? labels.add : labels.addAnother}
          </label>
          <input
            id="photo-file"
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={onChange}
            className="min-h-11 w-full rounded-md border px-3 py-2 text-base"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{labels.full}</p>
      )}

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {status}
      </p>
    </fieldset>
  );
}

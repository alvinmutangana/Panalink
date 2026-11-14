"use client";

import { useState } from "react";

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
      (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
      "image/jpeg",
      0.7
    )
  );
}

export default function ImageUpload({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStatus("Compressing...");
      const blob = await compress(file);

      setStatus("Uploading...");
      const fd = new FormData();
      fd.append("file", new File([blob], "image.jpg", { type: "image/jpeg" }));

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setUrl(data.url);
      setStatus("Uploaded ✓");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="file" accept="image/*" onChange={onChange} className="rounded border p-3" />
      <input type="hidden" name="imageUrl" value={url} />
      {url && <img src={url} alt="Preview" className="h-40 w-40 rounded object-cover" />}
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}

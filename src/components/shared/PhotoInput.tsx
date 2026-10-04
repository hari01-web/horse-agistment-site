"use client";

import { useState } from "react";

const MAX_SIDE = 1600;
const QUALITY = 0.85;

// Shrinks a phone photo (often 3–6 MB) to at most 1600px as a JPEG (~0.3 MB)
// so it fits within the server's upload limit and uploads quickly.
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file; // e.g. a format the browser can't read — send as-is
  }
}

export default function PhotoInput({
  name = "photo",
  multiple = false,
  className = "text-sm",
}: {
  name?: string;
  multiple?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <span className="flex flex-col gap-1">
      <input
        type="file"
        name={name}
        accept="image/*"
        multiple={multiple}
        className={className}
        onChange={async (e) => {
          const input = e.currentTarget;
          const files = Array.from(input.files ?? []);
          if (files.length === 0) return;
          setBusy(true);
          const shrunk = await Promise.all(files.map(shrink));
          const transfer = new DataTransfer();
          shrunk.forEach((f) => transfer.items.add(f));
          input.files = transfer.files;
          setBusy(false);
        }}
      />
      {busy && <span className="text-xs text-foreground/60">Preparing photo…</span>}
    </span>
  );
}

export async function resizeImageToDataURL(
  file,
  maxSize = 50,
  jpegQuality = 0.85
) {
  const inputType = (file?.type || "").toLowerCase();

  const isTransparentCapable =
    inputType.includes("png") || inputType.includes("webp");
  const outMime = isTransparentCapable ? inputType : "image/jpeg";

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    img.src = objectUrl;

    if ("decode" in img) {
      await img.decode();
    } else {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Image load error"));
      });
    }

    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    if (!isTransparentCapable && outMime === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl =
      outMime === "image/jpeg"
        ? canvas.toDataURL(outMime, jpegQuality)
        : canvas.toDataURL(outMime);

    return String(dataUrl).trim().replace(/\s+/g, "");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function safeImageSrc(value, fallback = null) {
  if (typeof value !== "string") return fallback;

  const s = value.trim(); // 👈 solo trim al inicio y final
  if (!s) return fallback;

  if (s.startsWith("data:image/")) return s; // Base64
  if (/^https?:\/\//i.test(s)) return s; // http(s) URL
  if (s.startsWith("/")) return s; // rutas relativas

  return fallback;
}

export function dataUrlToFile(dataUrl, filename = "upload.png") {
  const [meta, b64] = dataUrl.split(",");
  const mime = (meta.match(/data:(.*?);/) || [])[1] || "image/png";
  const binStr = atob(b64);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

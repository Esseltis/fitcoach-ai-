// Kompresja zdjęcia po stronie klienta: jedna kopia służy jednocześnie
// do analizy AI (wysyłana do API) i do zapisu w localStorage (limit ~5 MB).

export function fileToDataUrl(
  file: File,
  maxDim = 1024,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Wybierz plik graficzny (JPG/PNG/HEIC)."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Przeglądarka nie obsługuje przetwarzania obrazu."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nie udało się odczytać tego pliku graficznego."));
    };
    img.src = url;
  });
}
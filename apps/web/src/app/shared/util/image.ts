const MAX_BYTES = 280_000;

/** Reads an image file, downscales it so its longest side is at most `maxSide`, and returns a PNG data URL. */
export async function imageToDataUrl(file: File, maxSide: number): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    throw new Error('Usa una imagen PNG, JPG o WebP.');
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const dataUrl = canvas.toDataURL('image/png');
  if (dataUrl.length > MAX_BYTES * 1.33) throw new Error('La imagen es demasiado pesada.');
  return dataUrl;
}

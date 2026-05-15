const DEFAULT_MAX_IMAGE_EDGE = 1800;
const DEFAULT_JPEG_QUALITY = 0.86;

type PrepareImageOptions = {
  maxImageEdge?: number;
  jpegQuality?: number;
};

function getJpegName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName || "route-snap-image"}.jpg`;
}

function calculateSize(width: number, height: number, maxImageEdge: number) {
  const longestEdge = Math.max(width, height);

  if (longestEdge <= maxImageEdge) {
    return { width, height };
  }

  const scale = maxImageEdge / longestEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale)
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, jpegQuality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", jpegQuality);
  });
}

async function loadImage(file: File) {
  if ("createImageBitmap" in window) {
    return createImageBitmap(file);
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not decode image"));
    };
    image.src = objectUrl;
  });
}

export async function prepareImageForUpload(file: File, options: PrepareImageOptions = {}) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const maxImageEdge = options.maxImageEdge ?? DEFAULT_MAX_IMAGE_EDGE;
    const jpegQuality = options.jpegQuality ?? DEFAULT_JPEG_QUALITY;
    const image = await loadImage(file);
    const sourceWidth = image.width;
    const sourceHeight = image.height;

    if (!sourceWidth || !sourceHeight) {
      return file;
    }

    const { width, height } = calculateSize(sourceWidth, sourceHeight, maxImageEdge);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return file;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    if ("close" in image && typeof image.close === "function") {
      image.close();
    }

    const blob = await canvasToBlob(canvas, jpegQuality);
    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], getJpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified
    });
  } catch {
    return file;
  }
}

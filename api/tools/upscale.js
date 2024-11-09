import fetch from "node-fetch";
import sizeOf from "image-size";
import {
  FormData,
  Blob
} from "formdata-node";
import {
  fileTypeFromBuffer
} from "file-type";

export async function upscale(imageBuffer) {
  try {
    const response = await fetch("https://lexica.qewertyy.dev/upscale", {
      body: JSON.stringify({
        image_data: Buffer.from(imageBuffer, "base64"),
        format: "binary"
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}
export async function upscalev2(mediaURL) {
  try {
    const response = await fetch(`https://vex-kshitiz.vercel.app/upscale?url=${encodeURIComponent(mediaURL)}`);
    return await response.json();
  } catch {
    return null;
  }
}
export async function upscalev3(mediaURL) {
  try {
    const response = await fetch(`https://nue-api.koyeb.app/upscale?url=${encodeURIComponent(mediaURL)}&key=ins08st0`);
    return await response.json();
  } catch {
    return null;
  }
}
export async function upscalev4(imageBuffer, scale) {
  try {
    const {
      ext,
      mime
    } = await fileTypeFromBuffer(imageBuffer) || {
      ext: "jpg",
      mime: "image/jpeg"
    };
    const blob = new Blob([imageBuffer], {
      type: mime
    });
    const data = new FormData();
    data.append("image", blob, `image.${ext}`);
    data.append("scale", String(scale));
    const response = await fetch("https://api2.pixelcut.app/image/upscale/v1", {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36${Date.now()}`,
        Referer: "https://pixelcut.app/"
      }
    });
    const result = await response.json();
    return result.result_url;
  } catch {
    return null;
  }
}
export async function upscalev5(buffer, scale = 2, level = "None") {
  try {
    function grn(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const ggr = grn(1e6, 999292220822);
    const apiUrl = "https://api.upscalepics.com/upscale-to-size";
    const fileType = await fileTypeFromBuffer(buffer);
    const mimeType = fileType?.mime || "image/jpeg";
    const dimensions = sizeOf(buffer);
    const formData = new FormData();
    formData.append("image_file", new Blob([buffer], {
      type: mimeType
    }), `image.${fileType?.ext || "jpg"}`);
    formData.append("name", ggr);
    formData.append("desiredHeight", dimensions.height * scale);
    formData.append("desiredWidth", dimensions.width * scale);
    formData.append("outputFormat", "png");
    formData.append("compressionLevel", level || "None");
    formData.append("anime", "False");
    const res = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://upscalepics.com",
        Referer: "https://upscalepics.com/",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        Timezone: "Africa/Cairo",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });
    const jsonResponse = await res.json();
    return jsonResponse.bgRemoved;
  } catch (error) {
    console.error(error);
  }
}
export async function upscalev6(imageBuffer) {
  try {
    const {
      ext,
      mime
    } = await fileTypeFromBuffer(imageBuffer) || {
      ext: "jpg",
      mime: "image/jpeg"
    };
    const blob = new Blob([imageBuffer], {
      type: mime
    });
    const data = new FormData();
    data.append("image", blob, `image.${ext}`);
    const response = await fetch("https://pixgen.pro:8002/api/utils/upload_image", {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36${Date.now()}`,
        Referer: "https://pixgen.pro/"
      }
    });
    const result = await response.json();
    return result.image_url;
  } catch {
    return null;
  }
}
export const method = "POST";
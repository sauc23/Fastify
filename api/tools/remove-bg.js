import fetch from "node-fetch";
import {
  FormData,
  Blob
} from "formdata-node";
import {
  fileTypeFromBuffer
} from "file-type";
async function rembg(files) {
  try {
    const {
      ext,
      mime
    } = await fileTypeFromBuffer(files) || {};
    if (!ext || !mime) throw new Error("Tipe file tidak dapat diidentifikasi");
    const formData = new FormData(),
      blob = new Blob([files], {
        type: mime
      });
    formData.append("file", blob, "rembg." + ext || "jpg");
    formData.append("prompt", "Remove the background");
    const response = await fetch("https://easyedit.xyz:3000/rembg?uid=null", {
      method: "POST",
      body: formData
    });
    return await response.arrayBuffer();
  } catch (error) {
    console.error(error);
  }
}
async function removebg(buffer) {
  if (!buffer) {
    return {
      status: false,
      message: "undefined reading buffer"
    };
  }
  try {
    const image = buffer.toString("base64");
    const response = await fetch("https://us-central1-ai-apps-prod.cloudfunctions.net/restorePhoto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: `data:image/png;base64,${image}`,
        model: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003"
      })
    });
    if (!response.ok) {
      throw new Error("Failed to remove background");
    }
    const data = await response.text();
    const cleanedData = data.replace(/"/g, "");
    console.log(response.status, cleanedData);
    if (!cleanedData) {
      return {
        status: false,
        message: "Failed to remove background from image"
      };
    }
    return cleanedData;
  } catch (e) {
    return {
      status: false,
      message: e.message
    };
  }
}
export const Rembg = rembg;
export const Removebg = removebg;
export const method = "POST";
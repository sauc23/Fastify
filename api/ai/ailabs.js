import {
  FormData,
  Blob
} from "formdata-node";
import {
  fileTypeFromBuffer
} from "file-type";
import fetch from "node-fetch";
async function cartoonifyImage(buffer, type) {
  const data = new FormData();
  const fileType = await fileTypeFromBuffer(buffer) || {};
  const mime = fileType.mime || "image/jpg";
  const ext = fileType.ext ? `.${fileType.ext}` : ".jpg";
  data.append("image", new Blob([await buffer.toArrayBuffer()], {
    type: mime
  }), `img${ext}`);
  data.append("type", type);
  const options = {
    method: "POST",
    headers: {
      "X-RapidAPI-Key": "230d665706msh8c981a10569b6aep1c5006jsn77776aeae50e",
      "X-RapidAPI-Host": "cartoon-yourself.p.rapidapi.com"
    },
    body: data
  };
  try {
    const response = await fetch("https://cartoon-yourself.p.rapidapi.com/facebody/api/portrait-animation/portrait-animation", options);
    const json = await response.text();
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to fetch cartoonify image:", e);
    throw e;
  }
}
export const cartoonifyImages = cartoonifyImage;
export const method = "POST";
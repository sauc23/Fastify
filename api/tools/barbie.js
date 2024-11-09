import axios from "axios";
import {
  FormData,
  Blob
} from "formdata-node";
import {
  fileTypeFromBuffer
} from "file-type";
import {
  createHash
} from "crypto";
async function Barbie(input) {
  try {
    const data = Buffer.isBuffer(input) ? input : Buffer.from((await axios.get(input, {
        responseType: "arraybuffer"
      })).data),
      {
        ext,
        mime
      } = await fileTypeFromBuffer(data) || {
        ext: "jpg",
        mime: "image/jpg"
      },
      filename = `${createHash("sha256").update(data).digest("hex")}.${ext}`,
      formData = new FormData();
    formData.append("myfile", new Blob([data], {
      type: mime
    }), filename);
    const headers = {
        Accept: "application/json, text/plain, */*",
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        Origin: "https://www.barbieselfie.ai",
        Referer: "https://www.barbieselfie.ai/intl/step/loading/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
      },
      response = await axios.post("https://www.barbieselfie.ai/api/upload.php", formData, {
        headers: headers,
        responseType: "arraybuffer",
        maxContentLength: 1 / 0,
        maxBodyLength: 1 / 0
      });
    return Buffer.from(response.data);
  } catch (error) {
    throw console.error("Error:", error.response ? error.response.data : error.message),
      error;
  }
}
export const barbie = Barbie;
export const method = "POST";
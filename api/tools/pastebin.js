import axios from "axios";
async function createPaste(content, title = "") {
  const data = new URLSearchParams({
    api_dev_key: "_L_ZkBp7K3aZMY7z4ombPIztLxITOOpD",
    api_paste_name: title,
    api_paste_code: content,
    api_paste_format: "text",
    api_paste_expire_date: "N",
    api_option: "paste"
  });
  try {
    const result = (await axios.post("https://pastebin.com/api/api_post.php", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })).data,
      rawUrl = result.replace(/^(https:\/\/pastebin\.com\/)([a-zA-Z0-9]+)$/, "$1raw/$2");
    return result ? {
      status: 0,
      original: result,
      raw: rawUrl
    } : {
      status: 1,
      original: null,
      raw: null
    };
  } catch (error) {
    console.error("Error:", error);
  }
}
export default createPaste;
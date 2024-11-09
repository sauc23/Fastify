import fetch from "node-fetch";
import AdmZip from "adm-zip";
const searchFontic = async (query, all = true) => {
  try {
    const url = "https://fontic.xyz/search";
    const body = JSON.stringify({
      query: query,
      offset: 0
    });
    const headers = {
      "Content-Type": "application/json",
      Accept: "*/*",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
      Referer: "https://fontic.xyz/?ref=taaft&utm_source=taaft&utm_medium=referral"
    };
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
      compress: true
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const result = await response.json();
    const fonts = result.results.map(item => ({
      ...item,
      fontUrl: `https://fontic.xyz/static/${item.font.toLowerCase().replace(/\s+/g, "")}.ttf`
    }));
    const zip = new AdmZip();
    const allFonts = all;
    let totalFonts = allFonts ? fonts.length : 1;
    try {
      for (const [index, font] of(allFonts ? fonts : [fonts[0]]).entries()) {
        try {
          const res = await fetch(font.fontUrl);
          const buffer = await res.arrayBuffer();
          zip.addFile(`${font.font}.ttf`, Buffer.from(buffer));
        } catch (error) {
          console.error(`Gagal mengunduh font ${font.font}: ${error.message}`);
          continue;
        }
      }
    } catch (error) {
      console.error(`Gagal memproses font: ${error.message}`);
    }
    const zipBuffer = zip.toBuffer();
    const total = `${allFonts ? fonts.length : 1} of ${fonts.length}`;
    return { zip: zipBuffer, total: fonts.length, desc: total };
  } catch (error) {
    console.error(`Error fetching fontic: ${error.message}`);
  }
};
export default searchFontic;
import fetch from "node-fetch";

const proxyUrls = [
  "https://cors-flame.vercel.app/api/cors?url=",
  "https://cors.newfrontdoor.org/api/cors?url=",
  "https://cors-anywhere-oragne.vercel.app/api/cors?url="
];

/**
 * Melakukan fetch pada link dengan mencoba proxy hingga mendapat respons.
 * @param {string} link - URL yang ingin di-fetch.
 * @param {string} type - Jenis respons: "text", "json", atau "buffer".
 * @returns {Promise<any>} - Hasil dari fetch sesuai dengan tipe.
 */
const get = async (link, type = "text") => {
  const encodedLink = encodeURIComponent(link);
  
  for (let proxy of proxyUrls) {
    try {
      const response = await fetch(`${proxy}${encodedLink}`);
      if (!response.ok) continue; // Jika respons tidak berhasil, coba URL proxy lain

      // Mengembalikan data berdasarkan tipe yang diminta
      switch (type) {
        case "json":
          return await response.json();
        case "buffer":
          return await response.arrayBuffer();
        default:
          return await response.text();
      }
    } catch (error) {
      console.error(`Error dengan proxy ${proxy}:`, error);
    }
  }
  throw new Error("Semua proxy gagal");
};

export default get;

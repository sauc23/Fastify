import fetch from "node-fetch";
import {
  URL
} from "url";
class PinterestDownloader {
  constructor() {
  }
  async searchPinterest(query) {
    const queryParams = {
        source_url: "/search/pins/?q=" + encodeURIComponent(query),
        data: JSON.stringify({
          options: {
            isPrefetch: !1,
            query: query,
            scope: "pins",
            no_fetch_context_on_resource: !1
          },
          context: {}
        }),
        _: Date.now()
      },
      url = new URL("https://www.pinterest.com/resource/BaseSearchResource/get/");
    Object.entries(queryParams).forEach(entry => url.searchParams.set(entry[0], entry[1]));
    try {
      const json = await (await fetch(url.toString())).json();
      return (json.resource_response?.data?.results ?? []).map(item => ({
        pin: "https://www.pinterest.com/pin/" + item.id ?? "",
        link: item.link ?? "",
        created_at: new Date(item.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }) ?? "",
        id: item.id ?? "",
        images_url: item.images?.["736x"].url ?? "",
        grid_title: item.grid_title ?? ""
      }));
    } catch (error) {
      return console.error("Error mengambil data:", error), [];
    }
  }
}
const pinterestDownloader = new PinterestDownloader();

const pinterestDownloaderSearch = async (query) => {
    try {
        return await pinterestDownloader.searchPinterest(query);
    } catch (error) {
        console.error('Error during Pinterest search:', error);
        throw error;
    }
};

export default pinterestDownloaderSearch;
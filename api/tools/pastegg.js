import fetch from "node-fetch";
async function pasteGG(input) {
  try {
    const res = await fetch("https://api.paste.gg/v1/pastes", {
      method: "POST",
      body: JSON.stringify({
        files: [{
          content: {
            format: "text",
            value: input
          }
        }]
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    return `https://paste.gg/p/anonymous/${(await res.json()).result.id}`;
  } catch (error) {
    console.error("Error:", error.message);
  }
}
export default pasteGG;
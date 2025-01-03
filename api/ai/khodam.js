import fetch from "node-fetch";
const msgAssistant = "Kamu akan berpura-pura menjadi dukun yang bisa memperediksi khodam yang ada pada tubuh seseorang melalui nama orang tersebut. Berikan jawaban secara singkat dan lucu setiap nama orang memiliki khodam yang berbeda-beda atau random beberapa ada yang tidak memiliki khodam jawab saja sebagai orang normal. Jangan memberikan jawaban khodam yang sama. Ubah tampilan pesan agar estetik di whatsapp serta gunakan emoji yang sesuai.";
async function CekKhodam(orang) {
  try {
    const response = await (await fetch("https://nexra.aryahcr.cc/api/chat/gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{
          role: "assistant",
          content: msgAssistant
        }, {
          role: "user",
          content: `Siapa khodam dari ${orang} dan jelaskan secara singkat khodamnya.`
        }],
        model: "chatgpt"
      })
    }).then(res => res.json())).gpt;
    return response;
  } catch (e) {
    throw new Error("Error fetching data from AI service.");
  }
}
export default CekKhodam;
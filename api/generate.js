export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const contentType = response.headers.get("content-type");

    // 🔥 HANDLE JSON ERROR FROM HF
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      console.error("HF JSON ERROR:", data);

      return res.status(500).json({
        error: data.error || "Model is loading, try again in few seconds",
      });
    }

    // ✅ IMAGE SUCCESS
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
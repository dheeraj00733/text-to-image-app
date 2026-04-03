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
      "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
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

    // ✅ If HuggingFace sends error JSON
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      return res.status(500).json({
        error: data.error || "Model is loading, try again in 10 seconds",
      });
    }

    // ✅ If image is returned
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
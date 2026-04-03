import { useState } from "react";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateImage(retries = 3) {
    if (!prompt.trim()) {
      alert("Enter a prompt");
      return;
    }

    setLoading(true);
    setImage(null);

    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) throw new Error("API error");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setImage(imageUrl);
      setLoading(false);
    } catch (error) {
      if (retries > 0) {
        console.log("Retrying...");
        setTimeout(() => generateImage(retries - 1), 3000);
        return; // 🔥 IMPORTANT
      } else {
        console.error(error);
        alert("Server busy. Try again.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="main">
      <div className="overlay"></div>

      <div className="card">
        <h1 className="title">🧠 AI Image Generator</h1>
        <p className="subtitle">Turn your imagination into reality ✨</p>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A futuristic city in space..."
          className="input"
        />

        <button
          onClick={generateImage}
          className="btn"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {loading && (
          <>
            <div className="loader"></div>
            <p style={{ color: "white", marginTop: "10px" }}>
              ⏳ AI is loading... please wait
            </p>
          </>
        )}

        {image && (
          <div className="image-box">
            <img src={image} alt="Generated AI artwork" />
            <a href={image} download>
              <button className="download">Download</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
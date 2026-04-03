import { useState } from "react";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generateImage() {
    if (!prompt.trim()) {
      alert("Enter a prompt");
      return;
    }

    setLoading(true);
    setImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      // ✅ IMPORTANT: show backend error message
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        alert(errorData.error || "Failed to generate image");
        return;
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setImage(imageUrl);
    } catch (error) {
      console.error("Frontend error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
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
              ⏳ AI is generating... please wait
            </p>
          </>
        )}

        {image && (
          <div className="image-box">
            <img src={image} alt="Generated AI artwork" />
            <a href={image} download="ai-image.png">
              <button className="download">Download</button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
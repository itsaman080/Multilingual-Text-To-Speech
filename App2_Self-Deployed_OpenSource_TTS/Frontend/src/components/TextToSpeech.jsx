import React, { useState } from "react";

function TextToSpeech() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const speakText = async (save = false) => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, save }),
      });

      if (!response.ok) throw new Error("Failed to fetch audio");

      const data = await response.json();
      const audioUrl = data.audio_file;

      // 🔊 Play audio
      const audio = new Audio(audioUrl);
      audio.play();

      // Optionally allow download
      if (save) {
        const link = document.createElement("a");
        link.href = audioUrl;
        link.download = "output.wav";
        link.click();
      }

    } catch (err) {
      console.error("Error generating speech:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {/* <h1>Self-Hosted TTS (Flask + React + Coqui)</h1> */}
      <h1>Self-Deployed OpenSource TTS (Coqui)</h1>
      <textarea
        rows="4"
        cols="60"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here..."
        style={{ padding: "10px", fontSize: "16px" }}
      />
      <br />
      <button onClick={() => speakText(false)} disabled={loading} style={{ margin: "5px" }}>
        {loading ? "Speaking..." : "Speak"}
      </button>
      <button onClick={() => speakText(true)} disabled={loading} style={{ margin: "5px" }}>
        {loading ? "Saving..." : "Save & Speak"}
      </button>
    </div>
  );
}

export default TextToSpeech;

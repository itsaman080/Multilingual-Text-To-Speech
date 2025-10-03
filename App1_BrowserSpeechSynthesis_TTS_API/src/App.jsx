import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [text, setText] = useState("Hello, मेरा नाम Aman है। Welcome!");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceEn, setSelectedVoiceEn] = useState(null);
  const [selectedVoiceHi, setSelectedVoiceHi] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const synthRef = useRef(window.speechSynthesis);

  // Split input text by script (Hindi vs English/Other)
  const splitByScript = (input) => {
    const pattern = /([\u0900-\u097F\s]+)|([^\u0900-\u097F]+)/g;
    const parts = [];
    let match;

    while ((match = pattern.exec(input)) !== null) {
      const [full, hiPart, enPart] = match;
      if (hiPart) parts.push({ text: hiPart.trim(), script: "hi" });
      else if (enPart) parts.push({ text: enPart.trim(), script: "en" });
    }

    return parts.filter((p) => p.text.length > 0);
  };

  // Load available voices
  useEffect(() => {
    const synth = synthRef.current;

    const loadVoices = () => {
      const v = synth.getVoices();
      setVoices(v);

      if (!selectedVoiceEn) {
        const en = v.find((voice) => voice.lang.startsWith("en")) || v[0];
        setSelectedVoiceEn(en?.name || null);
      }

      if (!selectedVoiceHi) {
        const hi = v.find((voice) => voice.lang.startsWith("hi"));
        setSelectedVoiceHi(hi?.name || null);
      }
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, []);

  //  Speak the input text
  const speakText = () => {
    const synth = synthRef.current;

    if (!("speechSynthesis" in window)) {
      alert("Browser does not support Speech Synthesis API.");
      return;
    }

    if (synth.speaking) return;

    const chunks = splitByScript(text);
    if (!chunks.length) return;

    synth.cancel();
    setIsSpeaking(true);

    const utterances = chunks.map((part) => {
      const utterance = new SpeechSynthesisUtterance(part.text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (part.script === "hi") {
        utterance.lang = "hi-IN";
        utterance.voice =
          voices.find((v) => v.name === selectedVoiceHi) ||
          voices.find((v) => v.lang.startsWith("hi"));
      } else {
        utterance.lang = "en-US";
        utterance.voice =
          voices.find((v) => v.name === selectedVoiceEn) ||
          voices.find((v) => v.lang.startsWith("en"));
      }

      utterance.onend = () => {
        if (utterances.indexOf(utterance) === utterances.length - 1) {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = () => setIsSpeaking(false);

      return utterance;
    });

    utterances.forEach((u) => synth.speak(u));
  };

  //  Stop speaking
  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Multilingual Text-to-Speech (SpeechSynthesis API)</h1>
      <p>
        adding new para for feature/adding-line PR
      </p>

      <textarea
        rows={5}
        cols={60}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Voice Selectors */}
      <div style={{ margin: "10px 0" }}>
        <label>English Voice: </label>
        <select value={selectedVoiceEn || ""} onChange={(e) => setSelectedVoiceEn(e.target.value)}>
          <option value="">Default</option>
          {voices.filter((v) => v.lang.startsWith("en")).map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      <div style={{ margin: "10px 0" }}>
        <label>Hindi Voice: </label>
        <select value={selectedVoiceHi || ""} onChange={(e) => setSelectedVoiceHi(e.target.value)}>
          <option value="">Default</option>
          {voices.filter((v) => v.lang.startsWith("hi")).map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Rate & Pitch Controls */}
      <div style={{ margin: "10px 0" }}>
        <label>Rate: {rate}</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
      </div>

      <div style={{ margin: "10px 0" }}>
        <label>Pitch: {pitch}</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(parseFloat(e.target.value))}
        />
      </div>

      {/* Control Buttons */}
      <button onClick={speakText} disabled={isSpeaking}>
        {isSpeaking ? "Speaking..." : "Speak"}
      </button>

      <button onClick={stopSpeaking} style={{ marginLeft: "10px" }}>
        Stop
      </button>
    </div>
  );
}

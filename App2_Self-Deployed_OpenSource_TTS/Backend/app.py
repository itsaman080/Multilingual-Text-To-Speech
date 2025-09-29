from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from TTS.api import TTS
import os
import time

app = Flask(__name__)
CORS(app)

# Setup audio output folder
AUDIO_DIR = os.path.join("static", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

# Load Coqui TTS model
print("Loading Coqui TTS model...")
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=False)
#tts_models--multilingual--multi-dataset--your_tts -> For all languages

@app.route("/tts", methods=["POST"])
def tts_endpoint():
    data = request.json
    text = data.get("text", "")
    save = data.get("save", False)

    if not text.strip():
        return jsonify({"error": "No text provided"}), 400

    filename = f"tts_{int(time.time())}.wav"
    filepath = os.path.join(AUDIO_DIR, filename)

    # Generate speech
    tts.tts_to_file(text=text, file_path=filepath)

    audio_url = f"http://127.0.0.1:5000/audio/{filename}"

    return jsonify({"audio_file": audio_url})

@app.route("/audio/<filename>")
def get_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

if __name__ == "__main__":
    app.run(debug=True)

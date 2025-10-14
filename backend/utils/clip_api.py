# backend/utils/clip_api.py
from flask import Flask, request, jsonify
import torch
import clip
from PIL import Image
import requests
from io import BytesIO
import os
import sys
import logging

# Basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clip_api")

app = Flask(__name__)

# Use env vars: CLIP_MODEL_PATH (default ./clip_models/ViT-B-32.pt)
MODEL_PATH = os.environ.get("CLIP_MODEL_PATH", "./clip_models/ViT-B-32.pt")
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Device for CLIP: {device}")

def load_model():
  try:
      if os.path.exists(MODEL_PATH):
          logger.info("Loading CLIP model from local file...")
          model, preprocess = clip.load("ViT-B/32", device=device, jit=False)
          # load state dict if provided separately (optional)
          try:
              state = torch.load(MODEL_PATH, map_location=device)
              # If state looks like a state_dict, load it:
              if isinstance(state, dict) and any(k.startswith("visual") for k in state.keys()):
                  model.load_state_dict(state)
                  logger.info("Loaded model state dict from file.")
          except Exception:
              # MODEL_PATH may be the full saved model already used by clip.load — ignore load errors
              logger.info("Model state load skipped/failed (this may be OK).")
      else:
          logger.info("Local CLIP model not found. Downloading via clip.load (may be large)...")
          model, preprocess = clip.load("ViT-B/32", device=device)
          # try to save state dict for future (best effort)
          try:
              torch.save(model.state_dict(), MODEL_PATH)
              logger.info(f"Saved CLIP state to {MODEL_PATH}")
          except Exception as e:
              logger.warning(f"Could not save model state: {e}")
      model.eval()
      return model, preprocess
  except Exception as e:
      logger.exception("Failed to load CLIP model")
      raise

# Load model on startup
model, preprocess = load_model()

def get_image_embedding(image_url):
  try:
      r = requests.get(image_url, timeout=15)
      r.raise_for_status()
      img = Image.open(BytesIO(r.content)).convert("RGB")
      image_input = preprocess(img).unsqueeze(0).to(device)
      with torch.no_grad():
          embedding = model.encode_image(image_input)
          emb = embedding.cpu().numpy()[0].tolist()
      return emb
  except Exception as e:
      logger.exception("Error generating embedding")
      return {"error": str(e)}

@app.route("/generate", methods=["POST"])
def generate():
  data = request.get_json() or {}
  image_url = data.get("image_url") or data.get("imageUrl") or data.get("image")
  if not image_url:
      return jsonify({"error": "Missing image_url"}), 400
  out = get_image_embedding(image_url)
  if isinstance(out, dict) and out.get("error"):
      return jsonify({"error": out["error"]}), 500
  return jsonify({"embedding": out})

@app.route("/", methods=["GET"])
def health():
  return jsonify({"status": "ok", "device": device})

# If run directly (development)
if __name__ == "__main__":
  port = int(os.environ.get("PORT", 8000))
  # Do NOT use debug=True in production
  app.run(host="0.0.0.0", port=port)


# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import torch
# import clip
# from PIL import Image
# import requests
# from io import BytesIO
# import os

# app = Flask(__name__)
# CORS(app)

# device = "cuda" if torch.cuda.is_available() else "cpu"
# local_model_path = "./clip_models/ViT-B-32.pt"
# os.makedirs(os.path.dirname(local_model_path), exist_ok=True)

# # Load CLIP model
# if os.path.exists(local_model_path):
#   print("Loading CLIP model from local file...")
#   model, preprocess = clip.load("ViT-B/32", device=device, jit=False)
#   model.load_state_dict(torch.load(local_model_path, map_location=device))
# else:
#   print("Downloading CLIP model...")
#   model, preprocess = clip.load("ViT-B/32", device=device)
#   torch.save(model.state_dict(), local_model_path)
#   print(f"Model saved locally at {local_model_path}")

# model.eval()

# def get_image_embedding(image_url):
#   try:
#     response = requests.get(image_url, timeout=10)
#     image = Image.open(BytesIO(response.content)).convert("RGB")
#     image_input = preprocess(image).unsqueeze(0).to(device)
#     with torch.no_grad():
#         embedding = model.encode_image(image_input)
#         embedding = embedding.cpu().numpy()[0].tolist()
#     return embedding
#   except Exception as e:
#     return {"error": str(e)}

# @app.route("/generate", methods=["POST"])
# def generate():
#   data = request.get_json()
#   image_url = data.get("image_url")
#   if not image_url:
#     return jsonify({"error": "Missing image_url"}), 400
#   embedding = get_image_embedding(image_url)
#   return jsonify({"embedding": embedding})

# @app.route("/", methods=["GET"])
# def home():
#   return "✅ CLIP Embedding API is running!"

# if __name__ == "__main__":
#   app.run(host="0.0.0.0", port=8000)

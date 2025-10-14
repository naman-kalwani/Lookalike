from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import clip
from PIL import Image
import requests
from io import BytesIO
import os

app = Flask(__name__)
CORS(app)

device = "cuda" if torch.cuda.is_available() else "cpu"
local_model_path = "./clip_models/ViT-B-32.pt"
os.makedirs(os.path.dirname(local_model_path), exist_ok=True)

# Load CLIP model
if os.path.exists(local_model_path):
  print("Loading CLIP model from local file...")
  model, preprocess = clip.load("ViT-B/32", device=device, jit=False)
  model.load_state_dict(torch.load(local_model_path, map_location=device))
else:
  print("Downloading CLIP model...")
  model, preprocess = clip.load("ViT-B/32", device=device)
  torch.save(model.state_dict(), local_model_path)
  print(f"Model saved locally at {local_model_path}")

model.eval()

def get_image_embedding(image_url):
  try:
    response = requests.get(image_url, timeout=10)
    image = Image.open(BytesIO(response.content)).convert("RGB")
    image_input = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = model.encode_image(image_input)
        embedding = embedding.cpu().numpy()[0].tolist()
    return embedding
  except Exception as e:
    return {"error": str(e)}

@app.route("/generate", methods=["POST"])
def generate():
  data = request.get_json()
  image_url = data.get("image_url")
  if not image_url:
    return jsonify({"error": "Missing image_url"}), 400
  embedding = get_image_embedding(image_url)
  return jsonify({"embedding": embedding})

@app.route("/", methods=["GET"])
def home():
  return "✅ CLIP Embedding API is running!"

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=8000)

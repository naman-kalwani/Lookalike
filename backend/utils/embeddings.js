import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HF_API_URL = process.env.HF_API_URL;

export const getImageEmbedding = async (imageUrl) => {
  try {
    const response = await axios.post(HF_API_URL, { image_url: imageUrl });
    return response.data.embedding;
  } catch (err) {
    console.error("Error calling HF Space API:", err.message);
    return null;
  }
};

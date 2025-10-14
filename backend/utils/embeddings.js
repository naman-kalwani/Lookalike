import axios from "axios";

export const getImageEmbedding = async (imageUrl) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/generate", // updated to Flask port
      { image_url: imageUrl },
      { timeout: 30000 }
    );

    if (response.data?.embedding) return response.data.embedding;
    throw new Error("No embedding returned from API");
  } catch (error) {
    console.error(
      "Embedding generation failed:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate embedding");
  }
};

import Product from "../models/Product.js";
import { getImageEmbedding } from "../utils/embeddings.js";
import cloudinary from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((acc, v, i) => acc + v * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
  const magB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
  return dot / (magA * magB);
};

// Search by image URL or uploaded file
export const searchSimilarProducts = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;

    // Handle uploaded file
    if (req.file) {
      const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lookalike_temp",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // remove temporary file
    }

    if (!imageUrl)
      return res.status(400).json({ error: "Image URL or file is required" });

    console.log("🔍 Generating embedding for image...");
    const inputEmbedding = await getImageEmbedding(imageUrl);

    if (!inputEmbedding || inputEmbedding.length === 0)
      return res.status(500).json({ error: "Failed to generate embedding" });

    console.log("Fetching products from MongoDB...");
    const products = await Product.find({});
    console.log(`📦 Comparing with ${products.length} products...`);

    const results = products
      .map((p) => ({
        ...p.toObject(),
        similarity: cosineSimilarity(inputEmbedding, p.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // top 10

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Error in searchSimilarProducts:", err);
    res.status(500).json({ error: err.message });
  }
};

// Filter API
export const filterProducts = async (req, res) => {
  try {
    const filters = req.body; // e.g., { gender: "Men", baseColour: "Navy Blue" }
    const products = await Product.find(filters);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error in filterProducts:", err);
    res.status(500).json({ error: err.message });
  }
};

// import Product from "../models/Product.js";
// import { getImageEmbedding } from "../utils/embeddings.js";

// const cosineSimilarity = (vecA, vecB) => {
//   const dot = vecA.reduce((acc, v, i) => acc + v * vecB[i], 0);
//   const magA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
//   const magB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
//   return dot / (magA * magB);
// };

// export const searchSimilarProducts = async (req, res) => {
//   try {
//     console.log("Incoming request body:", req.body);
//     const { imageUrl } = req.body;
//     if (!imageUrl)
//       return res.status(400).json({ error: "Image URL is required" });

//     console.log("🔍 Generating embedding for uploaded image...");
//     const inputEmbedding = await getImageEmbedding(imageUrl);

//     if (!inputEmbedding || inputEmbedding.length === 0)
//       return res.status(500).json({ error: "Failed to generate embedding" });

//     console.log("Fetching products from MongoDB...");
//     const products = await Product.find({});
//     console.log("Fetched products:", products.length);
//     console.log(`📦 Comparing with ${products.length} products...`);

//     const results = products
//       .map((p) => ({
//         ...p.toObject(),
//         similarity: cosineSimilarity(inputEmbedding, p.embedding),
//       }))
//       .sort((a, b) => b.similarity - a.similarity)
//       .slice(0, 10); // top 10 results

//     res.status(200).json(results);
//   } catch (err) {
//     console.error("❌ Error in searchSimilarProducts:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

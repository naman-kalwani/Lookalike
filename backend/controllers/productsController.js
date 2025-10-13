import Product from "../models/Product.js";
import { getImageEmbedding } from "../utils/embeddings.js";
import cloudinary from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  const dot = vecA.reduce((acc, v, i) => acc + v * (vecB[i] ?? 0), 0);
  const magA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
  const magB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
};

// Utility: remove empty/falsy filter fields
const sanitizeFilters = (filtersObj = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(filtersObj)) {
    // skip undefined/null/empty-string
    if (v === undefined || v === null) continue;
    // if it's a string and empty, skip
    if (typeof v === "string" && v.trim() === "") continue;
    // keep numeric 0? for similarity we handle separately; other zero is valid
    out[k] = v;
  }
  return out;
};

// POST /api/products/search → file or imageUrl + optional filters
export const searchSimilarProducts = async (req, res) => {
  try {
    // parse filters safely if sent as JSON string (from FormData)
    let incomingFilters = {};
    if (req.body.filters) {
      if (typeof req.body.filters === "string") {
        try {
          incomingFilters = JSON.parse(req.body.filters);
        } catch (e) {
          // if parse fails, ignore filters and continue
          console.warn("⚠️ Could not parse filters JSON, ignoring filters.");
          incomingFilters = {};
        }
      } else if (typeof req.body.filters === "object") {
        incomingFilters = req.body.filters;
      }
    }

    // extract minSimilarity (0..1) and remove from DB filters
    const minSimilarity = Number(incomingFilters.similarity || 0) / 100;
    const dbFilters = sanitizeFilters({ ...incomingFilters });
    delete dbFilters.similarity; // similarity isn't a DB field to match

    let imageUrl = req.body.imageUrl;

    // If a file was uploaded, upload to cloudinary and get URL
    if (req.file) {
      const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lookalike_temp",
      });
      imageUrl = uploadResult.secure_url;
      // remove local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        /* ignore */
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL or file is required" });
    }

    console.log("🔍 Generating embedding for image:", imageUrl);
    const inputEmbedding = await getImageEmbedding(imageUrl);
    if (!Array.isArray(inputEmbedding) || inputEmbedding.length === 0) {
      return res.status(500).json({ error: "Failed to generate embedding" });
    }

    // Query the DB with sanitized filters
    console.log("📦 Querying products with DB filters:", dbFilters);
    // If dbFilters is empty object, Product.find({}) returns all products.
    let products = await Product.find(
      Object.keys(dbFilters).length ? dbFilters : {}
    );
    console.log(`📊 Products fetched from DB: ${products.length}`);

    // Map similarity and filter by minSimilarity
    const labelled = products
      .map((p) => ({
        ...p.toObject(),
        similarity: cosineSimilarity(inputEmbedding, p.embedding),
      }))
      .filter((p) => p.similarity >= minSimilarity);

    console.log(
      `✅ After similarity filter (>= ${minSimilarity}): ${labelled.length}`
    );

    // sort by similarity desc and cut to top N (50)
    labelled.sort((a, b) => b.similarity - a.similarity);
    const top = labelled.slice(0, 50);

    return res.status(200).json(top);
  } catch (err) {
    console.error("❌ Error in searchSimilarProducts:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
};

// import Product from "../models/Product.js";
// import { getImageEmbedding } from "../utils/embeddings.js";
// import cloudinary from "cloudinary";
// import fs from "fs";

// // Cloudinary configuration
// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Cosine similarity
// const cosineSimilarity = (vecA, vecB) => {
//   const dot = vecA.reduce((acc, v, i) => acc + v * vecB[i], 0);
//   const magA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
//   const magB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
//   return dot / (magA * magB);
// };

// // POST /api/products/search → file or imageUrl + optional filters
// export const searchSimilarProducts = async (req, res) => {
//   try {
//     let imageUrl = req.body.imageUrl;

//     // ✅ Parse filters safely
//     let filters = {};
//     if (req.body.filters) {
//       try {
//         filters = JSON.parse(req.body.filters);
//       } catch {
//         filters = {};
//       }
//     }

//     const minSimilarity = Number(filters.similarity || 0) / 100;

//     // Remove similarity from filters for DB query
//     const dbFilters = { ...filters };
//     delete dbFilters.similarity;

//     // Handle uploaded file
//     if (req.file) {
//       const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: "lookalike_temp",
//       });
//       imageUrl = uploadResult.secure_url;
//       fs.unlinkSync(req.file.path);
//     }

//     if (!imageUrl)
//       return res.status(400).json({ error: "Image URL or file is required" });

//     console.log("🔍 Generating embedding...");
//     const inputEmbedding = await getImageEmbedding(imageUrl);
//     if (!inputEmbedding?.length)
//       return res.status(500).json({ error: "Failed to generate embedding" });

//     console.log("📦 Fetching products from DB...");
//     let products = await Product.find(dbFilters);

//     // Compute similarity & filter
//     products = products
//       .map((p) => ({
//         ...p.toObject(),
//         similarity: cosineSimilarity(inputEmbedding, p.embedding),
//       }))
//       .filter((p) => p.similarity >= minSimilarity)
//       .sort((a, b) => b.similarity - a.similarity)
//       .slice(0, 50);

//     res.status(200).json(products);
//   } catch (err) {
//     console.error("❌ Error in searchSimilarProducts:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

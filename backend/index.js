import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/products.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Multiple allowed URLs
const rawUrls = process.env.FRONTEND_PROD_URLS || "";
const allowedOrigins = rawUrls.split(",").map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowAll = process.env.ALLOW_ALL === "true";

      if (
        allowAll ||
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://localhost")
      ) {
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}`);
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/products", productRoutes);

app.get("/", (req, res) => res.send("✅ API is running successfully!"));

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();

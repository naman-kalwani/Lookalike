import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/products.js";
import cors from "cors"; 

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);

const startServer = async () => {
  await connectDB();

  app.use("/api/products", productRoutes);

  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();

// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";
// import productRoutes from "./routes/products.js";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const startServer = async () => {
//   await connectDB();

//   app.use("/api/products", productRoutes);

//   app.get("/", (req, res) => {
//     res.send("API is running...");
//   });

//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// };

// startServer();

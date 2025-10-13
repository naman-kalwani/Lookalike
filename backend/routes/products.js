import express from "express";
import multer from "multer";
import { searchSimilarProducts } from "../controllers/productsController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temporary storage for uploaded files

// POST /api/products/search → accepts file, imageUrl + optional filters
router.post("/search", upload.single("file"), searchSimilarProducts);

export default router;


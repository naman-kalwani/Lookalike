import express from "express";
import multer from "multer";
import {
  searchSimilarProducts,
  filterProducts,
} from "../controllers/productsController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temporary storage for uploaded files

// POST /api/products/search → accepts either file (key: 'file') or imageUrl (key: 'imageUrl')
router.post("/search", upload.single("file"), searchSimilarProducts);

// POST /api/products/filter → filters products by JSON body
router.post("/filter", filterProducts);

export default router;

// import express from "express";
// import { searchSimilarProducts } from "../controllers/productsController.js";

// const router = express.Router();

// // POST /api/products/search
// router.post("/search", searchSimilarProducts);

// export default router;

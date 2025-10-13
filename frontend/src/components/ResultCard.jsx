import React from "react";
import { motion } from "framer-motion";

export default function ResultCard({ product }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-md transition"
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded-xl mb-3"
      />
      <h3 className="font-semibold text-white truncate">{product.name}</h3>
      <p className="text-sm text-white/80">
        {product.gender} • {product.baseColour}
      </p>
      {product.similarity && (
        <p className="text-xs text-teal-300 mt-1">
          Similarity: {product.similarity.toFixed(2)}
        </p>
      )}
    </motion.div>
  );
}

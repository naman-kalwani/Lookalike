import React from "react";
import { motion } from "framer-motion";

export default function ResultCard({ product }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-md transition flex flex-col"
    >
      <img
        src={product.imageUrl}
        alt={product.productDisplayName}
        className="w-full h-48 object-cover rounded-xl mb-3"
      />
      <h3 className="font-semibold text-white truncate">
        {product.productDisplayName}
      </h3>
      <p className="text-sm text-white/80 mb-2">
        {product.gender} • {product.baseColour} • {product.masterCategory}
      </p>

      {product.similarity !== undefined && (
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>Similarity</span>
            <span>{(product.similarity * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all"
              style={{ width: `${(product.similarity * 100).toFixed(0)}%` }}
            ></div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

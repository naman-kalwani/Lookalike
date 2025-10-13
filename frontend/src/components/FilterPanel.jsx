import React from "react";

export default function FilterPanel({ filters, setFilters, onApply }) {
  return (
    <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-lg font-semibold mb-4 text-white">Filter Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Gender */}
        <select
          className="bg-slate-800/70 text-white placeholder-white border border-white/20 rounded p-2 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        >
          <option value="">Gender</option>
          <option>Men</option>
          <option>Women</option>
          <option>Unisex</option>
        </select>

        {/* Base Colour */}
        <select
          className="bg-slate-800/70 text-white placeholder-white border border-white/20 rounded p-2 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
          value={filters.baseColour}
          onChange={(e) =>
            setFilters({ ...filters, baseColour: e.target.value })
          }
        >
          <option value="">Base Colour</option>
          <option>Black</option>
          <option>White</option>
          <option>Blue</option>
          <option>Red</option>
          <option>Green</option>
        </select>

        {/* Category */}
        <select
          className="bg-slate-800/70 text-white placeholder-white border border-white/20 rounded p-2 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Category</option>
          <option>Topwear</option>
          <option>Bottomwear</option>
          <option>Footwear</option>
        </select>
      </div>

      {/* Similarity Slider */}
      <div className="mb-4">
        <label className="block text-white mb-2">
          Minimum Similarity: {filters.similarity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={filters.similarity}
          onChange={(e) =>
            setFilters({ ...filters, similarity: Number(e.target.value) })
          }
          className="w-full accent-teal-400"
        />
      </div>

      {/* Apply Button */}
      <button
        onClick={onApply}
        className="w-full mt-2 text-black bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-2 rounded-lg font-semibold hover:opacity-90"
      >
        Apply Filters
      </button>
    </div>
  );
}

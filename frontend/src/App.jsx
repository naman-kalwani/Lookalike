import React, { useState } from "react";
import axios from "axios";
import Dropzone from "react-dropzone";
import { motion } from "framer-motion";
import FilterPanel from "./components/FilterPanel";
import ResultCard from "./components/ResultCard";

export default function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    gender: "",
    baseColour: "",
    category: "",
    similarity: 0,
  });

  // 🔍 Search by file or URL + filters
  const handleSearch = async () => {
    if (!file && !url) return setError("Upload a file or enter a URL!");
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (url) formData.append("imageUrl", url);
      formData.append("filters", JSON.stringify(filters));

      const res = await axios.post(
        "http://localhost:5000/api/products/search",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResults(res.data);
    } catch {
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  // 🎛️ Apply filters without re-uploading image
  const handleFilter = async () => {
    if (!file && !url) return setError("Upload a file or enter a URL first!");
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (url) formData.append("imageUrl", url);
      formData.append("filters", JSON.stringify(filters));

      const res = await axios.post(
        "http://localhost:5000/api/products/search",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResults(res.data);
    } catch {
      setError("Failed to apply filters");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text"
      >
        L👀kalike Finder
      </motion.h1>

      {/* Upload + URL */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex flex-col gap-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border border-white/20 bg-white/10 text-white placeholder-white/60 p-2 rounded flex-1"
          />
          <Dropzone onDrop={(accepted) => setFile(accepted[0])}>
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-white/30 p-4 rounded cursor-pointer text-center flex-1 hover:bg-white/10 transition"
              >
                <input {...getInputProps()} />
                {file ? file.name : "Drag & drop or click to upload"}
              </div>
            )}
          </Dropzone>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r text-black from-blue-500 to-teal-400 px-4 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            Search
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        onApply={handleFilter}
      />

      {/* Error / Loading */}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading && <p className="text-blue-300 mb-4">Loading...</p>}

      {/* Results */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl"
      >
        {results.map((p, i) => (
          <ResultCard key={p._id || i} product={p} />
        ))}
      </motion.div>

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <p className="text-white/60 mt-10 text-center">
          Upload an image or apply filters to see results.
        </p>
      )}
    </div>
  );
}

// import React, { useState } from "react";
// import axios from "axios";
// import Dropzone from "react-dropzone";
// import { motion } from "framer-motion";
// import FilterPanel from "./components/FilterPanel";
// import ResultCard from "./components/ResultCard";

// export default function App() {
//   const [file, setFile] = useState(null);
//   const [url, setUrl] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [filters, setFilters] = useState({
//     gender: "",
//     baseColour: "",
//     category: "",
//   });

//   // 🔍 Search by file or URL
//   const handleSearch = async () => {
//     if (!file && !url) return setError("Upload a file or enter a URL!");
//     setLoading(true);
//     setError("");
//     try {
//       const formData = new FormData();
//       if (file) formData.append("file", file);
//       if (url) formData.append("imageUrl", url);

//       const res = await axios.post(
//         "http://localhost:5000/api/products/search",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       setResults(res.data);
//     } catch {
//       setError("Failed to fetch results");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🎛️ Filter API
//   const handleFilter = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/products/filter",
//         filters
//       );
//       setResults(res.data);
//     } catch {
//       setError("Failed to apply filters");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-6">
//       <motion.h1
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text "
//       >
//         L👀kalike Finder
//       </motion.h1>

//       {/* Upload + URL */}
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex flex-col gap-4 mb-6"
//       >
//         <div className="flex flex-col md:flex-row gap-4">
//           <input
//             type="text"
//             placeholder="Enter image URL"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="border border-white/20 bg-white/10 text-white placeholder-white/60 p-2 rounded flex-1"
//           />
//           <Dropzone onDrop={(accepted) => setFile(accepted[0])}>
//             {({ getRootProps, getInputProps }) => (
//               <div
//                 {...getRootProps()}
//                 className="border-2 border-dashed border-white/30 p-4 rounded cursor-pointer text-center flex-1 hover:bg-white/10 transition"
//               >
//                 <input {...getInputProps()} />
//                 {file ? file.name : "Drag & drop or click to upload"}
//               </div>
//             )}
//           </Dropzone>
//           <button
//             onClick={handleSearch}
//             className="bg-gradient-to-r text-black from-blue-500 to-teal-400 px-4 py-2 rounded-lg font-semibold hover:opacity-90"
//           >
//             Search
//           </button>
//         </div>
//       </motion.div>

//       {/* Filters */}
//       <FilterPanel
//         filters={filters}
//         setFilters={setFilters}
//         onApply={handleFilter}
//       />

//       {/* Error / Loading */}
//       {error && <p className="text-red-400 mb-4">{error}</p>}
//       {loading && <p className="text-blue-300 mb-4">Loading...</p>}

//       {/* Results */}
//       <motion.div
//         layout
//         className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl"
//       >
//         {results.map((p, i) => (
//           <ResultCard key={p._id || i} product={p} />
//         ))}
//       </motion.div>

//       {/* Empty State */}
//       {!loading && results.length === 0 && (
//         <p className="text-white/60 mt-10 text-center">
//           Upload an image or apply filters to see results.
//         </p>
//       )}
//     </div>
//   );
// }

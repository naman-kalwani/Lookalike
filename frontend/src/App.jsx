import React, { useState } from "react";
import axios from "axios";
import Dropzone from "react-dropzone";
import { motion } from "framer-motion";
import FilterPanel from "./components/FilterPanel";
import ResultCard from "./components/ResultCard";

export default function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    gender: "",
    baseColour: "",
    category: "",
    similarity: 0,
  });

  const handleSearch = async () => {
    if (!file && !url)
      return setError("😊 Upload a file or enter a URL first!");
    // Clear previous results and errors
    setAllResults([]);
    setFilteredResults([]);
    setError("");
    setLoading(true);
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

      const topResults = res.data.slice(0, 16);
      setAllResults(topResults);
      setFilteredResults(topResults);
    } catch {
      setError("😔 Failed to fetch results. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleFrontendFilter = () => {
    if (!file && url.trim() === "") {
      setError("😊 Please upload an image or enter a URL to apply filters!");
      return;
    }

    let results = allResults;
    setError("");

    if (filters.gender)
      results = results.filter((r) => r.gender === filters.gender);
    if (filters.baseColour)
      results = results.filter((r) => r.baseColour === filters.baseColour);
    if (filters.category)
      results = results.filter((r) => r.masterCategory === filters.category);
    if (filters.similarity)
      results = results.filter((r) => r.similarity >= filters.similarity / 100);

    if (results.length === 0) {
      setError(
        "😔 No products found matching your filters. Try changing them!"
      );
    }

    setFilteredResults(results.slice(0, 12));
  };

  const removeFile = () => {
    setFile(null);
    setAllResults([]);
    setFilteredResults([]);
    setError("");
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (val.trim() === "") {
      setAllResults([]);
      setFilteredResults([]);
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text"
      >
        L👀kalike
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex flex-col gap-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 ">
          {/* URL input */}
          <input
            type="text"
            placeholder="Enter image URL"
            value={url}
            onChange={handleUrlChange}
            disabled={file !== null}
            className={`border border-white/20 bg-white/10 text-white placeholder-white/60 p-2 rounded flex-1 ${
              file ? "opacity-50 cursor-not-allowed" : "cursor-text text-center"
            }`}
            title={file ? "Remove uploaded image to enter URL" : ""}
          />

          {/* File upload */}
          <Dropzone
            onDrop={(accepted) => setFile(accepted[0])}
            disabled={url.trim() !== ""}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed border-white/30 p-4 rounded text-center flex-1 hover:bg-white/10 transition flex flex-col items-center justify-center ${
                  url ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                title={url ? "Clear URL to upload file" : ""}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="relative w-full h-48">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute top-1 right-1 bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:opacity-90 cursor-pointer"
                      title="Remove uploaded file"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <p className="text-white/70">
                    Drag & drop or click to upload
                  </p>
                )}
              </div>
            )}
          </Dropzone>

          <button
            onClick={handleSearch}
            className="bg-gradient-to-r text-black from-teal-500 to-teal-400 px-4 py-2 rounded-lg font-semibold hover:opacity-90 cursor-pointer"
          >
            Search
          </button>
        </div>
      </motion.div>

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        onApply={handleFrontendFilter}
      />

      {error && <p className="text-red-400 mb-4">{error}</p>}
      {loading && (
        <p className="text-teal-100 mb-4">
          Your lookalike products are being fetched! 🚀
        </p>
      )}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white/10 h-60 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      )}


      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl"
      >
        {filteredResults.map((p, i) => (
          <ResultCard key={p._id || i} product={p} />
        ))}
      </motion.div>

      {!loading && filteredResults.length === 0 && !error && (
        <p className="text-white/60 mt-10 text-center">
          Upload an image or enter a URL to see results.
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
//   const [allResults, setAllResults] = useState([]);
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [filters, setFilters] = useState({
//     gender: "",
//     baseColour: "",
//     category: "",
//     similarity: 0,
//   });

//   const handleSearch = async () => {
//     if (!file && !url) return setError("Upload a file or enter a URL!");
//     setLoading(true);
//     setError("");
//     try {
//       const formData = new FormData();
//       if (file) formData.append("file", file);
//       if (url) formData.append("imageUrl", url);
//       formData.append("filters", JSON.stringify(filters));

//       const res = await axios.post(
//         "http://localhost:5000/api/products/search",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       const topResults = res.data.slice(0, 16);
//       setAllResults(topResults);
//       setFilteredResults(topResults);
//     } catch {
//       setError("Failed to fetch results");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFrontendFilter = () => {
//     if (allResults.length === 0) {
//       setError(
//         "😊 Please upload an image or enter a URL before applying filters!"
//       );
//       return;
//     }

//     setError(""); // clear previous errors
//     let results = allResults;

//     if (filters.gender)
//       results = results.filter((r) => r.gender === filters.gender);
//     if (filters.baseColour)
//       results = results.filter((r) => r.baseColour === filters.baseColour);
//     if (filters.category)
//       results = results.filter((r) => r.masterCategory === filters.category);
//     if (filters.similarity)
//       results = results.filter((r) => r.similarity >= filters.similarity / 100);
//     if (results.length === 0) {
//       setError(
//         "😔 No products found matching your filters. Try changing them!"
//       );
//     }

//     setFilteredResults(results.slice(0, 12));
//   };

//   const removeFile = () => setFile(null);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-6">
//       <motion.h1
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text"
//       >
//         L👀kalike
//       </motion.h1>

//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-3xl bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex flex-col gap-4 mb-6"
//       >
//         <div className="flex flex-col md:flex-row gap-4">
//           {/* URL input */}
//           <input
//             type="text"
//             placeholder="Enter image URL"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className={`border border-white/20 bg-white/10 text-white placeholder-white/60 p-2 rounded flex-1 ${
//               file ? "opacity-50 cursor-not-allowed" : "cursor-text"
//             }`}
//             disabled={file !== null}
//             title={file ? "Remove uploaded image to enter URL" : ""}
//           />

//           {/* File upload */}
//           <Dropzone
//             onDrop={(accepted) => setFile(accepted[0])}
//             disabled={url.trim() !== ""}
//           >
//             {({ getRootProps, getInputProps }) => (
//               <div
//                 {...getRootProps()}
//                 className={`border-2 border-dashed border-white/30 p-4 rounded text-center flex-1 hover:bg-white/10 transition flex flex-col items-center justify-center ${
//                   url ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
//                 }`}
//                 title={url ? "Clear URL to upload file" : ""}
//               >
//                 <input {...getInputProps()} />
//                 {file ? (
//                   <div className="relative w-full h-48">
//                     <img
//                       src={URL.createObjectURL(file)}
//                       alt="Preview"
//                       className="w-full h-48 object-contain rounded-lg"
//                     />
//                     <button
//                       onClick={removeFile}
//                       className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-start justify-center font-bold hover:opacity-90 cursor-pointer"
//                       title="Remove uploaded file"
//                     >
//                       x
//                     </button>
//                   </div>
//                 ) : (
//                   <p className="text-white/70">
//                     Drag & drop or click to upload
//                   </p>
//                 )}
//               </div>
//             )}
//           </Dropzone>

//           <button
//             onClick={handleSearch}
//             className="bg-gradient-to-r text-black from-teal-500 to-teal-400 px-4 py-2 rounded-lg font-semibold hover:opacity-90 cursor-pointer"
//           >
//             Search
//           </button>
//         </div>
//       </motion.div>

//       <FilterPanel
//         filters={filters}
//         setFilters={setFilters}
//         onApply={handleFrontendFilter}
//       />

//       {error && <p className="text-red-400 mb-4">{error}</p>}
//       {loading && <p className="text-blue-300 mb-4">Loading...</p>}

//       <motion.div
//         layout
//         className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl"
//       >
//         {filteredResults.map((p, i) => (
//           <ResultCard key={p._id || i} product={p} />
//         ))}
//       </motion.div>

//       {!loading && filteredResults.length === 0 && (
//         <p className="text-white/60 mt-10 text-center">
//           Upload an image or apply filters to see results.
//         </p>
//       )}
//     </div>
//   );
// }

"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
  isLoading?: boolean;
}

export default function FileUpload({ onFileLoaded, isLoading = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setUploadStatus("error");
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content);
        setUploadStatus("success");
      };

      reader.onerror = () => {
        setUploadStatus("error");
      };

      reader.readAsText(file);
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    try {
      const response = await fetch("/api/sample-data");
      if (!response.ok) {
        throw new Error("Failed to load sample data");
      }
      const data = await response.json();
      setFileName("sample_flight_data.csv (Demo)");
      onFileLoaded(data.csv);
      setUploadStatus("success");
    } catch (error) {
      console.error("Failed to load sample data:", error);
      setUploadStatus("error");
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "cyber-card p-8 border-2 border-dashed transition-all duration-300",
        isDragging
          ? "border-cyber-cyan bg-cyber-cyan/5 shadow-neon-cyan-sm"
          : "border-cyber-cyan/30 hover:border-cyber-cyan/50",
        uploadStatus === "success" && "border-cyber-green bg-cyber-green/5",
        uploadStatus === "error" && "border-cyber-red bg-cyber-red/5"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <>
            <Loader2 size={48} className="text-cyber-cyan animate-spin mb-4" />
            <p className="font-display text-cyber-cyan">PROCESSING DATA...</p>
          </>
        ) : uploadStatus === "success" ? (
          <>
            <CheckCircle size={48} className="text-cyber-green mb-4" />
            <p className="font-display text-cyber-green mb-2">FILE LOADED</p>
            <p className="text-sm text-gray-400 font-mono">{fileName}</p>
          </>
        ) : uploadStatus === "error" ? (
          <>
            <AlertCircle size={48} className="text-cyber-red mb-4" />
            <p className="font-display text-cyber-red mb-2">UPLOAD FAILED</p>
            <p className="text-sm text-gray-400">Please upload a valid CSV file</p>
          </>
        ) : (
          <>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-cyber-cyan/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-cyber-card border border-cyber-cyan/30 rounded-full p-4">
                {isDragging ? (
                  <FileSpreadsheet size={48} className="text-cyber-cyan" />
                ) : (
                  <Upload size={48} className="text-cyber-cyan" />
                )}
              </div>
            </div>

            <p className="font-display text-lg text-white mb-2">
              {isDragging ? "DROP FILE HERE" : "UPLOAD CSV FILE"}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Drag and drop your cargo data file or click to browse
            </p>

            <label className="cyber-button cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
              />
              SELECT FILE
            </label>

            <p className="text-xs text-gray-500 mt-4 font-mono">
              Supported format: .csv
            </p>

            {/* Sample Data Button */}
            <div className="mt-6 pt-4 border-t border-cyber-cyan/20 w-full">
              <button
                onClick={handleLoadSampleData}
                disabled={isLoadingSample}
                className="group flex items-center justify-center gap-2 w-full py-3 px-4 bg-cyber-magenta/10 hover:bg-cyber-magenta/20 border border-cyber-magenta/30 hover:border-cyber-magenta/60 rounded transition-all duration-300 disabled:opacity-50"
              >
                {isLoadingSample ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-cyber-magenta" />
                    <span className="text-sm text-cyber-magenta font-mono">LOADING...</span>
                  </>
                ) : (
                  <>
                    <Database size={16} className="text-cyber-magenta group-hover:animate-pulse" />
                    <span className="text-sm text-gray-400 group-hover:text-cyber-magenta transition-colors">
                      No file? <span className="text-cyber-magenta font-semibold">Try sample data</span>
                    </span>
                    <Sparkles size={12} className="text-cyber-cyan" />
                  </>
                )}
              </button>
              <p className="text-xs text-gray-600 mt-2 font-mono text-center">
                40 sample flights • Multiple aircraft types
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}


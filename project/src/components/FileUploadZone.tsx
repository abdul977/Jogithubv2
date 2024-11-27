import React from 'react';
import { Upload, Folder, File } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadZoneProps {
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  onFileSelect: (files: File[]) => void;
}

export function FileUploadZone({
  onDragEnter,
  onDragLeave,
  onDrop,
  isDragging,
  onFileSelect,
}: FileUploadZoneProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFileSelect(files);
  };

  return (
    <motion.label
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-md
        ${isDragging ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-300'}`}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: isDragging ? 1.1 : 1 }}
        className="flex flex-col items-center justify-center p-6 text-center"
      >
        <motion.div
          animate={{ y: isDragging ? -10 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex space-x-2"
        >
          <Upload className={`w-16 h-16 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
          <Folder className={`w-16 h-16 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
        </motion.div>
        <motion.p
          className="mb-2 text-xl font-semibold mt-4"
          animate={{ color: isDragging ? '#6366F1' : '#4B5563' }}
        >
          Drop your files or folders here
        </motion.p>
        <p className="mb-2 text-sm text-gray-500">
          or click to select
        </p>
        <p className="text-xs text-gray-400">
          Supports individual files, ZIP archives, and folders
        </p>
      </motion.div>
      <input
        type="file"
        className="hidden"
        multiple
        webkitdirectory=""
        directory=""
        onChange={handleFileInput}
      />
    </motion.label>
  );
}
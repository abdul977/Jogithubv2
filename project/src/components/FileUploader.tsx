import React, { useCallback } from 'react';
import { Upload, FileWarning } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = React.useState(false);

  const springProps = useSpring({
    scale: isDragging ? 1.02 : 1,
    config: { tension: 300, friction: 10 },
  });

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    controls.start({ scale: 1.02 });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    controls.start({ scale: 1 });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      controls.start({ scale: 1 });
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/zip' || file?.name.endsWith('.zip')) {
        onFileSelect(file);
      }
    },
    [onFileSelect, controls]
  );

  return (
    <animated.div
      style={springProps}
      className="w-full max-w-2xl mx-auto"
    >
      <motion.label
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
          >
            <Upload className={`w-16 h-16 mb-4 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
          </motion.div>
          <motion.p
            className="mb-2 text-xl font-semibold"
            animate={{ color: isDragging ? '#6366F1' : '#4B5563' }}
          >
            Drop your ZIP file here
          </motion.p>
          <p className="mb-2 text-sm text-gray-500">
            or click to select a file
          </p>
          <p className="text-xs text-gray-400">
            ZIP files only (max. 100MB)
          </p>
        </motion.div>
        <input
          type="file"
          className="hidden"
          accept=".zip"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </motion.label>
    </animated.div>
  );
}
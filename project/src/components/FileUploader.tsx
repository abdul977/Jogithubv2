import React, { useCallback, useState } from 'react';
import { Upload, Folder, File, AlertCircle } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { processFiles } from '../utils/fileProcessor';
import { FileUploadZone } from './FileUploadZone';
import { FileList } from './FileList';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  const springProps = useSpring({
    scale: isDragging ? 1.02 : 1,
    config: { tension: 300, friction: 10 },
  });

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    try {
      const processedFiles = await processFiles(selectedFiles);
      setFiles(processedFiles);
      onFileSelect(processedFiles);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  }, [onFileSelect]);

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
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      controls.start({ scale: 1 });

      const items = Array.from(e.dataTransfer.items);
      const fileEntries: File[] = [];

      for (const item of items) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isFile) {
              const file = item.getAsFile();
              if (file) fileEntries.push(file);
            } else if (entry.isDirectory) {
              const dirReader = (entry as any).createReader();
              const entries = await new Promise<File[]>((resolve) => {
                dirReader.readEntries((entries: any[]) => {
                  const files: File[] = [];
                  entries.forEach((entry: any) => {
                    if (entry.isFile) {
                      entry.file((file: File) => files.push(file));
                    }
                  });
                  resolve(files);
                });
              });
              fileEntries.push(...entries);
            }
          }
        }
      }

      handleFilesSelected(fileEntries);
    },
    [handleFilesSelected, controls]
  );

  return (
    <animated.div style={springProps} className="w-full max-w-2xl mx-auto space-y-4">
      <FileUploadZone
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isDragging={isDragging}
        onFileSelect={handleFilesSelected}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 rounded"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {files.length > 0 && <FileList files={files} />}
    </animated.div>
  );
}
import React, { useCallback } from 'react';
import { Upload, FileWarning } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/zip' || file?.name.endsWith('.zip')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-2xl mx-auto"
    >
      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          <Upload className="w-12 h-12 mb-4 text-gray-500" />
          <p className="mb-2 text-xl font-semibold text-gray-500">
            Drop your ZIP file here
          </p>
          <p className="mb-2 text-sm text-gray-500">
            or click to select a file
          </p>
          <p className="text-xs text-gray-500">ZIP files only (max. 100MB)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".zip"
          onChange={handleFileInput}
        />
      </label>
    </div>
  );
}
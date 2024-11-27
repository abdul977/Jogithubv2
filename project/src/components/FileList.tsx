import React from 'react';
import { File, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatFileSize } from '../utils/fileHelpers';

interface FileListProps {
  files: File[];
}

export function FileList({ files }: FileListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
          >
            {file.name.includes('/') ? (
              <Folder className="w-5 h-5 text-indigo-500 mr-2" />
            ) : (
              <File className="w-5 h-5 text-gray-400 mr-2" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
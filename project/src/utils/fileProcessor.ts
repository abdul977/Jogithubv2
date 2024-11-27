import JSZip from 'jszip';

export async function processFiles(files: File[]): Promise<File[]> {
  const processedFiles: File[] = [];

  for (const file of files) {
    try {
      if (file.name.endsWith('.zip')) {
        const zipFiles = await extractZipContents(file);
        processedFiles.push(...zipFiles);
      } else {
        processedFiles.push(file);
      }
    } catch (error: any) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${error.message}`);
    }
  }

  return processedFiles;
}

async function extractZipContents(zipFile: File): Promise<File[]> {
  try {
    const arrayBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer, { createFolders: true });
    const files: File[] = [];

    await Promise.all(
      Object.entries(zip.files).map(async ([path, file]) => {
        if (!file.dir) {
          try {
            const blob = await file.async('blob');
            const extractedFile = new File([blob], path, {
              type: blob.type || 'application/octet-stream',
            });
            files.push(extractedFile);
          } catch (error) {
            console.error(`Error extracting ${path} from ZIP:`, error);
          }
        }
      })
    );

    if (files.length === 0) {
      throw new Error('No valid files found in the ZIP archive');
    }

    return files;
  } catch (error: any) {
    if (error.message.includes("end of central directory")) {
      throw new Error('Invalid or corrupted ZIP file');
    }
    throw new Error(`Failed to process ZIP file: ${error.message}`);
  }
}
import React, { useRef } from "react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

export const FileUpload = ({
  onChange,
  onDelete,
  files,
}: {
  onChange?: (files: File[]) => void;
  onDelete?: (index: number) => void;
  files: File[];
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    onChange?.(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <div
        onClick={handleClick}
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-sm">
            Upload files
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-xs mt-1">
            Drag or drop your files here or click to upload multiple files
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <div
                  key={"file" + idx}
                  className="relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex items-center justify-between p-3 mt-2 w-full mx-auto rounded-md shadow-sm"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete && onDelete(idx)}
                    className="text-red-500 hover:text-red-700 text-sm z-10"
                  >
                    Delete
                  </button>
                </div>
              ))}
            {files.length === 0 && (
              <div className="relative z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-sm">
                {isDragActive ? (
                  <p className="text-sm text-neutral-600 flex flex-col items-center">
                    Drop them
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

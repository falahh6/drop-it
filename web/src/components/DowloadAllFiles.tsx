"use client";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { Button } from "./ui/button";
import { Download } from "lucide-react";

const DowloadAll = ({
  filesToDownload,
  closeAndClear,
}: {
  filesToDownload: { name: string; url: string }[];
  closeAndClear: () => void;
}) => {
  const downloadHandler = () => {
    const zip = new JSZip();
    const fetchPromises = filesToDownload.map((file) =>
      fetch(file.url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.name}`);
          }
          return response.blob();
        })
        .then((blob) => {
          zip.file(file.name, blob);
        })
        .catch((error) => {
          console.error(`Error fetching file ${file.name}:`, error);
        })
    );

    Promise.all(fetchPromises)
      .then(() => {
        return zip.generateAsync({ type: "blob" });
      })
      .then((content) => {
        saveAs(content, "files.zip");

        closeAndClear();
      })

      .catch((error) => {
        console.error("Error generating zip:", error);
      });
  };
  return (
    <Button
      className="rounded-2xl w-full font-bold"
      variant={"default"}
      onClick={downloadHandler}
    >
      <Download className="h-4 w-4 " /> Download All
    </Button>
  );
};

export default DowloadAll;

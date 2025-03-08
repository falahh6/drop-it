"use client";

import {
  Download,
  Files,
  Loader,
  Monitor,
  Smartphone,
  Text,
} from "lucide-react";
import { Button } from "./ui/button";

import { ExpandableTabs } from "./ui/expandable-tabs";
import { Textarea } from "./ui/textarea";
import useWebSocket, { PeerInfoProps } from "@/lib/useWS";
import React, { useEffect, useRef, useState } from "react";
import { FileUpload } from "./ui/file-upload";
import Ripple from "./ui/ripple";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DowloadAll from "./DowloadAllFiles";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { disableConsoleLogs, truncateText } from "@/lib/utils";

export interface PeerProps {
  peer: PeerInfoProps;
}

const PeerInfoDiv = ({
  peer,
}: {
  peer: {
    displayName: string;
    deviceType: string;
    browser: string;
  };
}) => {
  return (
    <div className="flex flex-row gap-2">
      <div className="mt-0.5">
        {peer.deviceType === "Android" || peer.deviceType === "iOs" ? (
          <Smartphone className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
      </div>
      <div className="flex flex-col text-left text-xs">
        <p className="font-semibold">{peer.displayName}</p>
        <p className="font-medium">
          {peer.deviceType} - {peer.browser}
        </p>
      </div>
    </div>
  );
};

const Peers = () => {
  const {
    sendMessage,
    newMessage,
    setNewMessage,
    peers,
    filesLoading,
    setFilesLoading,
  } = useWebSocket();

  disableConsoleLogs();

  const [message, setMessage] = useState<string>("");
  const [copyText, setCopyText] = useState<string>("Copy Text");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [type, setType] = useState<"files" | "text">("text");
  const [files, setFiles] = useState<File[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [downloadableFiles, setDownloadableFiles] = useState<
    {
      url: string;
      name: string;
    }[]
  >([]);

  const sendAudioRef = useRef<HTMLAudioElement>(null);

  const playSendSound = () => {
    sendAudioRef.current?.play();
  };

  const handleFileUpload = (newFiles: File[]) => {
    console.log("New Files", newFiles);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleDeleteFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log("newMessage in Peer.tsx : ", newMessage);

    if (newMessage) {
      if (isOpen) {
        setIsOpen(false);
      }

      setMessageDialogOpen(true);

      if (newMessage.dataType === "files") {
        const downloadableFiles =
          (newMessage.data &&
            newMessage.data.map(
              (file: { name: string; type: string; base64: string }) => {
                const base64Content = file.base64.split(",")[1];
                const blob = new Blob(
                  [
                    Uint8Array.from(atob(base64Content), (c) =>
                      c.charCodeAt(0)
                    ),
                  ],
                  {
                    type: file.type,
                  }
                );
                const url = URL.createObjectURL(blob);

                return {
                  name: file.name,
                  url,
                };
              }
            )) ||
          [];

        console.log("Downloadable Files", downloadableFiles);
        setDownloadableFiles(downloadableFiles);
        setFilesLoading(false);
      } else {
        setMessage(newMessage.message);
      }
    }
  }, [newMessage, setFilesLoading]);

  const closeAndClear = () => {
    setMessageDialogOpen(false);

    setFiles([]);
    setMessage("");
    setIsOpen(false);
    setNewMessage(null);
    setType("text");
  };

  const handleSend = (peerId?: string) => {
    if (type == "text" && message.length > 0) {
      sendMessage({
        type: "unicast",
        to: peerId,
        content: message,
      });
      playSendSound();
      closeAndClear();
    } else {
      console.log("Files : ", files);

      sendMessage({
        type: "unicast",
        to: peerId,
        content: "loading files",
      });

      const base64FilesPromises = files.map(
        (file) =>
          new Promise<{ name: string; type: string; base64: string }>(
            (resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.name,
                  type: file.type,
                  base64: reader.result as string,
                });
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            }
          )
      );

      Promise.all(base64FilesPromises)
        .then((base64Files) => {
          console.log("Base64 Files", base64Files);
          sendMessage({
            type: "unicast",
            to: peerId,
            content: JSON.stringify(base64Files),
            dataType: "files",
          });
          playSendSound();
          closeAndClear();
        })
        .catch((error) => {
          console.error("Error encoding files to Base64:", error);
        });
    }
  };

  return (
    <>
      <audio ref={sendAudioRef} src="/sounds/send.wav" preload="auto" />

      {newMessage && (
        <Dialog
          open={messageDialogOpen}
          onOpenChange={(val) => {
            if (val === false) {
              closeAndClear();
            }
          }}
        >
          <DialogContent className="rounded-3xl max-sm:max-w-[80%]">
            <DialogHeader className="">
              <DialogTitle>
                <p className="my-2 text-xs">Shared by</p>
                <PeerInfoDiv peer={newMessage.from} />
              </DialogTitle>
              <div>
                <div className="my-4">
                  {filesLoading && (
                    <div className="p-4 flex flex-row gap-2 items-center text-sm">
                      <Loader className="h-4 w-4 animate-spin" /> Loading files
                    </div>
                  )}
                  {!filesLoading && (
                    <>
                      {newMessage.dataType ? (
                        <>
                          {downloadableFiles.map((file, idx) => (
                            <div
                              key={"file" + idx}
                              className="relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex items-center justify-between p-3 mt-2 w-full mx-auto rounded-md shadow-sm"
                            >
                              <div className="flex items-center space-x-2 overflow-hidden">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-xs">
                                  {truncateText(file.name, 28)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className="text-blue-500 hover:text-blue-700 text-sm z-10"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <Textarea
                          placeholder="Type your message here."
                          id="message"
                          defaultValue={message}
                          className="bg-muted w-full text-foreground rounded-2xl p-3 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 max-sm:w-full text-sm disabled:hover:cursor-text"
                          rows={6}
                          disabled
                        />
                      )}
                    </>
                  )}
                </div>
                <div className="my-2 flex flex-row gap-2">
                  <Button
                    className="rounded-2xl w-full font-bold" //bg-red-100 hover:bg-red-200 text-red-500
                    variant={"destructive"}
                    onClick={closeAndClear}
                  >
                    Cancel
                  </Button>
                  {!newMessage?.dataType && !filesLoading ? (
                    <Button
                      className="rounded-2xl w-full font-bold" //bg-gray-200 hover:bg-gray-100 text-black
                      variant={"default"}
                      onClick={() => {
                        navigator.clipboard
                          .writeText(newMessage.message)
                          .then(() => {
                            console.log("Copied to clipboard");

                            setCopyText("Copied!");
                            closeAndClear();

                            setTimeout(() => {
                              setCopyText("Copy Text");
                            }, 1000);
                          });
                      }}
                    >
                      {copyText}
                    </Button>
                  ) : (
                    <DowloadAll
                      filesToDownload={downloadableFiles}
                      closeAndClear={closeAndClear}
                      isLoading={filesLoading}
                    />
                  )}
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      <Ripple
        peers={peers
          .filter((peer) => !peer.isSelf)
          .map((peer) => (
            <Dialog
              key={peer.id}
              open={isOpen}
              onOpenChange={(val) => {
                if (val === false) {
                  closeAndClear();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="p-2 border h-fit border-gray-500 shadow-lg rounded-xl text-gray-800"
                  variant={"outline"}
                  onClick={() => {
                    setIsOpen(true);
                  }}
                >
                  <PeerInfoDiv peer={peer} />
                </Button>
              </DialogTrigger>

              <DialogContent className="rounded-2xl max-sm:max-w-[80%]">
                <>
                  <DialogTitle>
                    <p className="my-2 text-xs text-left">Sharing to</p>
                    <PeerInfoDiv peer={peer} />
                  </DialogTitle>
                  <div className="my-2 mb-2">
                    <ExpandableTabs
                      tabs={[
                        { title: "Message", icon: Text },
                        { title: "Files", icon: Files },
                      ]}
                      className="w-full"
                      onChange={(index) => {
                        if (index == 0) setType("text");
                        else setType("files");
                      }}
                      activeTabIndex={type == "files" ? 1 : 0}
                    />
                  </div>
                  {type === "text" ? (
                    <div className="my-2">
                      <div className="grid w-full gap-1.5">
                        <Textarea
                          placeholder="Type your message here."
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="bg-muted text-foreground rounded-2xl p-3 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 text-sm"
                          rows={6}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-4xl mx-auto h-fit border border-dashed bg-background border-neutral-200 dark:border-neutral-800 rounded-2xl">
                      <FileUpload
                        onChange={handleFileUpload}
                        onDelete={handleDeleteFile}
                        files={files}
                      />
                    </div>
                  )}
                  <div className="my-2 flex flex-row gap-2">
                    <Button
                      className="rounded-2xl w-full font-bold" //bg-red-100 hover:bg-red-200 text-red-500
                      variant={"destructive"}
                      onClick={closeAndClear}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="rounded-2xl w-full  font-bold" //bg-gray-200 hover:bg-gray-100 text-black
                      variant={"default"}
                      disabled={message.length == 0 && files.length == 0}
                      onClick={() => {
                        handleSend(peer.id);
                      }}
                    >
                      Send
                    </Button>
                  </div>
                </>
              </DialogContent>
            </Dialog>
          ))}
      />
    </>
  );
};
export default Peers;

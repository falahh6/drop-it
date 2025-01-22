"use client";

import { Download, Files, Monitor, Text } from "lucide-react";
import { Button } from "./ui/button";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTrigger,
  useMorphingDialog,
} from "./ui/morphing-dialog";
import { ExpandableTabs } from "./ui/expandable-tabs";
import { Textarea } from "./ui/textarea";
import useWebSocket, { PeerInfoProps } from "@/lib/useWS";
import { useEffect, useState } from "react";
import { FileUpload } from "./ui/file-upload";
import Ripple from "./ui/ripple";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        <Monitor className="h-5 w-5" />
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
  const { sendMessage, newMessage, setNewMessage, peers } = useWebSocket();
  const [message, setMessage] = useState<string>("");
  const [copyText, setCopyText] = useState<string>("Copy Text");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [type, setType] = useState<"files" | "text">("text");
  const [files, setFiles] = useState<File[]>([]);
  // const [filesLoading, setFilesLoading] = useState<boolean>(false);

  const { setIsOpen } = useMorphingDialog();

  const [downloadableFiles, setDownloadableFiles] = useState<
    {
      url: string;
      name: string;
    }[]
  >([]);

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
      }
    }
  }, [newMessage]);

  const closeAndClear = () => {
    setMessageDialogOpen(false);

    setFiles([]);
    setIsOpen(false);
    setNewMessage(null);
  };

  const handleSend = (peerId?: string) => {
    if (type == "text" && message.length > 0) {
      sendMessage({
        type: "unicast",
        to: peerId,
        content: message,
      });
      closeAndClear();
    } else {
      console.log("Files", files);

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
          sendMessage({
            type: "unicast",
            to: peerId,
            content: JSON.stringify(base64Files),
            dataType: "files",
          });
          closeAndClear();
        })
        .catch((error) => {
          console.error("Error encoding files to Base64:", error);
        });
    }
  };

  return (
    <>
      {newMessage && (
        <Dialog
          open={messageDialogOpen}
          onOpenChange={(val) => {
            if (val === false) {
              closeAndClear();
            }
          }}
        >
          <DialogContent className="rounded-3xl">
            <DialogHeader className="">
              <DialogTitle>
                <p className="my-2 text-xs">Shared by</p>
                <PeerInfoDiv peer={newMessage.from} />
              </DialogTitle>
              <div>
                <div className="my-4">
                  {newMessage.dataType ? (
                    <>
                      {downloadableFiles.map((file, idx) => (
                        <div
                          key={"file" + idx}
                          className="relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex items-center justify-between p-3 mt-2 w-full mx-auto rounded-md shadow-sm"
                        >
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400"></p>
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
                      defaultValue={newMessage.message}
                      className="bg-muted max-sm:min-w-[80vw] text-foreground rounded-2xl p-3 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 max-sm:w-full text-sm disabled:hover:cursor-text"
                      rows={6}
                      disabled
                    />
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
                  {!newMessage?.dataType && (
                    <Button
                      className="rounded-2xl w-full  font-bold" //bg-gray-200 hover:bg-gray-100 text-black
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
            <MorphingDialog
              key={peer.id}
              transition={{
                type: "spring",
                bounce: 0.05,
                duration: 0.25,
              }}
            >
              <MorphingDialogTrigger
                style={{
                  borderRadius: "12px",
                }}
                className="flex max-w-[270px] flex-col overflow-hidden"
              >
                <Button
                  className="p-2 border h-fit border-gray-500 shadow-lg rounded-xl text-gray-800"
                  variant={"outline"}
                >
                  <PeerInfoDiv peer={peer} />
                </Button>
              </MorphingDialogTrigger>{" "}
              <MorphingDialogContainer className="w-full">
                <MorphingDialogContent
                  style={{
                    borderRadius: "24px",
                  }}
                  className="relative p-6 pb-0 flex h-fit flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px] w-full max-sm:min-w-[80vw]"
                >
                  <>
                    <p className="my-2 text-xs">Sharing to</p>
                    <PeerInfoDiv peer={peer} />
                    <div className="my-4 mb-2">
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
                    <div className="my-2 mb-6 flex flex-row gap-2">
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
                  <MorphingDialogClose
                    clearDataHandler={closeAndClear}
                    className="text-black"
                  />
                </MorphingDialogContent>
              </MorphingDialogContainer>
            </MorphingDialog>
          ))}
      />
    </>
  );
};
export default Peers;

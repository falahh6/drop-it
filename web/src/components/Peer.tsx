"use client";

import { Files, Monitor, Text } from "lucide-react";
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
import useWebSocket from "@/lib/useWS";
import { useEffect, useState } from "react";
import { FileUpload } from "./ui/file-upload";

interface PeerProps {
  peer: {
    id: string;
    displayName: string;
    ip: string;
    os: string;
    browser: string;
    device: string;
    deviceType: string;
    isSelf: boolean;
  };
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

const Peer = ({ peer }: PeerProps) => {
  const { sendMessage, newMessage } = useWebSocket();
  const { setIsOpen } = useMorphingDialog();
  const [message, setMessage] = useState<string>("");

  const [type, setType] = useState<"files" | "text">("text");

  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleDeleteFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (newMessage) {
      setIsOpen(true);
    }
  }, [newMessage]);

  return (
    <>
      <MorphingDialog
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
        <MorphingDialogContainer>
          <MorphingDialogContent
            style={{
              borderRadius: "24px",
            }}
            className="relative p-6 pb-0 flex h-fit w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px]"
          >
            {newMessage ? (
              <>
                <p className="my-2 text-xs">Shared by</p>
                <PeerInfoDiv peer={newMessage.from} />
                <div className="my-4">
                  <Textarea
                    placeholder="Type your message here."
                    id="message"
                    defaultValue={newMessage.message}
                    className="bg-muted text-foreground rounded-2xl p-3 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
                    rows={6}
                    disabled
                  />
                </div>
                <div className="my-2 mb-6 flex flex-row gap-2">
                  <Button
                    className="rounded-2xl w-full bg-red-100 hover:bg-red-200 text-red-500 font-bold"
                    variant={"destructive"}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-2xl w-full bg-gray-200 hover:bg-gray-100 text-black font-bold"
                    variant={"default"}
                    onClick={() =>
                      navigator.clipboard.writeText(newMessage.message)
                    }
                  >
                    Copy text
                  </Button>
                </div>
              </>
            ) : (
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
                        className="bg-muted text-foreground rounded-2xl p-3 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
                        rows={6}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-background border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <FileUpload
                      onChange={handleFileUpload}
                      onDelete={handleDeleteFile}
                      files={files}
                    />
                  </div>
                )}
                <div className="my-2 mb-6 flex flex-row gap-2">
                  <Button
                    className="rounded-2xl w-full bg-red-100 hover:bg-red-200 text-red-500 font-bold"
                    variant={"destructive"}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-2xl w-full bg-gray-200 hover:bg-gray-100 text-black font-bold"
                    variant={"default"}
                    onClick={() =>
                      sendMessage({
                        type: "unicast",
                        to: peer.id,
                        content: message,
                      })
                    }
                  >
                    Send
                  </Button>
                </div>
              </>
            )}
            <MorphingDialogClose className="text-black" />
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </>
  );
};
export default Peer;

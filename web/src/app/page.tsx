"use client";

import { Button } from "@/components/ui/button";
import useWebSocket from "@/lib/useWS";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { peers, sendMessage } = useWebSocket();
  const setName = useState("")[1];

  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const displayName = localStorage.getItem("displayName");
    if (displayName) setName(displayName);
  }, []);

  const handleMessageSend = (
    type: "broadcast" | "unicast",
    to: string | undefined
  ) => {
    if (!to) return;
    sendMessage({ type, to, content: message });
  };

  const handleFileSend = (
    type: "broadcast" | "unicast",
    to: string | undefined
  ) => {
    if (!file || !to) return;
    const reader = new FileReader();

    reader.onload = function () {
      const base64Content = (reader?.result as string)?.split(",")[1];

      sendMessage({
        type,
        to,
        content: JSON.stringify({
          metadata: {
            name: file.name,
            size: file.size,
            mimeType: file.type,
          },
          data: base64Content,
        }),
        dataType: "file",
      });
    };

    reader.readAsDataURL(file!);
  };

  const [open, setOpen] = useState(false);
  const [sharingTo, setSharingTo] = useState<{
    id: string;
    displayName: string;
  } | null>(null);

  return (
    <div className="p-10 h-screen flex flex-col gap-4 items-center">
      <h1>DROP IT </h1>
      <h2>Connected Peers:</h2>
      <div className="p-4 flex flex-col gap-2  rounded-md">
        {peers.map((peer) => (
          <Button
            variant={"secondary"}
            disabled={peer.isSelf}
            onClick={() => {
              setOpen(true);
              setSharingTo({
                id: peer.id,
                displayName: peer.displayName,
              });
            }}
            className={cn("border", {
              "border-green-400": peer.isSelf,
            })}
            size={"sm"}
            key={peer.id}
          >
            {peer.displayName} - {peer.os} - {peer.browser}
          </Button>
        ))}
      </div>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          setSharingTo(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Data with {sharingTo?.displayName} </DialogTitle>
            <DialogDescription className="py-6">
              <Tabs defaultValue="message" className="w-full">
                <TabsList>
                  <TabsTrigger value="message">Text</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="message">
                  <Input
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                  <Button
                    onClick={() => {
                      handleMessageSend("unicast", sharingTo?.id);
                    }}
                    className="mt-2"
                  >
                    Send
                  </Button>
                </TabsContent>
                <TabsContent value="files">
                  <Input
                    onChange={(e) => {
                      setFile(e.target.files![0]);
                    }}
                    type="file"
                  />
                  <Button
                    onClick={() => {
                      handleFileSend("unicast", sharingTo?.id);
                    }}
                    className="mt-2"
                  >
                    Send
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

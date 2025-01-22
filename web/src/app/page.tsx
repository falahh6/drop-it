"use client";

import Peers from "@/components/Peers";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MorphingDialogProvider } from "@/components/ui/morphing-dialog";

export default function Home() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("displayName");
    setDisplayName(name);
  }, []);

  return (
    <main className="flex max-h-screen w-full -z-10 flex-col items-center justify-center overflow-hidden rounded-lg md:shadow-xl">
      <MorphingDialogProvider>
        <Peers />
      </MorphingDialogProvider>

      <div className="absolute bottom-4 pb-4 text-center text-gray-600 text-sm">
        <h3 className="">
          {" "}
          You are discoverable as{" "}
          <span className="font-semibold">{displayName}</span>
        </h3>
        <p className="mt-2 text-blue-500">
          You can be discovered by everyone on this network
        </p>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-0 right-0 p-4 text-xs z-50">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              localStorage.removeItem("displayName");
              localStorage.removeItem("clientId");

              window.location.reload();
            }}
          >
            Clear Cache
          </Button>
        </div>
      )}
    </main>
  );
}

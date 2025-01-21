"use client";

import useWebSocket from "@/lib/useWS";
import Ripple from "@/components/ui/ripple";
import Peer from "@/components/Peer";
import { MorphingDialogProvider } from "@/components/ui/morphing-dialog";

export default function Home() {
  const { peers } = useWebSocket();

  return (
    <main className="flex max-h-screen w-full -z-10 flex-col items-center justify-center overflow-hidden rounded-lg md:shadow-xl">
      <MorphingDialogProvider>
        <Ripple
          peers={peers
            .filter((peer) => !peer.isSelf)
            .map((peer) => (
              <Peer key={peer.id} peer={peer} />
            ))}
        />
      </MorphingDialogProvider>

      <div className="absolute bottom-4 pb-4 text-center text-gray-600 text-sm">
        <h3 className="">
          {" "}
          You are discoverable as{" "}
          <span className="font-semibold">
            {peers.find((peer) => peer.isSelf)?.displayName}
          </span>
        </h3>
        <p className="mt-2 text-blue-500">
          You can be discovered by everyone on this network
        </p>
      </div>
    </main>
  );
}

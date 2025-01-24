"use client";

import Peers from "@/components/Peers";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Script from "next/script";

export default function Home() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("displayName");
    setDisplayName(name);
  }, []);

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-WPRJ79S906"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WPRJ79S906');
        `}
      </Script>{" "}
      <main className="flex max-h-screen w-full -z-10 flex-col items-center justify-center overflow-hidden rounded-lg md:shadow-xl">
        <Peers />

        <div className="absolute bottom-4 pb-4 text-center text-gray-600 text-sm z-50">
          <h3 className="">
            {" "}
            You are discoverable as{" "}
            <span className="font-semibold">{displayName}</span>
          </h3>
          <p className="mt-2 text-blue-500">
            You can be discovered by everyone on this network
          </p>
        </div>
        <div className="fixed top-0 right-0 p-4 text-xs z-50">
          {process.env.NODE_ENV === "development" && (
            <Button
              variant={"outline"}
              size={"sm"}
              className="mr-3"
              onClick={() => {
                localStorage.removeItem("displayName");
                localStorage.removeItem("clientId");

                window.location.reload();
              }}
            >
              Clear Cache
            </Button>
          )}
          <p className="text-gray-500 opacity-50">
            <span className="font-semibold">Better Alt</span> of{" "}
            <span className="text-blue-500 ">Snapdrop.net</span>
          </p>
        </div>
      </main>
    </>
  );
}

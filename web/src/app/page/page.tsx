"use client";

import useWebSocket from "@/lib/useWS";
import { useEffect } from "react";

export default function Page() {
  const { newMessage } = useWebSocket();

  useEffect(() => {
    console.log("newMessage in page.tsx:", newMessage);
  }, [newMessage]);

  return (
    <div>
      <h1>WebSocket Example</h1>
      {newMessage && <p>New message: {newMessage.message}</p>}
    </div>
  );
}

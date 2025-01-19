"use client";

import useWebSocket from "@/lib/useWS";

export default function Home() {
  const { messages, peers, sendMessage } = useWebSocket();

  const handleSend = () => {
    sendMessage({ type: "broadcast", content: "Hello from Next.js!" });
  };

  return (
    <div className="p-10">
      <h1>WebSocket Demo</h1>
      <button onClick={handleSend}>Send Message</button>
      <h2>Connected Peers:</h2>
      <ul>
        {peers.map((peer) => (
          <li key={peer.id}>
            {" "}
            - {peer.displayName} -{peer.isSelf ? " (You)" : ""}{" "}
          </li>
        ))}
      </ul>
      <h2>Messages:</h2>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>- {JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
}

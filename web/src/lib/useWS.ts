import { useEffect, useState } from "react";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";

const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<
    {
      type: string;
      message: string;
    }[]
  >([]);
  const [peers, setPeers] = useState<
    {
      id: string;
      displayName: string;
      ip: string;
      os: string;
      browser: string;
      device: string;
      isSelf: boolean;
    }[]
  >([]);

  useEffect(() => {
    const clientId =
      localStorage.getItem("clientId") ??
      `client_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("clientId", clientId);

    const displayName =
      localStorage.getItem("displayName") ??
      uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: " ",
        style: "capital",
      });
    localStorage.setItem("displayName", displayName);

    const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_DOMAIN}/ws`);

    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      ws.send(
        JSON.stringify({
          clientId,
          displayName,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      if (data.type === "peers") {
        setPeers(
          data.peers.map(
            (peer: {
              id: string;
              displayName: string;
              ip: string;
              os: string;
              browser: string;
              device: string;
            }) => ({
              ...peer,
              isSelf: peer.id === clientId,
            })
          )
        );
      } else if (data.type === "peer-joined") {
        setPeers((prevPeers) => [
          ...prevPeers,
          { ...data.peer, isSelf: data.peer.id === clientId },
        ]);
        setMessages((prev) => [
          ...prev,
          { type: "info", message: `${data.peer.id} joined` },
        ]);
      } else if (data.type === "peer-left") {
        setPeers((prevPeers) =>
          prevPeers.filter((peer) => peer.id !== data.peerId)
        );
        setMessages((prev) => [
          ...prev,
          { type: "info", message: `${data.peerId} left` },
        ]);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket connection closed");

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: { type: string; content: string }) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return { messages, peers, sendMessage };
};

export default useWebSocket;

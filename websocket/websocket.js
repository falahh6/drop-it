const WebSocket = require("ws");
const parser = require("ua-parser-js");

class WebSocketServer {
  constructor(port) {
    this._wss = new WebSocket.Server({ port });
    this._peers = {};
    this._rooms = {};

    this._wss.on("connection", (socket, req) =>
      this._onConnection(socket, req)
    );
    console.log(`WebSocket server running on ws://localhost:${port}`);
  }

  _onConnection(socket, req) {
    socket.once("message", (data) => {
      try {
        const { displayName, clientId } = JSON.parse(data);
        const clientInfo = this._getClientInfo(req, clientId, displayName);

        const clientIp = this._getClientIp(req);

        if (!this._rooms[clientIp]) {
          this._rooms[clientIp] = {};
        }
        this._rooms[clientIp][clientId] = { socket, info: clientInfo };

        console.log(
          `Client connected: ${clientId} (${displayName}) in room ${clientIp}`
        );

        this._broadcastToRoom(clientIp, {
          type: "peer-joined",
          peer: clientInfo,
        });

        const peers = Object.keys(this._rooms[clientIp]).map((id) => ({
          id,
          ...this._rooms[clientIp][id].info,
        }));
        this._send(socket, {
          type: "peers",
          peers,
        });

        socket.on("message", (data) =>
          this._onMessage(clientId, clientIp, data)
        );

        socket.on("close", () => this._onDisconnect(clientId, clientIp));

        socket.on("error", console.error);
      } catch (e) {
        console.error("Error parsing initial message:", e);
        socket.close();
      }
    });
  }

  _onMessage(clientId, clientIp, data, isBinary = false) {
    if (isBinary) {
      console.log(`Received binary from ${clientId} in room ${clientIp}`);
      return;
    }

    try {
      const message = JSON.parse(data);
      console.log(`Received from ${clientId} in room ${clientIp}:`, message);

      if (message.type === "unicast") {
        const { to, content } = message;
        if (this._rooms[clientIp][to]) {
          console.log("Sending to", to);
          this._send(this._rooms[clientIp][to].socket, {
            from: clientId,
            message: content,
          });
        }
      }

      if (message.type === "broadcast") {
        this._broadcastToRoom(clientIp, {
          from: clientId,
          message: message.content,
        });
      }
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  }

  _onDisconnect(clientId, clientIp) {
    console.log(`Client disconnected: ${clientId} from room ${clientIp}`);

    if (this._rooms[clientIp] && this._rooms[clientIp][clientId]) {
      delete this._rooms[clientIp][clientId];

      if (Object.keys(this._rooms[clientIp]).length === 0) {
        delete this._rooms[clientIp];
      }

      this._broadcastToRoom(clientIp, {
        type: "peer-left",
        peerId: clientId,
      });
    } else {
      console.log(`No room found for clientId: ${clientId} at IP: ${clientIp}`);
    }
  }

  _send(socket, message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  _broadcastToRoom(ip, message) {
    if (!this._rooms[ip]) return;

    Object.values(this._rooms[ip]).forEach(({ socket }) => {
      this._send(socket, message);
    });
  }

  _getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0] : req.socket.remoteAddress;

    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      return "127.0.0.1";
    }

    return ip;
  }

  _getClientInfo(req, clientId, name) {
    const ua = parser(req.headers["user-agent"]);

    const os = ua.os.name || "Unknown OS";
    const browser = ua.browser.name || "Unknown Browser";
    const device = ua.device.model || "Unknown Device";

    return {
      id: clientId,
      ip: this._getClientIp(req),
      os,
      browser,
      device,
      displayName: name,
    };
  }
}

const PORT = process.env.NEXT_PUBLIC_WS_PORT || 8080;
new WebSocketServer(PORT);

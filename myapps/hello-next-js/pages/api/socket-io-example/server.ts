// pages/api/socket-io-example/server.ts

import { NextApiRequest, NextApiResponse } from "next"; 
import { Server as IOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { ChatMessageType } from "@/types/Chat";

// Extend the Next.js response type to include the custom server property
type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: HttpServer & {
            io?: IOServer;
        }
    }
};

let io: IOServer;

// sets up the socket.io server inside an API route 
// lazy-loaded on first request (the websocket server is not started when the app boots - 
// instead, it's only initialised the first someone accesses the /api/socket endpoint)
// - the res.socket.server.io doesn't exist until the 1st call to this endpoint
// - On the 1st request, we create the socket.io server & then attach it to the HTTP server
// - All future API requests to this route will io already set and skip the initialisation
// Why not just initialise it when the app start?
// - hot reload in dev: Next.js scan restart or reload routes multiple times, creating duplicate socket.io instances
// (compatible with hot reload)
// - serverless (like Vercel): in serverless environments, functions run isolated instances. Attaching the 
// WebSocket server to a long-lived process (like res.socket.server) ensures that it's initialised once
// (Avoiding duplicate servers)
// per persistent instance
// - performance: lazy loading avoids unnecessary setup if the endpoint is never hit
// (efficient)
export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    try {
        // lazy-load -> First request: no server yet
        if(!res?.socket?.server.io) {
            console.log("Initialising Websocket server...");

            io = new IOServer(res.socket.server, {
                path: "/api/socket-io-example/server",
                addTrailingSlash: false,
            });
        
            res.socket.server.io = io;
        }

        io.on("connection", (socket: Socket) => {
            console.log("New Client connection...", socket.id);
            
            socket.on("message", (msg: ChatMessageType) => {
                try {
                    console.log("Message received: ", msg, " of type ", typeof(msg));

                    io.emit("message", msg);
                } catch(err) {
                    console.error("Error handling 'message' event: ", err);
                    socket.emit("error", "Server error while processing message");
                }
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected: ", socket.id);
            });
        });

        // lazy-load: After that, it's already set
        res.end();
    } catch(err) {
        console.error("Failed to initialise Websocket server: ", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// src/views/socketIoClientExamplePage.ts

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessageType } from "@/types/Chat";

export default function SocketIoClientExamplePage() {
    const socketRef = useRef<Socket | null>(null);
    
    const [input, setInput] = useState<ChatMessageType | null>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);

    useEffect(() => {
        // Initialize server once
        fetch("/api/socket-io-example/server");

        socketRef.current = io({
            path: "/api/socket-io-example/server",
        });

        socketRef.current.on("message", (msg: ChatMessageType) => {
            console.log("useEffect message ", msg);
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socketRef.current?.disconnect();
        }
    }, []); // run once

    const sendMessage = () => {
        if(input?.text) {
            socketRef.current?.emit("message", input);
            setInput(null);
        }
    }

    return (
        <div>
            <h1>Websocket Chat</h1>
            <input
                value={input?.text}
                onChange={(e) => setInput({user: "test", text: e.target.value})}
                placeholder="Type Message..."
            />
            <button onClick={sendMessage}>Send</button>
            <ul>
                {messages.map((msg, idx) => (
                    <li key={idx}>{`${msg.user}: ${msg.text}`}</li>
                ))}
            </ul>
        </div>
    );
}

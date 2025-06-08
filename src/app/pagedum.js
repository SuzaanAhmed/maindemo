"use client";

import { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
General Business Information:
Website: www.yourbusiness.com

Return Policy:
Customers can return products within 30 days of purchase with the original receipt.
Items must be unused and in their original packaging.
Refunds will be processed to the original payment method.

Support Email: support@yourbusiness.com
`;

// IMPORTANT: Put your actual API key here as a string
const API_KEY = "AIzaSyAOzfp-q9ZbJxfZBqArd7XW5nq1GDZgrGU";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: businessInfo,
});

export default function ChatPage() {
  const [messages, setMessages] = useState({ history: [] });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  async function sendMessage() {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Append user message
    setMessages((prev) => ({
      history: [
        ...prev.history,
        { role: "user", parts: [{ text: userMessage }] },
      ],
    }));

    try {
      const chat = model.startChat(messages);
      const result = await chat.sendMessageStream(userMessage);

      let modelResponse = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        modelResponse += chunkText;

        // Live update UI with partial model response
        setMessages((prev) => {
          const newHistory = [...prev.history];
          if (
            newHistory.length > 0 &&
            newHistory[newHistory.length - 1].role === "model"
          ) {
            newHistory.pop();
          }
          newHistory.push({ role: "model", parts: [{ text: modelResponse }] });
          return { history: newHistory };
        });

        // Scroll to bottom
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    } catch (error) {
      setMessages((prev) => ({
        history: [
          ...prev.history,
          {
            role: "error",
            parts: [{ text: "The message could not be sent. Please try again." }],
          },
        ],
      }));
    }

    setIsLoading(false);
  }

  return (
    <>
      <div className="chat-window">
        <div
          className="chat"
          ref={chatContainerRef}
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {messages.history.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.role === "user"
                  ? "user"
                  : msg.role === "model"
                  ? "model"
                  : "error"
              }
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: msg.parts.map((p) => p.text).join(""),
                }}
              />
            </div>
          ))}
          {isLoading && <div className="loader"></div>}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading}>
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-window {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          max-height: 500px;
          background: white;
          border: 1px solid #ccc;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          z-index: 9999;
        }
        .chat {
          padding: 10px;
          flex-grow: 1;
          overflow-y: auto;
          background: #f9f9f9;
        }
        .user p {
          background: #007bff;
          color: white;
          padding: 8px 12px;
          border-radius: 12px;
          display: inline-block;
          max-width: 80%;
          margin-bottom: 8px;
        }
        .model p {
          background: #e5e5ea;
          color: black;
          padding: 8px 12px;
          border-radius: 12px;
          display: inline-block;
          max-width: 80%;
          margin-bottom: 8px;
        }
        .error p {
          color: red;
          font-weight: bold;
        }
        .input-area {
          display: flex;
          border-top: 1px solid #ccc;
          padding: 10px;
        }
        .input-area input {
          flex-grow: 1;
          padding: 8px;
          font-size: 14px;
        }
        .input-area button {
          margin-left: 8px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        }
        .loader {
          height: 20px;
          width: 20px;
          border: 3px solid #ccc;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 8px auto;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

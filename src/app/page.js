"use client";

import { useState, useRef, useMemo } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to dynamically create systemInstruction
function getChildInfo(nicheInterest, childCharacter, botCharacter) {
  return `
You are a compassionate and friendly communication companion for specially-abled children. 
Your role is to engage the child in safe, imaginative, and supportive conversations. 
Speak clearly and simply. Encourage the child’s expression, self-confidence, and social understanding through playful role-play and real-life scenarios. 
Adapt your language to the child's responses and emotional state. If needed, suggest expressions or signs they can use. Always maintain a positive, patient, and non-judgmental tone. 
Your goal is to help the child find their voice and feel empowered to communicate.
Play the character with conviction. Do not water it down and simplify it. Play it to the utmost realism.
Niche Interest: ${nicheInterest || "Not provided"}
Character child likes: ${childCharacter || "Not provided"}
Character bot plays: ${botCharacter || "Not provided"}
`;
}

const API_KEY = "AIzaSyAOzfp-q9ZbJxfZBqArd7XW5nq1GDZgrGU";

export default function ChatPage() {
  const [messages, setMessages] = useState({ history: [] });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef(null);

  // Dynamic variables:
  const [nicheInterest, setNicheInterest] = useState("");
  const [childCharacter, setChildCharacter] = useState("");
  const [botCharacter, setBotCharacter] = useState("");

  // Memoize model to avoid recreating every time unless inputs change
  const genAI = useMemo(() => new GoogleGenerativeAI(API_KEY), []);
  const model = useMemo(
    () =>
      genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: getChildInfo(
          nicheInterest,
          childCharacter,
          botCharacter
        ),
      }),
    [genAI, nicheInterest, childCharacter, botCharacter]
  );

  async function sendMessage() {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

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

        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }
    } catch (error) {
      setMessages((prev) => ({
        history: [
          ...prev.history,
          {
            role: "error",
            parts: [
              { text: "The message could not be sent. Please try again." },
            ],
          },
        ],
      }));
    }

    setIsLoading(false);
  }

  return (
    <>
      <div style={{ marginBottom: "12px" }}>
        <label>
          Niche Interest:{" "}
          <input
            value={nicheInterest}
            onChange={(e) => setNicheInterest(e.target.value)}
          />
        </label>
        <br />
        <label>
          Child Character:{" "}
          <input
            value={childCharacter}
            onChange={(e) => setChildCharacter(e.target.value)}
          />
        </label>
        <br />
        <label>
          Bot Character:{" "}
          <input
            value={botCharacter}
            onChange={(e) => setBotCharacter(e.target.value)}
          />
        </label>
      </div>

      {!showChat && (
        <button className="open-chat-button" onClick={() => setShowChat(true)}>
          Open Chat
        </button>
      )}

      {showChat && (
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
            <button
              onClick={() => setShowChat(false)}
              style={{ marginLeft: "8px", background: "#f44336", color: "white" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .open-chat-button {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 12px 24px;
          font-size: 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .chat-window {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
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

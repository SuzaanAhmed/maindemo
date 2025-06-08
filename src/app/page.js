"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `

General Business Information:
Website: www.yourbusiness.com

Return Policy:
Customers can return products within 30 days of purchase with the original receipt.
Items must be unused and in their original packaging.
Refunds will be processed to the original payment method.

Support Email: support@yourbusiness.com

Madrid Location:
Address: Calle Mayor 123, 28013 Madrid, Spain
Phone: +34 91 123 4567
Email: madrid@yourbusiness.com
Opening Hours:
Monday to Friday: 10:00 AM to 8:00 PM
Saturday: 10:00 AM to 6:00 PM
Sunday: Closed

New York Location:
Address: 456 Broadway, New York, NY 10012, USA
Phone: +1 212-123-4567
Email: newyork@yourbusiness.com
Opening Hours:
Monday to Friday: 9:00 AM to 7:00 PM
Saturday: 10:00 AM to 5:00 PM
Sunday: Closed

FAQs:
General:
What is your return policy?

You can return items within 30 days with the original receipt and packaging. Refunds are processed to the original payment method.
Do you ship internationally?

Yes, we ship to most countries. Shipping rates and delivery times vary by location.
How can I track my order?

You will receive a tracking number via email once your order is shipped.
Can I cancel or modify my order?

Orders can be modified or canceled within 24 hours. Please contact support@yourbusiness.com.
Madrid Location:
What are your opening hours in Madrid?

Monday to Friday: 10:00 AM to 8:00 PM
Saturday: 10:00 AM to 6:00 PM
Sunday: Closed
Is parking available at the Madrid store?

Yes, we offer parking nearby. Contact us for details.
How can I contact the Madrid store?

You can call us at +34 91 123 4567 or email madrid@yourbusiness.com.
New York Location:
What are your opening hours in New York?

Monday to Friday: 9:00 AM to 7:00 PM
Saturday: 10:00 AM to 5:00 PM
Sunday: Closed
Do you host events at the New York location?

Yes, we host regular workshops and community events. Check our website for updates.
How can I contact the New York store?

You can call us at +1 212-123-4567 or email newyork@yourbusiness.com.

Tone Instructions:
Conciseness: Respond in short, informative sentences.
Formality: Use polite language with slight formality (e.g., "Please let us know," "We are happy to assist").
Clarity: Avoid technical jargon unless necessary.
Consistency: Ensure responses are aligned in tone and style across all queries.
Example: "Thank you for reaching out! Please let us know if you need further assistance."

`;

const API_KEY = "AIzaSyAOzfp-q9ZbJxfZBqArd7XW5nq1GDZgrGU"; // example key - keep safe in env vars

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "model", text: "Hi, how can I help you?" },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);
  const [genModel, setGenModel] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [history, setHistory] = useState([]);

  // Initialize GoogleGenerativeAI and model once
  useEffect(() => {
    if (!genModel) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          systemInstruction: businessInfo,
        });
        setGenModel(model);
      } catch (err) {
        console.error("Failed to initialize AI model", err);
      }
    }
  }, [genModel]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !genModel) return;
    setLoading(true);

    const userMessage = input.trim();

    setMessages((msgs) => [...msgs, { role: "user", text: userMessage }]);
    setInput("");

    try {
      // Start chat session or reuse existing
      const chat = chatSession || genModel.startChat({ history });
      setChatSession(chat);

      const response = await chat.sendMessage(userMessage);

      // Assuming sendMessage returns full response text (not streaming here)
      setMessages((msgs) => [
        ...msgs,
        { role: "model", text: response.text ?? "Sorry, no response." },
      ]);

      // Update history for context
      setHistory((h) => [
        ...h,
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: response.text }] },
      ]);
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        { role: "error", text: "The message could not be sent. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8">
      {/* Your existing page content */}
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2 tracking-[-.01em]">
              Get started by editing{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
                src/app/page.js
              </code>
              .
            </li>
            <li className="tracking-[-.01em]">Save and see your changes instantly.</li>
          </ol>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <a
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
              />
              Deploy now
            </a>
            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our docs
            </a>
          </div>
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
            Go to nextjs.org →
          </a>
        </footer>
      </div>

      {/* Chat Button */}
      {!chatOpen && (
        <button
          className="chat-button fixed bottom-8 right-8 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center"
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <section className="chat-window fixed bottom-20 right-8 w-80 max-w-full bg-white border rounded-lg shadow-lg flex flex-col h-[500px]">
          <header className="flex justify-between items-center p-3 border-b">
            <h2 className="font-semibold">AI Chat Assistant</h2>
            <button
              className="close text-gray-600 hover:text-gray-900"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div
            ref={messagesRef}
            className="chat flex-1 overflow-y-auto p-4 space-y-3 text-sm"
            aria-live="polite"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.role === "user"
                    ? "user text-right"
                    : msg.role === "model"
                    ? "model text-left text-gray-800"
                    : "error text-red-600 text-left"
                }
              >
                <p>{msg.text}</p>
              </div>
            ))}

            {loading && <div className="loader text-center">Loading...</div>}
          </div>

          <form
            className="input-area p-3 border-t flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              aria-label="Chat input"
              type="text"
              className="flex-grow border rounded px-3 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
              disabled={loading}
            >
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

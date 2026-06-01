import { useState } from "react";

import { MessageCircle, Send, Bot, User, X } from "lucide-react";

import "../styles/chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Halo! Saya Smart Finance AI 👋",
    },
  ]);

  /* -------------------------------------------------------------------------- */
  /*                                SEND MESSAGE                                */
  /* -------------------------------------------------------------------------- */

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;

    setInput("");

    setLoading(true);

    try {
      console.log("CHAT API =", import.meta.env.VITE_AI_API_URL_CHAT);

      const response = await fetch(import.meta.env.VITE_AI_API_URL_CHAT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: userInput,
        }),
      });

      const data = await response.json();

      const botReply = {
        sender: "bot",
        text: data.answer,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Server AI sedang bermasalah.",
        },
      ]);

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                    ENTER                                   */
  /* -------------------------------------------------------------------------- */

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* BUTTON */}

      <button className="chat-button" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* CHAT BOX */}

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="chat-title">
              <Bot size={20} />

              <span>Smart Finance AI</span>
            </div>
          </div>

          {/* MESSAGES */}

          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-icon">{msg.sender === "bot" ? <Bot size={16} /> : <User size={16} />}</div>

                <div className="message-text">{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="message-icon">
                  <Bot size={16} />
                </div>

                <div className="message-text">AI sedang mengetik...</div>
              </div>
            )}
          </div>

          {/* INPUT */}

          <div className="chat-input">
            <input type="text" placeholder="Tanya soal finansial..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleEnter} />

            <button onClick={sendMessage}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;

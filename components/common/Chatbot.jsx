"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hello! I am City Assistant. How can I help you today?", isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK_URL || "https://gopika110.app.n8n.cloud/webhook-test/chatbot";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatInput: userMessage,
          history: messages
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from assistant");
      }

      const rawData = await response.text();
      let botText = "";

      try {
        const data = JSON.parse(rawData);
        const result = Array.isArray(data) ? data[0] : data;
        
        // Find the most likely candidate for the message
        let candidate = result.reply || result.output || result.response || result.message || result.text || result;
        
        // If the candidate is still an object, try to find a string inside it
        if (candidate && typeof candidate === 'object') {
          candidate = candidate.reply || candidate.text || candidate.message || candidate.output || JSON.stringify(candidate);
        }
        
        botText = String(candidate);
      } catch (e) {
        // Handle multi-line raw string responses
        botText = rawData;
      }

      if (!String(botText || "").trim()) {
        botText = "I received an empty response. Please check your n8n workflow.";
      }

      setMessages(prev => [...prev, { text: String(botText), isBot: true }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting to the city servers. Please try again later.",
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "var(--accent-primary)",
            border: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
            transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {isOpen && (
        <div style={{
          width: "340px",
          height: "480px",
          background: "#020617",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
          overflow: "hidden",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px",
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
              <div style={{ background: "var(--accent-primary)", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={14} color="white" />
              </div>
              City Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "4px" }}
              onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
              onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.isBot ? "flex-start" : "flex-end",
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: "14px",
                borderBottomLeftRadius: m.isBot ? "4px" : "14px",
                borderBottomRightRadius: !m.isBot ? "4px" : "14px",
                background: m.isBot ? "var(--bg-card)" : "var(--accent-primary)",
                border: m.isBot ? "1px solid var(--border-color)" : "none",
                color: "var(--text-primary)",
                fontSize: "14px",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}>
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div style={{
                alignSelf: "flex-start",
                padding: "12px 16px",
                borderRadius: "14px",
                borderBottomLeftRadius: "4px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: "var(--text-muted)",
                fontSize: "14px"
              }}>
                <span className="dot-pulse">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px", background: "var(--bg-card)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isLoading ? "Please wait..." : "Ask something..."}
              disabled={isLoading}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "24px",
                padding: "10px 16px",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "14px",
                opacity: isLoading ? 0.7 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: isLoading ? "var(--text-muted)" : "var(--accent-primary)",
                border: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.background = "var(--accent-secondary)")}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.background = "var(--accent-primary)")}
            >
              <Send size={18} style={{ marginLeft: "2px" }} />
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ShadeItem } from "../types";
import { supabase } from "../supabaseClient";
import { Sparkles, Send, PhoneCall, Palette, Bot, User } from "lucide-react";

interface PaintConsultantChatProps {
  isOpen: boolean;
  onClose: () => void;
  onPickShadeFromChat?: (shade: ShadeItem) => void;
}

const transformShade = (dbShade: any): ShadeItem =>
  ({
    code: dbShade.shade_code || "Unknown",
    name: dbShade.shade_name || "Unknown Shade",
    hex: dbShade.hex_code || "#CCCCCC",
    brand: dbShade.brand_name || "Asian Paints",
    family: dbShade.color_family || "General",
    tinting_charge: Number(dbShade.tinting_charge) || 0,
  }) as ShadeItem;

const SUGGESTION_CHIPS = [
  "Calculate paint for 3BHK in Jamshedpur",
  "Best monsoon damp-proofing for wall skirting",
  "Compare Asian Paints Royale Glitz vs Birla Opus One",
  "Suggest modern warm beige shade codes",
];

export const PaintConsultantChat: React.FC<PaintConsultantChatProps> = ({
  isOpen,
  onClose,
  onPickShadeFromChat,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamically load the first message and fetch real shades from Supabase
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const loadInitialMessage = async () => {
        // Fetch 3 random shades from your real database! No dummies.
        const { data } = await supabase.from("shades").select("*").limit(3);
        const dynamicShades = data ? data.map(transformShade) : undefined;

        setMessages([
          {
            id: "msg-1",
            sender: "consultant",
            text: `Namaste! Welcome to **Nikhil Paints and Hardware Jamshedpur**.\n\nI am your Master Paint & Color Technical Consultant. How can I assist with your painting project today?`,
            timestamp: "Just now",
            suggestedShades: dynamicShades,
          },
        ]);
      };
      loadInitialMessage();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/consultant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();
      const replyText = data.reply || "Thank you for consulting Nikhil Paints.";

      const codeRegex = /\b\d{4}\b/g;
      const mentionedCodes = replyText.match(codeRegex) || [];
      let matchedShades: ShadeItem[] = [];

      if (mentionedCodes.length > 0) {
        const { data: dbShades, error } = await supabase
          .from("shades")
          .select("*")
          .in("shade_code", mentionedCodes)
          .limit(3);
        if (!error && dbShades) matchedShades = dbShades.map(transformShade);
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "consultant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        suggestedShades: matchedShades.length > 0 ? matchedShades : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "consultant",
          text: "Thank you for reaching out to **Nikhil Paints Sakchi**!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-500 flex items-center justify-center font-black shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight text-white">
                Nikhil Paints Expert Consultant
              </h3>
              <p className="text-xs text-slate-300">
                Colors, Square Footage & Brand Comparison
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-300 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[88%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${msg.sender === "user" ? "bg-slate-900 text-white" : "bg-amber-500 text-slate-950"}`}
              >
                {msg.sender === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs space-y-2 ${msg.sender === "user" ? "bg-slate-900 text-white rounded-tr-xs" : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"}`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                {msg.suggestedShades && msg.suggestedShades.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-rose-500" />
                      <span>Recommended Shades from Database:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {msg.suggestedShades.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5"
                        >
                          <div
                            className="w-5 h-5 rounded-md border border-black/20 shrink-0"
                            style={{ backgroundColor: s.hex }}
                          />
                          <div className="truncate min-w-0 flex-1">
                            <div className="font-extrabold text-[10px] text-slate-900 truncate">
                              {s.code}
                            </div>
                            <div className="text-[9px] text-slate-500 truncate">
                              {s.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-4 px-2">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(chip);
                    handleSendMessage(chip);
                  }}
                  className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-bold text-left transition-colors shadow-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about shades (e.g. 0427)..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-black text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send, Image, Mic, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  PK_chatMessage: number;
  senderRole: string;
  senderName: string;
  messageType: string;
  message: string | null;
  fileUrl: string | null;
  createdAt: string;
  FK_citizen: number | null;
};

const SENDER_COLORS: Record<string, string> = {
  CITIZEN: "bg-red-500 text-white",
  IA: "bg-blue-500 text-white",
  CENTRAL_GAMC: "bg-purple-500 text-white",
  POLICE_UNIT: "bg-blue-600 text-white",
  FIRE_UNIT: "bg-orange-500 text-white",
  AMBULANCE_UNIT: "bg-green-500 text-white",
  SAR_UNIT: "bg-emerald-500 text-white",
  SYSTEM_EVENT: "bg-muted text-muted-foreground",
};

export default function EmergencyChatPage() {
  const params = useParams();
  const emergencyCode = params.emergencyCode as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emergencyId, setEmergencyId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch emergency ID from code
  useEffect(() => {
    fetch("/api/citizen/emergencies")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.emergencies || []).find(
          (e: { emergencyCode: string }) => e.emergencyCode === emergencyCode,
        );
        if (found) setEmergencyId(found.PK_emergency);
      });
  }, [emergencyCode]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!emergencyId) return;
    try {
      const res = await fetch(
        `/api/citizen/emergencies/${emergencyId}/messages`,
      );
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!emergencyId || !newMessage.trim()) return;

    setSending(true);
    try {
      await fetch(`/api/citizen/emergencies/${emergencyId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim(),
          messageType: "TEXT",
        }),
      });
      setNewMessage("");
      fetchMessages();
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }, [emergencyId, newMessage, fetchMessages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href={`/citizen/emergency/${emergencyCode}`}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Chat de emergencia</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {emergencyCode}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay mensajes aún
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderRole === "CITIZEN";
            const isSystem = msg.senderRole === "SYSTEM_EVENT" || msg.messageType === "SYSTEM_EVENT";

            if (isSystem) {
              return (
                <div key={msg.PK_chatMessage} className="flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.PK_chatMessage}
                className={cn("flex", isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    isMine
                      ? "bg-red-500 text-white rounded-br-md"
                      : "bg-card border rounded-bl-md",
                  )}
                >
                  {!isMine && (
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  {msg.fileUrl && (
                    <div className="mt-2">
                      <img
                        src={msg.fileUrl}
                        alt="Adjunto"
                        className="max-w-full rounded-lg"
                      />
                    </div>
                  )}
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isMine ? "text-white/60" : "text-muted-foreground",
                    )}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("es-BO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0 bg-red-600 text-white hover:bg-red-500"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

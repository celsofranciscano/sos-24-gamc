"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Notification = {
  PK_notification: number;
  title: string;
  message: string;
  notificationType: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  FK_emergency: number | null;
  tbemergencies: { emergencyCode: string } | null;
};

export default function AccountNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/citizen/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    await fetch("/api/citizen/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllAsRead: true }),
    });
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen/account"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-semibold">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} sin leer
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-red-500 font-medium"
          >
            <CheckCheck className="size-3.5" />
            Marcar todo leído
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="size-12 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No hay notificaciones
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {notifications.map((notif) => (
              <div
                key={notif.PK_notification}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  notif.isRead ? "bg-card" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                )}
              >
                <div className="flex items-start gap-2">
                  {!notif.isRead && (
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-red-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString("es-BO")}
                      </p>
                      {notif.tbemergencies && (
                        <Link
                          href={`/citizen/emergency/${notif.tbemergencies.emergencyCode}`}
                          className="text-[10px] text-red-500 font-medium"
                        >
                          Ver emergencia
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

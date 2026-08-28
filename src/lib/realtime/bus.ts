import { EventEmitter } from "node:events";

export type RealtimeEvent = {
  topic: string;
  type: string;
  payload?: unknown;
  at: string;
};

const globalForBus = globalThis as typeof globalThis & {
  __sosRealtimeBus?: EventEmitter;
};

export const bus: EventEmitter = globalForBus.__sosRealtimeBus ?? new EventEmitter();
bus.setMaxListeners(0);
globalForBus.__sosRealtimeBus = bus;

export function publish(topic: string, type: string, payload?: unknown): void {
  const event: RealtimeEvent = {
    topic,
    type,
    payload,
    at: new Date().toISOString(),
  };
  bus.emit("event", event);
}

export const topics = {
  dashboard: "dashboard",
  emergency: (id: number) => `emergency:${id}`,
  emergencies: "emergencies",
  assignment: (id: number) => `assignment:${id}`,
  unit: (id: number) => `unit:${id}`,
  notificationsUser: (userId: number) => `notifications:user:${userId}`,
};

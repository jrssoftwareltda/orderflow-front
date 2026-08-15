import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/shared/api/http-client";
import { logger } from "@/shared/logging/logger";
import type { Order, OrderStatusEvent, OrderStatusHistory } from "../types/order";

export type SseConnectionState = "connecting" | "connected" | "reconnecting" | "closed";

export function useOrderEvents(orderId: string, initialHistory: OrderStatusHistory[]) {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<SseConnectionState>("connecting");
  const [liveEvents, setLiveEvents] = useState<OrderStatusHistory[]>([]);

  useEffect(() => {
    if (!orderId) return;

    setConnectionState("connecting");
    const url = apiUrl(`/api/orders/${orderId}/events`);
    logger.info("sse", "Opening order event stream", { orderId, url });
    const source = new EventSource(url);

    source.onopen = () => {
      setConnectionState("connected");
      logger.info("sse", "Order event stream connected", { orderId });
    };

    const handleOrderStatus = (rawEvent: Event) => {
      const event = rawEvent as MessageEvent<string>;
      try {
        const payload = JSON.parse(event.data) as OrderStatusEvent;
        logger.debug("sse", "Order status event received", {
          orderId,
          eventId: event.lastEventId,
          status: payload.status,
          occurredAt: payload.occurredAt,
        });

        setLiveEvents((current) => {
          const duplicate = current.some(
            (item) => item.status === payload.status && item.occurredAt === payload.occurredAt,
          );
          return duplicate ? current : [...current, { status: payload.status, occurredAt: payload.occurredAt }];
        });

        queryClient.setQueryData<Order>(["orders", orderId], (current) =>
          current ? { ...current, status: payload.status, updatedAt: payload.occurredAt } : current,
        );
        void queryClient.invalidateQueries({ queryKey: ["orders", orderId, "history"] });
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
      } catch (error) {
        logger.error("sse", "Could not parse order status event", {
          orderId,
          data: event.data,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    source.addEventListener("order-status", handleOrderStatus);

    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        setConnectionState("closed");
        logger.warn("sse", "Order event stream closed", { orderId });
      } else {
        setConnectionState("reconnecting");
        logger.warn("sse", "Order event stream interrupted; browser will reconnect", {
          orderId,
          readyState: source.readyState,
        });
      }
    };

    return () => {
      source.removeEventListener("order-status", handleOrderStatus);
      source.close();
      setConnectionState("closed");
      logger.debug("sse", "Order event stream disposed", { orderId });
    };
  }, [orderId, queryClient]);

  const events = useMemo(() => {
    const merged = [...initialHistory, ...liveEvents];
    const seen = new Set<string>();
    return merged
      .filter((item) => {
        const key = `${item.status}:${item.occurredAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  }, [initialHistory, liveEvents]);

  return { connectionState, events };
}

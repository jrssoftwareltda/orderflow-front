import { Radio } from "lucide-react";
import { formatTime } from "@/shared/utils/format";
import type { SseConnectionState } from "../hooks/use-order-events";
import type { OrderStatus, OrderStatusHistory } from "../types/order";

const eventNames: Record<OrderStatus, string> = {
  CREATED: "ORDER_CREATED",
  PAYMENT_PROCESSING: "PAYMENT_PROCESSING",
  PAYMENT_APPROVED: "PAYMENT_APPROVED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  COMPLETED: "ORDER_COMPLETED",
};

const connectionLabel: Record<SseConnectionState, string> = {
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  closed: "Closed",
};

export function EventStream({ events, connectionState, orderId }: {
  events: OrderStatusHistory[];
  connectionState: SseConnectionState;
  orderId: string;
}) {
  return (
    <section className="panel event-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Live event stream</span>
          <h2>Order status events</h2>
        </div>
        <span className={`connection-state ${connectionState}`}>
          <Radio size={14} /> {connectionLabel[connectionState]}
        </span>
      </div>

      <div className="event-list">
        {events.length === 0 && <p className="empty-inline">Waiting for the first order event...</p>}
        {events.map((event, index) => (
          <div className="event-row" key={`${event.status}-${event.occurredAt}-${index}`}>
            <time>{formatTime(event.occurredAt)}</time>
            <code>{eventNames[event.status]}</code>
            <span>#{orderId.slice(0, 8).toUpperCase()}</span>
          </div>
        ))}
      </div>
      <p className="panel-note">This stream is populated from persisted order history plus the backend SSE event named <code>order-status</code>.</p>
    </section>
  );
}

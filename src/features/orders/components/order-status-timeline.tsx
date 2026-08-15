import { Check, Circle, X } from "lucide-react";
import { formatTime } from "@/shared/utils/format";
import type { OrderStatus, OrderStatusHistory } from "../types/order";

const successFlow: OrderStatus[] = ["CREATED", "PAYMENT_PROCESSING", "PAYMENT_APPROVED", "COMPLETED"];
const failedFlow: OrderStatus[] = ["CREATED", "PAYMENT_PROCESSING", "PAYMENT_FAILED"];

const labels: Record<OrderStatus, string> = {
  CREATED: "Order created",
  PAYMENT_PROCESSING: "Payment processing",
  PAYMENT_APPROVED: "Payment approved",
  PAYMENT_FAILED: "Payment failed",
  COMPLETED: "Order completed",
};

export function OrderStatusTimeline({ currentStatus, events }: { currentStatus: OrderStatus; events: OrderStatusHistory[] }) {
  const flow = currentStatus === "PAYMENT_FAILED" ? failedFlow : successFlow;
  const reached = new Set(events.map((event) => event.status));
  reached.add(currentStatus);

  return (
    <div className="timeline">
      {flow.map((status, index) => {
        const item = [...events].reverse().find((event) => event.status === status);
        const done = reached.has(status);
        const failed = status === "PAYMENT_FAILED" && done;
        return (
          <div className={`timeline-item ${done ? "done" : "pending"} ${failed ? "failed" : ""}`} key={status}>
            <div className="timeline-marker">
              {failed ? <X size={15} /> : done ? <Check size={15} /> : <Circle size={10} />}
            </div>
            {index < flow.length - 1 && <div className="timeline-line" />}
            <div className="timeline-copy">
              <strong>{labels[status]}</strong>
              <span>{item ? formatTime(item.occurredAt) : "Waiting..."}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

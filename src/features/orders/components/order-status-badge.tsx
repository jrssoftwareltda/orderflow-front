import type { OrderStatus } from "../types/order";

const labels: Record<OrderStatus, string> = {
  CREATED: "Created",
  PAYMENT_PROCESSING: "Payment processing",
  PAYMENT_APPROVED: "Payment approved",
  PAYMENT_FAILED: "Payment failed",
  COMPLETED: "Completed",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{labels[status]}</span>;
}

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime, shortId } from "@/shared/utils/format";
import type { Order } from "../types/order";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/orders/${order.id}`} className="order-card">
      <div>
        <span className="order-id">#{shortId(order.id)}</span>
        <h3>{order.productName}</h3>
        <p>{order.customerName} · Qty {order.quantity}</p>
      </div>
      <div className="order-card-right">
        <strong>{formatCurrency(order.total)}</strong>
        <OrderStatusBadge status={order.status} />
        <small>{formatDateTime(order.createdAt)}</small>
      </div>
      <ArrowRight className="order-card-arrow" size={18} />
    </Link>
  );
}

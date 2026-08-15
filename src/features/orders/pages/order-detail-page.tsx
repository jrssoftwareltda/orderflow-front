import { ArrowLeft, Box, CalendarClock, Hash, User } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { PageError, PageLoading } from "@/shared/components/page-state";
import { formatCurrency, formatDateTime, shortId } from "@/shared/utils/format";
import { EventStream } from "../components/event-stream";
import { OrderStatusBadge } from "../components/order-status-badge";
import { OrderStatusTimeline } from "../components/order-status-timeline";
import { useOrderEvents } from "../hooks/use-order-events";
import { useOrder, useOrderHistory } from "../hooks/use-orders";

export function OrderDetailPage() {
  const { orderId = "" } = useParams();
  const orderQuery = useOrder(orderId);
  const historyQuery = useOrderHistory(orderId);
  const live = useOrderEvents(orderId, historyQuery.data ?? []);

  if (orderQuery.isLoading) return <PageLoading label="Loading order..." />;
  if (orderQuery.isError) return <PageError title="Order unavailable" message={orderQuery.error.message} onRetry={() => void orderQuery.refetch()} />;
  if (!orderQuery.data) return <PageError title="Order unavailable" message="The backend returned no order data." />;

  const order = orderQuery.data;

  return (
    <div className="page-stack">
      <Link to="/orders" className="back-link"><ArrowLeft size={16} /> Back to orders</Link>

      <section className="order-detail-heading">
        <div><span className="eyebrow">Live order workflow</span><h1>Order #{shortId(order.id)}</h1><p>{order.productName}</p></div>
        <OrderStatusBadge status={order.status} />
      </section>

      <section className="summary-grid">
        <Summary icon={<User size={18} />} label="Customer" value={order.customerName} />
        <Summary icon={<Box size={18} />} label="Product / quantity" value={`${order.productName} × ${order.quantity}`} />
        <Summary icon={<Hash size={18} />} label="Total" value={formatCurrency(order.total)} />
        <Summary icon={<CalendarClock size={18} />} label="Created" value={formatDateTime(order.createdAt)} />
      </section>

      <section className="panel">
        <div className="panel-header"><div><span className="eyebrow">Processing timeline</span><h2>Asynchronous state changes</h2></div></div>
        {historyQuery.isError && <p className="inline-warning">History could not be loaded: {historyQuery.error.message}. Live SSE events will still appear below.</p>}
        <OrderStatusTimeline currentStatus={order.status} events={live.events} />
      </section>

      <EventStream events={live.events} connectionState={live.connectionState} orderId={order.id} />
    </div>
  );
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <article className="summary-card"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>;
}

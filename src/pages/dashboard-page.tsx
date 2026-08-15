import { AlertTriangle, CheckCircle2, Clock3, Plus, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { OrderCard } from "@/features/orders/components/order-card";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { PageError, PageLoading } from "@/shared/components/page-state";

export function DashboardPage() {
  const ordersQuery = useOrders();

  if (ordersQuery.isLoading) return <PageLoading label="Loading OrderFlow dashboard..." />;
  if (ordersQuery.isError) return <PageError message={ordersQuery.error.message} onRetry={() => void ordersQuery.refetch()} />;

  const orders = ordersQuery.data ?? [];
  const completed = orders.filter((order) => order.status === "COMPLETED").length;
  const failed = orders.filter((order) => order.status === "PAYMENT_FAILED").length;
  const processing = orders.filter((order) => ["CREATED", "PAYMENT_PROCESSING", "PAYMENT_APPROVED"].includes(order.status)).length;
  const recent = orders.slice(0, 5);

  return (
    <div className="page-stack">
      <section className="hero-row">
        <div>
          <span className="eyebrow">Event-driven architecture demo</span>
          <h1>Order processing, visible end to end.</h1>
          <p>Create an order through the API Gateway and watch Kafka-driven payment processing update the UI in real time via SSE.</p>
        </div>
        <Link to="/orders/new" className="button primary"><Plus size={18} /> New order</Link>
      </section>

      <section className="metric-grid">
        <Metric icon={<ShoppingBag size={20} />} label="Total orders" value={orders.length} />
        <Metric icon={<CheckCircle2 size={20} />} label="Completed" value={completed} />
        <Metric icon={<Clock3 size={20} />} label="Processing" value={processing} />
        <Metric icon={<AlertTriangle size={20} />} label="Failed" value={failed} />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div><span className="eyebrow">Latest activity</span><h2>Recent orders</h2></div>
          <Link to="/orders" className="text-link">View all</Link>
        </div>
        <div className="order-list">
          {recent.length === 0 ? (
            <div className="empty-state"><ShoppingBag size={30} /><h3>No orders yet</h3><p>Create the first order to start the Kafka workflow.</p><Link to="/orders/new" className="button primary">Create order</Link></div>
          ) : recent.map((order) => <OrderCard order={order} key={order.id} />)}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <article className="metric-card"><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>;
}

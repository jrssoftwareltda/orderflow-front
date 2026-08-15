import { Plus, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageError, PageLoading } from "@/shared/components/page-state";
import { formatCurrency, formatDateTime, shortId } from "@/shared/utils/format";
import { OrderStatusBadge } from "../components/order-status-badge";
import { useOrders } from "../hooks/use-orders";
import type { OrderStatus } from "../types/order";

export function OrdersPage() {
  const ordersQuery = useOrders();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");

  const orders = ordersQuery.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesTerm = !term || [order.id, order.customerName, order.productName].some((value) => value.toLowerCase().includes(term));
      const matchesStatus = status === "ALL" || order.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [orders, search, status]);

  if (ordersQuery.isLoading) return <PageLoading label="Loading orders..." />;
  if (ordersQuery.isError) return <PageError message={ordersQuery.error.message} onRetry={() => void ordersQuery.refetch()} />;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">Order management</span><h1>Orders</h1><p>Inspect the current state of every asynchronous order workflow.</p></div>
        <Link to="/orders/new" className="button primary"><Plus size={18} /> Create order</Link>
      </section>

      <section className="panel">
        <div className="filters-row">
          <label className="search-box"><Search size={17} /><input placeholder="Search by id, customer or product" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value as "ALL" | OrderStatus)}>
            <option value="ALL">All statuses</option>
            <option value="CREATED">Created</option>
            <option value="PAYMENT_PROCESSING">Payment processing</option>
            <option value="PAYMENT_APPROVED">Payment approved</option>
            <option value="PAYMENT_FAILED">Payment failed</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><ShoppingBag size={30} /><h3>No matching orders</h3><p>Try another filter or create a new order.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                    <td><b>#{shortId(order.id)}</b></td>
                    <td>{order.customerName}</td>
                    <td>{order.productName}<small>Qty {order.quantity}</small></td>
                    <td>{formatCurrency(order.total)}</td>
                    <td><OrderStatusBadge status={order.status} /></td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

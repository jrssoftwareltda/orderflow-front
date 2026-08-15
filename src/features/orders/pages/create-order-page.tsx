import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/shared/api/http-client";
import { logger } from "@/shared/logging/logger";
import { OrderForm } from "../components/order-form";
import { useCreateOrder } from "../hooks/use-orders";
import type { CreateOrderRequest } from "../types/order";

export function CreateOrderPage() {
  const navigate = useNavigate();
  const mutation = useCreateOrder();

  const submit = (request: CreateOrderRequest) => {
    logger.info("orders", "Create order submitted from UI", {
      customerName: request.customerName,
      productName: request.productName,
      quantity: request.quantity,
      total: request.quantity * request.unitPrice,
    });
    mutation.mutate(request, {
      onSuccess: (order) => {
        logger.info("orders", "Order created; navigating to live details", { orderId: order.id, status: order.status });
        navigate(`/orders/${order.id}`);
      },
    });
  };

  const error = mutation.error instanceof ApiError
    ? `${mutation.error.message}${mutation.error.correlationId ? ` · correlation ${mutation.error.correlationId}` : ""}`
    : mutation.error?.message;

  return (
    <div className="page-stack narrow-page">
      <section className="page-heading">
        <div><span className="eyebrow">Start the workflow</span><h1>Create order</h1><p>The order is persisted first, then the backend publishes the event through its transactional outbox.</p></div>
        <Link to="/orders" className="button secondary">Cancel</Link>
      </section>

      <div className="create-layout">
        <section className="panel"><OrderForm submitting={mutation.isPending} error={error} onSubmit={submit} /></section>
        <aside className="panel demo-scenarios">
          <span className="eyebrow">Demo scenarios</span><h2>Trigger each backend path</h2>
          <div className="scenario success"><CheckCircle2 size={18} /><div><strong>Approved payment</strong><span>Total ≤ R$ 10,000</span></div></div>
          <div className="scenario failure"><AlertTriangle size={18} /><div><strong>Failed payment</strong><span>Total &gt; R$ 10,000</span></div></div>
          <div className="scenario retry"><RotateCcw size={18} /><div><strong>Retry + DLT</strong><span>Use product name exactly <code>ERROR</code></span></div></div>
          <p className="panel-note">Use these deterministic scenarios while presenting Kafka retries, DLT and eventual consistency.</p>
        </aside>
      </div>
    </div>
  );
}

import { LoaderCircle, Play } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { CreateOrderRequest } from "../types/order";
import { formatCurrency } from "@/shared/utils/format";

interface Props {
  submitting: boolean;
  error?: string;
  onSubmit: (request: CreateOrderRequest) => void;
}

export function OrderForm({ submitting, error, onSubmit }: Props) {
  const [customerName, setCustomerName] = useState("Josivan");
  const [productName, setProductName] = useState("Mechanical Keyboard");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(5000);
  const total = useMemo(() => Math.max(quantity, 0) * Math.max(unitPrice, 0), [quantity, unitPrice]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!customerName.trim() || !productName.trim() || quantity <= 0 || unitPrice <= 0) return;
    onSubmit({ customerName: customerName.trim(), productName: productName.trim(), quantity, unitPrice });
  };

  return (
    <form className="order-form" onSubmit={submit}>
      <label>
        <span>Customer</span>
        <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required maxLength={150} />
      </label>
      <label>
        <span>Product</span>
        <input value={productName} onChange={(event) => setProductName(event.target.value)} required maxLength={200} />
      </label>
      <div className="form-grid">
        <label>
          <span>Quantity</span>
          <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required />
        </label>
        <label>
          <span>Unit price</span>
          <input type="number" min="0.01" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value))} required />
        </label>
      </div>
      <div className="form-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
      {error && <div className="form-error">{error}</div>}
      <button className="button primary large" disabled={submitting} type="submit">
        {submitting ? <><LoaderCircle className="spin" size={18} /> Creating...</> : <><Play size={18} /> Create and process order</>}
      </button>
    </form>
  );
}

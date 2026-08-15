export type OrderStatus =
  | "CREATED"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_APPROVED"
  | "PAYMENT_FAILED"
  | "COMPLETED";

export interface Order {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  occurredAt: string;
}

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  occurredAt: string;
}

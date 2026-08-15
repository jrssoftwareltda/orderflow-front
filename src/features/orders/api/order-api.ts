import { http } from "@/shared/api/http-client";
import type { CreateOrderRequest, Order, OrderStatusHistory } from "../types/order";

export const orderApi = {
  list(): Promise<Order[]> {
    return http<Order[]>("/api/orders");
  },

  get(orderId: string): Promise<Order> {
    return http<Order>(`/api/orders/${orderId}`);
  },

  history(orderId: string): Promise<OrderStatusHistory[]> {
    return http<OrderStatusHistory[]>(`/api/orders/${orderId}/history`);
  },

  create(request: CreateOrderRequest): Promise<Order> {
    return http<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(request),
      timeoutMs: 20_000,
    });
  },
};

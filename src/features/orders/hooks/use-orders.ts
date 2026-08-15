import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/order-api";
import type { CreateOrderRequest } from "../types/order";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.list,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => orderApi.get(orderId),
    enabled: Boolean(orderId),
  });
}

export function useOrderHistory(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId, "history"],
    queryFn: () => orderApi.history(orderId),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["orders", "create"],
    mutationFn: (request: CreateOrderRequest) => orderApi.create(request),
    onSuccess: (order) => {
      queryClient.setQueryData(["orders", order.id], order);
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

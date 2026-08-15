import { Navigate, Route, Routes } from "react-router-dom";
import { CreateOrderPage } from "@/features/orders/pages/create-order-page";
import { OrderDetailPage } from "@/features/orders/pages/order-detail-page";
import { OrdersPage } from "@/features/orders/pages/orders-page";
import { DashboardPage } from "@/pages/dashboard-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/new" element={<CreateOrderPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

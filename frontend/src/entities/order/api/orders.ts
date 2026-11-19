import { api } from "@/shared/api";
import type { CreateOrderInput, Order } from "../model/types";

export function createOrder(data: CreateOrderInput) {
  return api.post<Order>("/orders", data);
}

export function getMyOrders() {
  return api.get<Order[]>("/orders/mine");
}

export function getAvailableOrders() {
  return api.get<Order[]>("/orders/available");
}

export function acceptOrder(orderId: number) {
  return api.post<Order>(`/orders/${orderId}/accept`);
}

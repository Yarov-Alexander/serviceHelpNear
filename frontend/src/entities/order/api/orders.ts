import { api } from "@/shared/api";
import type { CreateOrderInput, Order } from "../model/types";

export function createOrder(data: CreateOrderInput) {
  return api.post<Order>("/orders", data);
}

export function getMyOrders() {
  return api.get<Order[]>("/orders/mine");
}

export function getAvailableOrders(options: {
  limit?: number;
  offset?: number;
  city?: string;
} = {}) {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.offset !== undefined) params.set("offset", String(options.offset));
  if (options.city) params.set("city", options.city);
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return api.get<Order[]>(`/orders/available${query}`);
}

export function acceptOrder(orderId: number) {
  return api.post<Order>(`/orders/${orderId}/accept`);
}

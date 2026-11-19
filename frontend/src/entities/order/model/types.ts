export type OrderStatus = "open" | "assigned";

export interface Order {
  id: number;
  customer_id: number;
  executor_id: number | null;
  task: string;
  price: number;
  city: string;
  status: OrderStatus;
  created_at: string;
}

export interface CreateOrderInput {
  task: string;
  price: number;
  city: string;
}

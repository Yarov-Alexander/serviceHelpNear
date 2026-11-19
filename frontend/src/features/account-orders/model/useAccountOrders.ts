import { useCallback, useEffect, useState } from "react";
import {
  acceptOrder as acceptOrderRequest,
  createOrder as createOrderRequest,
  getAvailableOrders,
  getMyOrders,
  type CreateOrderInput,
  type Order,
} from "@/entities/order";
import type { UserRole } from "@/entities/user";

export function useAccountOrders(role: UserRole | null, userId: number | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!role || userId === null) {
      setOrders([]);
      setAvailableOrders([]);
      setError("");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const [myOrders, openOrders] = await Promise.all([
          getMyOrders(),
          role === "executor" ? getAvailableOrders() : Promise.resolve([]),
        ]);
        if (!active) return;
        setOrders(myOrders);
        setAvailableOrders(openOrders);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Не удалось загрузить заявки.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [reloadKey, role, userId]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const create = useCallback(async (input: CreateOrderInput) => {
    const created = await createOrderRequest(input);
    setOrders((current) => [created, ...current]);
    return created;
  }, []);

  const accept = useCallback(async (orderId: number) => {
    const accepted = await acceptOrderRequest(orderId);
    setAvailableOrders((current) => current.filter((order) => order.id !== orderId));
    setOrders((current) => [accepted, ...current]);
    return accepted;
  }, []);

  return { orders, availableOrders, loading, error, create, accept, reload };
}

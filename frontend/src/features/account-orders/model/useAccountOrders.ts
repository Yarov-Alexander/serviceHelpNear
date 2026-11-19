import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptOrder as acceptOrderRequest,
  createOrder as createOrderRequest,
  getAvailableOrders,
  getMyOrders,
  type CreateOrderInput,
  type Order,
} from "@/entities/order";
import type { UserRole } from "@/entities/user";

const AVAILABLE_ORDERS_PAGE_SIZE = 20;

export function useAccountOrders(role: UserRole | null, userId: number | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [availableCity, setAvailableCity] = useState("");
  const [availableHasMore, setAvailableHasMore] = useState(false);
  const [loadingMoreAvailable, setLoadingMoreAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const availableQueryRef = useRef(0);

  useEffect(() => {
    const queryId = ++availableQueryRef.current;
    let active = true;
    if (!role || userId === null) {
      setOrders([]);
      setAvailableOrders([]);
      setAvailableHasMore(false);
      setLoadingMoreAvailable(false);
      setError("");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");
    setAvailableOrders([]);
    setAvailableHasMore(false);
    setLoadingMoreAvailable(false);

    const load = async () => {
      try {
        const [myOrders, openOrders] = await Promise.all([
          getMyOrders(),
          role === "executor"
            ? getAvailableOrders({
                limit: AVAILABLE_ORDERS_PAGE_SIZE,
                city: availableCity || undefined,
              })
            : Promise.resolve([]),
        ]);
        if (!active) return;
        setOrders(myOrders);
        setAvailableOrders(openOrders);
        setAvailableHasMore(openOrders.length === AVAILABLE_ORDERS_PAGE_SIZE);
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
  }, [availableCity, reloadKey, role, userId]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const searchAvailableCity = useCallback((city: string) => {
    setAvailableCity(city.trim());
  }, []);

  const loadMoreAvailable = useCallback(async () => {
    if (loadingMoreAvailable || !availableHasMore) return;
    const queryId = availableQueryRef.current;
    setLoadingMoreAvailable(true);
    setError("");
    try {
      const nextOrders = await getAvailableOrders({
        limit: AVAILABLE_ORDERS_PAGE_SIZE,
        offset: availableOrders.length,
        city: availableCity || undefined,
      });
      if (queryId !== availableQueryRef.current) return;
      setAvailableOrders((current) => [...current, ...nextOrders]);
      setAvailableHasMore(nextOrders.length === AVAILABLE_ORDERS_PAGE_SIZE);
    } catch (requestError) {
      if (queryId !== availableQueryRef.current) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить следующие заявки.",
      );
    } finally {
      if (queryId === availableQueryRef.current) setLoadingMoreAvailable(false);
    }
  }, [availableCity, availableHasMore, availableOrders.length, loadingMoreAvailable]);

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

  return {
    orders,
    availableOrders,
    loading,
    error,
    create,
    accept,
    reload,
    searchAvailableCity,
    loadMoreAvailable,
    availableHasMore,
    loadingMoreAvailable,
  };
}

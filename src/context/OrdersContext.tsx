import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { apiRequest } from "../config/api";
import { useAuth } from "./AuthContext";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  type: "Dine-in" | "Takeaway";
  tableNumber?: string;
  pickupTime?: string;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
  timestamp: string;
};

type AddOrderInput = {
  items: OrderItem[];
  total: number;
  type: "Dine-in" | "Takeaway";
  tableNumber?: string;
  pickupTime?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  discount?: number;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: AddOrderInput) => Promise<string>;
  updateStatus: (id: string, status: Order["status"]) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const formatOrder = (order: any): Order => ({
  id: String(order._id),
  items: Array.isArray(order.items)
    ? order.items.map((item: any) => ({
        id: String(item.menuItem?._id || item.menuItem),
        name: String(item.menuItem?.name || "Menu Item"),
        price: Number(item.price || item.menuItem?.price || 0),
        quantity: Number(item.quantity || 0),
      }))
    : [],
  total: Number(order.total || 0),
  type: order.orderType,
  tableNumber:
    order.tableNumber !== undefined ? String(order.tableNumber) : undefined,
  status: order.status,
  timestamp: order.createdAt || new Date().toISOString(),
});

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      return;
    }

    try {
      const data = await apiRequest("/orders", {}, token);

      const formattedOrders = Array.isArray(data) ? data.map(formatOrder) : [];

      setOrders(formattedOrders);
    } catch (error: any) {
      console.log("Orders fetch error:", error?.message);
    }
  }, [token]);

  useEffect(() => {
    refreshOrders();

    if (!token) {
      return;
    }

    const interval = setInterval(() => {
      refreshOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [token, refreshOrders]);

  const addOrder = useCallback(
    async (order: AddOrderInput) => {
      if (!token) {
        throw new Error("Please login first.");
      }

      const notes = order.items
        .map((item) => item.note?.trim())
        .filter(Boolean)
        .join("; ");

      const data = await apiRequest(
        "/orders",
        {
          method: "POST",
          body: JSON.stringify({
            items: order.items.map((item) => ({
              menuItem: item.id,
              quantity: item.quantity,
            })),
            orderType: order.type,
            ...(order.type === "Dine-in"
              ? { tableNumber: Number(order.tableNumber) }
              : {}),
            notes,
            discount: Number(order.discount || 0),
          }),
        },
        token,
      );

      await refreshOrders();

      return String(data.order._id);
    },
    [token, refreshOrders],
  );

  const updateStatus = useCallback(
    async (id: string, status: Order["status"]) => {
      if (!token) {
        throw new Error("Please login first.");
      }

      if (status === "Cancelled") {
        await apiRequest(
          `/orders/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          },
          token,
        );
      } else {
        await apiRequest(
          `/orders/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          },
          token,
        );
      }

      await refreshOrders();
    },
    [token, refreshOrders],
  );

  const cancelOrder = useCallback(
    async (id: string) => {
      await updateStatus(id, "Cancelled");
    },
    [updateStatus],
  );

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  const value = useMemo(
    () => ({
      orders,
      addOrder,
      updateStatus,
      cancelOrder,
      refreshOrders,
      clearOrders,
    }),
    [orders, addOrder, updateStatus, cancelOrder, refreshOrders, clearOrders],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error("useOrders must be used inside an OrdersProvider");
  }

  return context;
}

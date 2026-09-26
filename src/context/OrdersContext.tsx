import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  ReactNode,
} from "react";

import ordersReducer, { initialState } from "../reducers/ordersReducer";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  type: "Dine-in" | "Takeaway";
  tableNumber?: string;
  pickupTime?: string;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
  timestamp: string;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "status" | "timestamp">) => string;
  updateStatus: (id: string, status: Order["status"]) => void;
  cancelOrder: (id: string) => void;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  const addOrder = useCallback(
    (order: Omit<Order, "id" | "status" | "timestamp">) => {
      const id = `ORD-${Date.now()}`;

      dispatch({
        type: "ADD_ORDER",
        payload: {
          ...order,
          id,
          status: "Pending",
          timestamp: new Date().toISOString(),
        },
      });

      return id;
    },
    [],
  );

  const updateStatus = useCallback((id: string, status: Order["status"]) => {
    dispatch({
      type: "UPDATE_STATUS",
      payload: {
        id,
        status,
      },
    });
  }, []);

  const cancelOrder = useCallback((id: string) => {
    dispatch({
      type: "CANCEL_ORDER",
      payload: id,
    });
  }, []);

  const clearOrders = useCallback(() => {
    dispatch({
      type: "CLEAR_ORDERS",
    });
  }, []);

  const value = useMemo(
    () => ({
      orders: state.orders,
      addOrder,
      updateStatus,
      cancelOrder,
      clearOrders,
    }),
    [state.orders, addOrder, updateStatus, cancelOrder, clearOrders],
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

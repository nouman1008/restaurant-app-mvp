import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  ReactNode,
} from "react";
import cartReducer, { initialState } from "../reducers/cartReducer";
type CartItem = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image: string;
  category?: string;
  quantity: number;
  note: string;
};
type CartContextType = {
  items: CartItem[];
  promoCode: string;
  discountPercent: number;
  promoError: string;
  addToCart: (item: any) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  clearCart: () => void;
  applyPromo: (code: string) => void;
  removePromo: () => void;
};
const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const value = useMemo(
    () => ({
      items: state.items,
      promoCode: state.promoCode,
      discountPercent: state.discountPercent,
      promoError: state.promoError,
      addToCart: (item: any) => {
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: item.id || item.name.toLowerCase().replace(/\s+/g, "-"),
            name: item.name,
            price: Number(item.price),
            emoji: item.emoji || "🍽️",
            image: item.image || "",
            category: item.category || "",
          },
        });
      },
      increase: (id: string) => {
        dispatch({ type: "INCREMENT", payload: id });
      },
      decrease: (id: string) => {
        dispatch({ type: "DECREMENT", payload: id });
      },
      remove: (id: string) => {
        dispatch({ type: "REMOVE_ITEM", payload: id });
      },
      updateNote: (id: string, note: string) => {
        dispatch({ type: "UPDATE_NOTE", payload: { id, note } });
      },
      clearCart: () => {
        dispatch({ type: "CLEAR_CART" });
      },
      applyPromo: (code: string) => {
        dispatch({ type: "APPLY_PROMO", payload: code.trim().toUpperCase() });
      },
      removePromo: () => {
        dispatch({ type: "REMOVE_PROMO" });
      },
    }),
    [state],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}

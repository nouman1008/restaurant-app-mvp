import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import initialMenuItems from "../data/menu";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isSpecial: boolean;
  isAvailable: boolean;
};

type MenuContextType = {
  menuItems: MenuItem[];
  updateMenuItem: (id: string, changes: Partial<MenuItem>) => void;
  toggleAvailability: (id: string) => void;
  toggleSpecial: (id: string) => void;
  resetMenu: () => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);

  const updateMenuItem = useCallback(
    (id: string, changes: Partial<MenuItem>) => {
      setMenuItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...changes,
              }
            : item,
        ),
      );
    },
    [],
  );

  const toggleAvailability = useCallback((id: string) => {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isAvailable: !item.isAvailable,
            }
          : item,
      ),
    );
  }, []);

  const toggleSpecial = useCallback((id: string) => {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              isSpecial: !item.isSpecial,
            }
          : item,
      ),
    );
  }, []);

  const resetMenu = useCallback(() => {
    setMenuItems(initialMenuItems);
  }, []);

  const value = useMemo(
    () => ({
      menuItems,
      updateMenuItem,
      toggleAvailability,
      toggleSpecial,
      resetMenu,
    }),
    [menuItems, updateMenuItem, toggleAvailability, toggleSpecial, resetMenu],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used inside a MenuProvider");
  }

  return context;
}

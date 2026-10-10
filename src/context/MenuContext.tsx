import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

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

const API_URL = "http://192.168.1.111:5000/api/menu";
export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchMenu = useCallback(async () => {
    try {
      console.log("1. Fetching:", API_URL);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log("2. Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      console.log("3. Data received:", data.length);

      const formattedMenu: MenuItem[] = data.map((item: any) => ({
        id: String(item._id),
        name: String(item.name || ""),
        description: String(item.description || ""),
        price: Number(item.price) || 0,
        category: String(item.category || ""),
        image: typeof item.image === "string" ? item.image : "",
        isSpecial: item.isSpecial === true,
        isAvailable: item.isAvailable !== false,
      }));

      console.log("4. Formatted items:", formattedMenu.length);
      console.log("5. FIRST IMAGE:", formattedMenu[0]?.image);

      setMenuItems(formattedMenu);
    } catch (error: any) {
      console.log("5. MENU ERROR:", error?.name, error?.message);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

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
    fetchMenu();
  }, [fetchMenu]);

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

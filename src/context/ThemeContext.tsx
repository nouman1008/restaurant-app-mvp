import React, { createContext, useContext, useState, ReactNode } from "react";

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  primary: string;
  border: string;
  muted: string;
  accent: string;
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const lightColors: ThemeColors = {
  background: "#F7F7F7",
  card: "#FFFFFF",
  text: "#333333",
  secondaryText: "#777777",
  primary: "#E85D04",
  border: "#EEEEEE",
  muted: "#777777",
  accent: "#E85D04",
};

const darkColors: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  secondaryText: "#BBBBBB",
  primary: "#FF7A00",
  border: "#333333",
  muted: "#AAAAAA",
  accent: "#FF7A00",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((current) => !current);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  return context;
}

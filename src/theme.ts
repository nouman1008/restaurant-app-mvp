export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  primary: string;
  border: string;
  muted: string;
  accent: string;
};

export const lightColors: ThemeColors = {
  background: "#F7F7F7",
  card: "#FFFFFF",
  text: "#333333",
  secondaryText: "#777777",
  primary: "#E85D04",
  border: "#EEEEEE",
  muted: "#777777",
  accent: "#E85D04",
};

export const darkColors: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  secondaryText: "#BBBBBB",
  primary: "#FF7A00",
  border: "#333333",
  muted: "#AAAAAA",
  accent: "#FF7A00",
};

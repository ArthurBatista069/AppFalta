import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

const lightColors = {
  background: "#F5F6FA",
  card: "#FFFFFF",
  cardBorder: "#E4E4E9",
  inputBackground: "#F5F6FA",
  text: "#1A1A1A",
  textSecondary: "#4A4A4A",
  textMuted: "#8E8E93",
  primary: "#3D5AFE",
  primaryDisabled: "#B0B7F5",
  success: "#43A047",
  warning: "#FB8C00",
  danger: "#E53935",
  dangerBg: "#FDECEA",
  progressBg: "#EEEEF2",
  icon: "#1A1A1A",
  statusBar: "dark",
};

const darkColors = {
  background: "#121214",
  card: "#1E1E22",
  cardBorder: "#2E2E33",
  inputBackground: "#2A2A2E",
  text: "#F2F2F3",
  textSecondary: "#C7C7CC",
  textMuted: "#8E8E93",
  primary: "#5C74FF",
  primaryDisabled: "#3A3F63",
  success: "#5CB85C",
  warning: "#FFA733",
  danger: "#FF5C57",
  dangerBg: "#3A1F1F",
  progressBg: "#2E2E33",
  icon: "#F2F2F3",
  statusBar: "light",
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const sistemaTema = useColorScheme();
  const [modoEscuro, setModoEscuro] = useState(sistemaTema === "dark");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    carregarPreferencia();
  }, []);

  const carregarPreferencia = async () => {
    try {
      const salvo = await AsyncStorage.getItem("modoEscuro");
      if (salvo !== null) {
        setModoEscuro(JSON.parse(salvo));
      }
    } catch (e) {
      // se falhar, mantém o padrão do sistema
    } finally {
      setCarregado(true);
    }
  };

  const alternarTema = async () => {
    const novoValor = !modoEscuro;
    setModoEscuro(novoValor);
    await AsyncStorage.setItem("modoEscuro", JSON.stringify(novoValor));
  };

  const colors = modoEscuro ? darkColors : lightColors;

  if (!carregado) return null; // evita "flash" de tema errado ao abrir

  return (
    <ThemeContext.Provider value={{ colors, modoEscuro, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
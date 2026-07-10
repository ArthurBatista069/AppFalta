import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import AddSubjectScreen from "./screens/AddSubjectScreen";
import DetailsScreen from "./screens/DetailsScreen";

const Stack = createNativeStackNavigator();

function AppContent() {
  const [subjects, setSubjects] = useState([]);
  const { colors, modoEscuro } = useTheme();

  useEffect(() => {
    carregarMaterias();
  }, []);

  useEffect(() => {
    salvarMaterias();
  }, [subjects]);

  const carregarMaterias = async () => {
    const dados = await AsyncStorage.getItem("subjects");
    if (dados) {
      setSubjects(JSON.parse(dados));
    }
  };

  const salvarMaterias = async () => {
    await AsyncStorage.setItem("subjects", JSON.stringify(subjects));
  };

  const navTheme = {
    ...(modoEscuro ? DarkTheme : DefaultTheme),
    colors: {
      ...(modoEscuro ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={colors.statusBar} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              route={{ params: { subjects, setSubjects } }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Adicionar" component={AddSubjectScreen} />
        <Stack.Screen name="Detalhes" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
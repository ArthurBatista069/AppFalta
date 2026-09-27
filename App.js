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
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const { colors, modoEscuro } = useTheme();

  useEffect(() => {
    let ativo = true;

    const carregarMaterias = async () => {
      try {
        const dados = await AsyncStorage.getItem("subjects");
        if (dados) {
          const materiasSalvas = JSON.parse(dados);
          if (ativo && Array.isArray(materiasSalvas)) {
            setSubjects(materiasSalvas);
          }
        }
      } catch (error) {
        console.warn("Não foi possível carregar as matérias salvas.", error);
      } finally {
        if (ativo) setSubjectsLoaded(true);
      }
    };

    carregarMaterias();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!subjectsLoaded) return;

    const salvarMaterias = async () => {
      try {
        await AsyncStorage.setItem("subjects", JSON.stringify(subjects));
      } catch (error) {
        console.warn("Não foi possível salvar as matérias.", error);
      }
    };

    salvarMaterias();
  }, [subjects, subjectsLoaded]);

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
      {subjectsLoaded ? (
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
          <Stack.Screen name="Detalhes">
            {(props) => (
              <DetailsScreen
                {...props}
                subjects={subjects}
                setSubjects={setSubjects}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      ) : null}
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

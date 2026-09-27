import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import HomeScreen from "./screens/HomeScreen";
import AddSubjectScreen from "./screens/AddSubjectScreen";
import DetailsScreen from "./screens/DetailsScreen";
import CalendarScreen from "./screens/CalendarScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MateriasStack({ subjects, setSubjects }) {
  return (
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
          <DetailsScreen {...props} subjects={subjects} setSubjects={setSubjects} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppContent() {
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const { colors, modoEscuro } = useTheme();

  useEffect(() => {
    let ativo = true;
    const carregarMaterias = async () => {
      try {
        const dados = await AsyncStorage.getItem("subjects");
        if (dados && ativo) {
          const materiasSalvas = JSON.parse(dados);
          const carregadas = Array.isArray(materiasSalvas) ? materiasSalvas.map((materia) => ({
            ...materia,
            avaliacoes: (Array.isArray(materia.avaliacoes) ? materia.avaliacoes : []).map((avaliacao) => ({
              ...avaliacao,
              titulo: avaliacao.titulo || avaliacao.nome || "Avaliação",
              tipo: avaliacao.tipo || "trabalho",
              nota: avaliacao.nota ?? null,
            })),
          })) : [];
          setSubjects(carregadas);
        }
      } catch (error) {
        console.warn("Não foi possível carregar as matérias salvas.", error);
      } finally {
        if (ativo) setSubjectsLoaded(true);
      }
    };
    carregarMaterias();
    return () => { ativo = false; };
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
      {subjectsLoaded ? <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.cardBorder,
          },
        }}
      >
        <Tab.Screen
          name="MateriasTab"
          options={{
            title: "Matérias",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        >
          {() => <MateriasStack subjects={subjects} setSubjects={setSubjects} />}
        </Tab.Screen>

        <Tab.Screen
          name="CalendarioTab"
          options={{
            title: "Calendário",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        >
          {(props) => (
            <CalendarScreen {...props} route={{ params: { subjects } }} />
          )}
        </Tab.Screen>
      </Tab.Navigator> : null}
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

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./screens/HomeScreen";
import AddSubjectScreen from "./screens/AddSubjectScreen";
import DetailsScreen from "./screens/DetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [subjects, setSubjects] = useState([]);

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
    await AsyncStorage.setItem(
      "subjects",
      JSON.stringify(subjects)
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              route={{ params: { subjects, setSubjects } }}
              
            />
            
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Adicionar"
          component={AddSubjectScreen}
        />

        <Stack.Screen
          name="Detalhes"
          component={DetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
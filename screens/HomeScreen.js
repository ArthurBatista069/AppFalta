import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);

  const loadSubjects = async () => {
    const data = await AsyncStorage.getItem("subjects");
    if (data) {
      setSubjects(JSON.parse(data));
    } else {
      setSubjects([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Adicionar")}
        style={{ marginBottom: 20 }}
      >
        <Text style={{ fontSize: 18 }}>+ Adicionar Matéria</Text>
      </TouchableOpacity>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text>Nenhuma matéria cadastrada ainda.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Detalhes", { subject: item })
            }
            style={{ marginBottom: 15 }}
          >
            <Text style={{ fontSize: 18 }}>{item.nome}</Text>
            <Text>Faltas: {item.faltas} / {item.limiteFaltas}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
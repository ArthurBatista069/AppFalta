import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddSubjectScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [limiteFaltas, setLimiteFaltas] = useState("");

  const saveSubject = async () => {
    if (!nome || !limiteFaltas) return;

    const newSubject = {
      id: Date.now().toString(),
      nome,
      limiteFaltas: Number(limiteFaltas),
      faltas: 0,
    };

    const data = await AsyncStorage.getItem("subjects");
    const subjects = data ? JSON.parse(data) : [];

    subjects.push(newSubject);

    await AsyncStorage.setItem("subjects", JSON.stringify(subjects));

    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Nome da matéria"
        value={nome}
        onChangeText={setNome}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Quantas faltas posso ter? (ex: 18)"
        value={limiteFaltas}
        onChangeText={setLimiteFaltas}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Button title="Salvar" onPress={saveSubject} />
    </View>
  );
}
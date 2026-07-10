import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function AddSubjectScreen({ navigation, route }) {
  const { subjects, setSubjects } = route.params;

  const [nome, setNome] = useState("");
  const [maxFaltas, setMaxFaltas] = useState("");

  const adicionarMateria = () => {
    if (!nome || !maxFaltas) return;

    const novaMateria = {
      id: Date.now().toString(),
      nome,
      maxFaltas: parseInt(maxFaltas),
      faltas: [],
    };

    setSubjects([...subjects, novaMateria]);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Nome da Matéria</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
      />

      <Text>Quantas faltas você pode ter?</Text>
      <TextInput
        value={maxFaltas}
        onChangeText={setMaxFaltas}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
         
      />

      <TouchableOpacity
        onPress={adicionarMateria}
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "black" }}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}
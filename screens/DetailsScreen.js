import React, { useState } from "react";
import { View, Text, Button, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DetailsScreen({ route, navigation }) {
  const { subject } = route.params;
  const [faltas, setFaltas] = useState(subject.faltas);
  const [faltasRecebidas, setFaltasRecebidas] = useState("");

  const addFalta = async () => {
    if (!faltasRecebidas) return;

    const quantidade = Number(faltasRecebidas);

    const data = await AsyncStorage.getItem("subjects");
    let subjects = JSON.parse(data);

    subjects = subjects.map((s) =>
      s.id === subject.id ? { ...s, faltas: s.faltas + quantidade } : s
    );

    await AsyncStorage.setItem("subjects", JSON.stringify(subjects));

    const novoTotal = faltas + quantidade;
    setFaltas(novoTotal);
    setFaltasRecebidas("");

    if (novoTotal >= subject.limiteFaltas) {
      Alert.alert("⚠️ Atenção", "Você atingiu o limite de faltas!");
    }
  };

  const removerMateria = async () => {
    const data = await AsyncStorage.getItem("subjects");
    let subjects = JSON.parse(data);

    subjects = subjects.filter((s) => s.id !== subject.id);

    await AsyncStorage.setItem("subjects", JSON.stringify(subjects));

    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>{subject.nome}</Text>

      <Text style={{ marginTop: 10 }}>
        Limite de Faltas: {subject.limiteFaltas}
      </Text>

      <Text>Faltas atuais: {faltas}</Text>

      <TextInput
        placeholder="Quantas faltas recebi hoje?"
        value={faltasRecebidas}
        onChangeText={setFaltasRecebidas}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginVertical: 10, padding: 8 }}
      />

      <Button title="Adicionar falta" onPress={addFalta} />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Remover matéria"
          color="red"
          onPress={removerMateria}
        />
      </View>
    </View>
  );
}
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetailsScreen({ route, navigation }) {
  const { subject, subjects, setSubjects } = route.params;

  const [quantidadeFalta, setQuantidadeFalta] = useState("");
  const [explicacao, setExplicacao] = useState("");

  const materiaAtual = subjects.find(
    (item) => item.id === subject.id
  );

  if (!materiaAtual) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Matéria não encontrada.</Text>
      </View>
    );
  }

  const totalFaltas = materiaAtual.faltas.reduce(
    (acc, falta) => acc + falta.quantidade,
    0
  );

  const faltasRestantes =
    materiaAtual.maxFaltas - totalFaltas;

  const adicionarFalta = () => {
    if (!quantidadeFalta) return;

    if (faltasRestantes <= 0) {
      Alert.alert(
        "Limite atingido",
        "Você já atingiu o limite de faltas!"
      );
      return;
    }

    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    const novaFalta = {
      id: Date.now().toString(),
      quantidade: parseInt(quantidadeFalta),
      data: new Date().toLocaleDateString("pt-BR"),
      explicacao:
        explicacao.trim() === "" ? "preguiça" : explicacao,
    };

    setSubjects((prevSubjects) =>
      prevSubjects.map((item) =>
        item.id === subject.id
          ? {
              ...item,
              faltas: [...item.faltas, novaFalta],
            }
          : item
      )
    );

    setQuantidadeFalta("");
    setExplicacao("");

    navigation.goBack();
  };

  const corRestante =
    faltasRestantes <= 2 ? "red" : "black";

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>
        {materiaAtual.nome}
      </Text>

      <Text>
        Total: {totalFaltas} / {materiaAtual.maxFaltas}
      </Text>

      <Text style={{ color: corRestante }}>
        Restantes: {faltasRestantes}
      </Text>

      <TextInput
        placeholder="Quantas faltas?"
        placeholderTextColor={"black"}
        keyboardType="numeric"
        value={quantidadeFalta}
        onChangeText={setQuantidadeFalta}
        style={{
          borderWidth: 1,
          padding: 10,
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Explicação (opcional)"
        placeholderTextColor={"black"}
        value={explicacao}
        onChangeText={setExplicacao}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <TouchableOpacity
        onPress={adicionarFalta}
        style={{
          backgroundColor:
            faltasRestantes <= 0
              ? "gray"
              : "#4CAF50",
          padding: 15,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "white" }}>
          Registrar Falta
        </Text>
      </TouchableOpacity>

      <FlatList
        data={materiaAtual.faltas}
        keyExtractor={(item) => item.id}
        extraData={materiaAtual.faltas}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <Text>📅 {item.data}</Text>
            <Text>❌ {item.quantidade}</Text>
            <Text>📝 {item.explicacao}</Text>
          </View>
        )}
      />
    </View>
  );
}
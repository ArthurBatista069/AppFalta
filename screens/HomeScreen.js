import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

export default function HomeScreen({ navigation, route }) {
  const { subjects, setSubjects } = route.params;

  const confirmarRemocao = (id, nome) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja apagar a matéria "${nome}"?\n\nEssa ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, apagar",
          style: "destructive",
          onPress: () => removerMateria(id),
        },
      ]
    );
  };

  const removerMateria = (id) => {
    const novasMaterias = subjects.filter(
      (item) => item.id !== id
    );
    setSubjects(novasMaterias);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Adicionar", { subjects, setSubjects })
        }
        style={{ marginBottom: 20 }}
      >
        <Text style={{ fontSize: 18 }}>+ Adicionar Matéria</Text>
      </TouchableOpacity>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const totalFaltas = item.faltas.reduce(
            (acc, falta) => acc + falta.quantidade,
            0
          );

          return (
            <View
              style={{
                padding: 15,
                borderWidth: 1,
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Detalhes", {
                    subject: item,
                    subjects,
                    setSubjects,
                  })
                }
              >
                <Text style={{ fontSize: 18 }}>
                  {item.nome}
                </Text>
                <Text>
                  Faltas: {totalFaltas} / {item.maxFaltas}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  confirmarRemocao(item.id, item.nome)
                }
                style={{
                  marginTop: 10,
                  backgroundColor: "red",
                  padding: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>
                  Remover Matéria
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}
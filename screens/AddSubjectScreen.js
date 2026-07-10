import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AddSubjectScreen({ navigation, route }) {
  const { subjects, setSubjects } = route.params;

  const [nome, setNome] = useState("");
  const [maxFaltas, setMaxFaltas] = useState("");
  const [erro, setErro] = useState("");

  const nomeValido = nome.trim().length > 0;
  const faltasValidas = maxFaltas !== "" && parseInt(maxFaltas) > 0;
  const formValido = nomeValido && faltasValidas;

  const adicionarMateria = () => {
    if (!nomeValido) {
      setErro("Dê um nome para a matéria.");
      return;
    }
    if (!faltasValidas) {
      setErro("Informe um número válido de faltas.");
      return;
    }

    const novaMateria = {
      id: Date.now().toString(),
      nome: nome.trim(),
      maxFaltas: parseInt(maxFaltas),
      faltas: [],
    };

    setSubjects([...subjects, novaMateria]);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Matéria</Text>
        </View>

        <Text style={styles.label}>Nome da Matéria</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="book-outline"
            size={20}
            color="#8E8E93"
            style={styles.inputIcon}
          />
          <TextInput
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              if (erro) setErro("");
            }}

          />
        </View>

        <Text style={styles.label}>Quantas faltas você pode ter?</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color="#8E8E93"
            style={styles.inputIcon}
          />
          <TextInput
            value={maxFaltas}
            onChangeText={(text) => {
              setMaxFaltas(text.replace(/[^0-9]/g, ""));
              if (erro) setErro("");
            }}
          />
        </View>

        {erro ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color="#E53935" />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={adicionarMateria}
          activeOpacity={0.8}
          style={[
            styles.saveButton,
            !formValido && styles.saveButtonDisabled,
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Salvar Matéria</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E9",
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: -6,
  },
  errorText: {
    color: "#E53935",
    fontSize: 13,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3D5AFE",
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#B0B7F5",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
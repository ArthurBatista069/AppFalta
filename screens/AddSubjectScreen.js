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
import { useTheme } from "../context/ThemeContext";

export default function AddSubjectScreen({ navigation, route }) {
  const { setSubjects } = route.params;
  const { colors } = useTheme();

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
      avaliacoes: [],
    };

    setSubjects((materiasAtuais) => [...materiasAtuais, novaMateria]);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Nova Matéria
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Nome da Matéria
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            value={nome}
            onChangeText={(text) => {
              setNome(text);
              if (erro) setErro("");
            }}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Quantas faltas você pode ter?
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            value={maxFaltas}
            onChangeText={(text) => {
              setMaxFaltas(text.replace(/[^0-9]/g, ""));
              if (erro) setErro("");
            }}
            keyboardType="numeric"
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        {erro ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {erro}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={adicionarMateria}
          activeOpacity={0.8}
          style={[
            styles.saveButton,
            { backgroundColor: formValido ? colors.primary : colors.primaryDisabled },
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
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
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
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: -6,
  },
  errorText: {
    fontSize: 13,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

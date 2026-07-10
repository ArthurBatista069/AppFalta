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
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

  const materiaAtual = subjects.find((item) => item.id === subject.id);

  if (!materiaAtual) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#BDBDBD" />
        <Text style={styles.notFoundText}>Matéria não encontrada.</Text>
      </View>
    );
  }

  const totalFaltas = materiaAtual.faltas.reduce(
    (acc, falta) => acc + falta.quantidade,
    0
  );

  const faltasRestantes = materiaAtual.maxFaltas - totalFaltas;

  const adicionarFalta = () => {
    if (!quantidadeFalta) return;

    if (faltasRestantes <= 0) {
      Alert.alert("Limite atingido", "Você já atingiu o limite de faltas!");
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const novaFalta = {
      id: Date.now().toString(),
      quantidade: parseInt(quantidadeFalta),
      data: new Date().toLocaleDateString("pt-BR"),
      explicacao: explicacao.trim() === "" ? "preguiça" : explicacao,
    };

    setSubjects((prevSubjects) =>
      prevSubjects.map((item) =>
        item.id === subject.id
          ? { ...item, faltas: [...item.faltas, novaFalta] }
          : item
      )
    );

    setQuantidadeFalta("");
    setExplicacao("");

    navigation.goBack();
  };

  const getStatusColor = () => {
    if (faltasRestantes <= 0) return "#E53935";
    if (faltasRestantes <= 2) return "#FB8C00";
    return "#43A047";
  };

  const statusColor = getStatusColor();
  const progresso =
    materiaAtual.maxFaltas > 0
      ? Math.min(totalFaltas / materiaAtual.maxFaltas, 1)
      : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{materiaAtual.nome}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de faltas</Text>
            <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {totalFaltas}/{materiaAtual.maxFaltas}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progresso * 100}%`, backgroundColor: statusColor },
              ]}
            />
          </View>

          <Text style={[styles.remainingText, { color: statusColor }]}>
            {faltasRestantes > 0
              ? `Você ainda pode faltar ${faltasRestantes}x`
              : "Limite de faltas atingido"}
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Quantas faltas?</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="close-circle-outline"
              size={20}
              color="#8E8E93"
              style={styles.inputIcon}
            />
            <TextInput
              keyboardType="numeric"
              value={quantidadeFalta}
              onChangeText={setQuantidadeFalta}
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>Explicação (opcional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#8E8E93"
              style={styles.inputIcon}
            />
            <TextInput
              value={explicacao}
              onChangeText={setExplicacao}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={adicionarFalta}
            activeOpacity={0.8}
            style={[
              styles.saveButton,
              faltasRestantes <= 0 && styles.saveButtonDisabled,
            ]}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Registrar Falta</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={materiaAtual.faltas}
          keyExtractor={(item) => item.id}
          extraData={materiaAtual.faltas}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={
            materiaAtual.faltas.length > 0 ? (
              <Text style={styles.historyTitle}>Histórico</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color="#BDBDBD" />
              <Text style={styles.emptyText}>
                Nenhuma falta registrada ainda.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.faltaCard}>
              <View style={styles.faltaIconWrapper}>
                <Ionicons name="close" size={18} color="#E53935" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.faltaTopRow}>
                  <Text style={styles.faltaData}>{item.data}</Text>
                  <Text style={styles.faltaQuantidade}>
                    {item.quantidade} {item.quantidade === 1 ? "falta" : "faltas"}
                  </Text>
                </View>
                <Text style={styles.faltaExplicacao}>{item.explicacao}</Text>
              </View>
            </View>
          )}
        />
      </View>
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
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    flexShrink: 1,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#4A4A4A",
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#EEEEF2",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: "#F5F6FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E9",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3D5AFE",
    borderRadius: 12,
    paddingVertical: 14,
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
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  faltaCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  faltaIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FDECEA",
    alignItems: "center",
    justifyContent: "center",
  },
  faltaTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  faltaData: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  faltaQuantidade: {
    fontSize: 13,
    color: "#8E8E93",
  },
  faltaExplicacao: {
    fontSize: 13,
    color: "#6B6B70",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#8E8E93",
    marginTop: 10,
    fontSize: 14,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  notFoundText: {
    fontSize: 16,
    color: "#8E8E93",
  },
});
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function HomeScreen({ navigation, route }) {
  const { subjects, setSubjects } = route.params;
  const { colors, modoEscuro, alternarTema } = useTheme();

  const confirmarRemocao = (id, nome) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja apagar a matéria "${nome}"?\n\nEssa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, apagar",
          style: "destructive",
          onPress: () => removerMateria(id),
        },
      ],
    );
  };

  const removerMateria = (id) => {
    setSubjects((materiasAtuais) => materiasAtuais.filter((item) => item.id !== id));
  };

  const getStatusColor = (total, max) => {
    if (max === 0) return colors.success;
    const ratio = total / max;
    if (ratio >= 1) return colors.danger;
    if (ratio >= 0.75) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Minhas Matérias
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {subjects.length} {subjects.length === 1 ? "matéria" : "matérias"}
          </Text>
        </View>

        <TouchableOpacity onPress={alternarTema} style={styles.themeToggle}>
          <Ionicons
            name={modoEscuro ? "sunny-outline" : "moon-outline"}
            size={24}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("Adicionar", { subjects, setSubjects })
        }
      >
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.addButtonText}>Adicionar Matéria</Text>
      </TouchableOpacity>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhuma matéria cadastrada ainda.{"\n"}Toque em "Adicionar
              Matéria" para começar.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const totalFaltas = item.faltas.reduce(
            (acc, f) => acc + f.quantidade,
            0,
          );
          const statusColor = getStatusColor(totalFaltas, item.maxFaltas);
          const progresso =
            item.maxFaltas > 0 ? Math.min(totalFaltas / item.maxFaltas, 1) : 0;

          return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Detalhes", {
                    subject: item,
                    subjects,
                    setSubjects,
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.subjectName, { color: colors.text }]}>
                    {item.nome}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusColor + "20" },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: statusColor }]}>
                      {totalFaltas}/{item.maxFaltas}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.progressBarBg,
                    { backgroundColor: colors.progressBg },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progresso * 100}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.faltasLabel, { color: colors.textMuted }]}>
                  {item.maxFaltas - totalFaltas > 0
                    ? `Você ainda pode faltar ${item.maxFaltas - totalFaltas}x`
                    : "Limite de faltas atingido"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmarRemocao(item.id, item.nome)}
                style={styles.removeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colors.danger}
                />
                <Text
                  style={[styles.removeButtonText, { color: colors.danger }]}
                >
                  Remover
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: "700" },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  themeToggle: { padding: 6 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subjectName: { fontSize: 17, fontWeight: "600", flexShrink: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: "700" },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  faltasLabel: { fontSize: 13 },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    gap: 6,
  },
  removeButtonText: { fontSize: 13, fontWeight: "600" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
});

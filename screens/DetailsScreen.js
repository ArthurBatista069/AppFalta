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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetailsScreen({ route, navigation, subjects, setSubjects }) {
  const { subject } = route.params;
  const { colors } = useTheme();

  const [quantidadeFalta, setQuantidadeFalta] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [avaliacaoModalVisivel, setAvaliacaoModalVisivel] = useState(false);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(null);
  const [nomeAvaliacao, setNomeAvaliacao] = useState("");
  const [notaAvaliacao, setNotaAvaliacao] = useState("");
  const [pesoAvaliacao, setPesoAvaliacao] = useState("");
  const [erroAvaliacao, setErroAvaliacao] = useState("");

  const materiaAtual = subjects.find((item) => item.id === subject.id);

  if (!materiaAtual) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
        <Text style={[styles.notFoundText, { color: colors.textMuted }]}>
          Matéria não encontrada.
        </Text>
      </View>
    );
  }

  const totalFaltas = materiaAtual.faltas.reduce(
    (acc, falta) => acc + falta.quantidade,
    0
  );

  const faltasRestantes = materiaAtual.maxFaltas - totalFaltas;
  const avaliacoes = materiaAtual.avaliacoes || [];
  const avaliacoesComNota = avaliacoes.filter((item) => {
    if (item.nota === null || item.nota === undefined || item.nota === "") return false;
    const nota = Number(String(item.nota).replace(",", "."));
    return Number.isFinite(nota) && nota >= 0 && nota <= 10 && Number(item.peso) > 0;
  });
  const pesoComNota = avaliacoesComNota.reduce((total, item) => total + Number(item.peso), 0);
  const mediaPonderada = pesoComNota > 0
    ? avaliacoesComNota.reduce(
        (total, item) => total + Number(String(item.nota).replace(",", ".")) * Number(item.peso),
        0,
      ) / pesoComNota
    : null;

  const abrirFormularioAvaliacao = (avaliacao = null) => {
    setAvaliacaoEditando(avaliacao);
    setNomeAvaliacao(avaliacao?.nome || "");
    setNotaAvaliacao(avaliacao?.nota == null ? "" : String(avaliacao.nota));
    setPesoAvaliacao(avaliacao?.peso == null ? "" : String(avaliacao.peso));
    setErroAvaliacao("");
    setAvaliacaoModalVisivel(true);
  };

  const fecharFormularioAvaliacao = () => {
    setAvaliacaoModalVisivel(false);
    setAvaliacaoEditando(null);
    setErroAvaliacao("");
  };

  const salvarAvaliacao = () => {
    const peso = Number(pesoAvaliacao.trim().replace(",", "."));
    const notaTexto = notaAvaliacao.trim().replace(",", ".");
    const nota = notaTexto === "" ? null : Number(notaTexto);

    if (!nomeAvaliacao.trim()) {
      setErroAvaliacao("Informe o nome da avaliação.");
      return;
    }
    if (!Number.isFinite(peso) || peso <= 0) {
      setErroAvaliacao("Informe um peso maior que zero.");
      return;
    }
    if (nota !== null && (!Number.isFinite(nota) || nota < 0 || nota > 10)) {
      setErroAvaliacao("A nota deve estar entre 0 e 10 ou ficar vazia.");
      return;
    }

    const registro = {
      id: avaliacaoEditando?.id || Date.now().toString(),
      nome: nomeAvaliacao.trim(),
      nota,
      peso,
    };
    setSubjects((atuais) => atuais.map((item) => {
      if (item.id !== subject.id) return item;
      const lista = item.avaliacoes || [];
      const atualizadas = avaliacaoEditando
        ? lista.map((avaliacao) => avaliacao.id === registro.id ? registro : avaliacao)
        : [...lista, registro];
      return { ...item, avaliacoes: atualizadas };
    }));
    fecharFormularioAvaliacao();
  };

  const removerAvaliacao = (id) => {
    Alert.alert("Remover avaliação", "Deseja remover esta avaliação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setSubjects((atuais) => atuais.map((item) =>
          item.id === subject.id
            ? { ...item, avaliacoes: (item.avaliacoes || []).filter((avaliacao) => avaliacao.id !== id) }
            : item
        )),
      },
    ]);
  };

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
    if (faltasRestantes <= 0) return colors.danger;
    if (faltasRestantes <= 2) return colors.warning;
    return colors.success;
  };

  const statusColor = getStatusColor();
  const progresso =
    materiaAtual.maxFaltas > 0
      ? Math.min(totalFaltas / materiaAtual.maxFaltas, 1)
      : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {materiaAtual.nome}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total de faltas
            </Text>
            <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {totalFaltas}/{materiaAtual.maxFaltas}
              </Text>
            </View>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.progressBg }]}>
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

        <View style={[styles.evaluationCard, { backgroundColor: colors.card }]}>
          <View style={styles.evaluationHeader}>
            <View>
              <Text style={[styles.historyTitle, { color: colors.text, marginBottom: 4 }]}>Notas</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                Média {mediaPonderada === null ? "—" : mediaPonderada.toFixed(2).replace(".", ",")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => abrirFormularioAvaliacao()}
              style={[styles.addEvaluationButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addEvaluationButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {avaliacoes.length === 0 ? (
            <Text style={[styles.emptyEvaluationsText, { color: colors.textMuted }]}>
              Nenhuma nota cadastrada.
            </Text>
          ) : avaliacoes.map((avaliacao) => (
            <View key={avaliacao.id} style={[styles.evaluationRow, { borderColor: colors.cardBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.evaluationName, { color: colors.text }]}>{avaliacao.nome}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  {avaliacao.nota === null || avaliacao.nota === undefined || avaliacao.nota === ""
                    ? "Sem nota"
                    : String(avaliacao.nota).replace(".", ",")}
                  {"  ·  Peso "}{avaliacao.peso}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => abrirFormularioAvaliacao(avaliacao)}
                style={styles.evaluationIconButton}
                accessibilityLabel={`Editar ${avaliacao.nome}`}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removerAvaliacao(avaliacao.id)}
                style={styles.evaluationIconButton}
                accessibilityLabel={`Remover ${avaliacao.nome}`}
              >
                <Ionicons name="trash-outline" size={19} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Quantas faltas?
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput

              keyboardType="numeric"
              value={quantidadeFalta}
              onChangeText={setQuantidadeFalta}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Explicação (opcional)
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput

              value={explicacao}
              onChangeText={setExplicacao}
              style={[styles.input, { color: colors.text }]}
            />
          </View>

          <TouchableOpacity
            onPress={adicionarFalta}
            activeOpacity={0.8}
            style={[
              styles.saveButton,
              { backgroundColor: faltasRestantes <= 0 ? colors.primaryDisabled : colors.primary },
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
              <Text style={[styles.historyTitle, { color: colors.text }]}>
                Histórico
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Nenhuma falta registrada ainda.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.faltaCard, { backgroundColor: colors.card }]}>
              <View style={[styles.faltaIconWrapper, { backgroundColor: colors.dangerBg }]}>
                <Ionicons name="close" size={18} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.faltaTopRow}>
                  <Text style={[styles.faltaData, { color: colors.text }]}>
                    {item.data}
                  </Text>
                  <Text style={[styles.faltaQuantidade, { color: colors.textMuted }]}>
                    {item.quantidade} {item.quantidade === 1 ? "falta" : "faltas"}
                  </Text>
                </View>
                <Text style={[styles.faltaExplicacao, { color: colors.textSecondary }]}>
                  {item.explicacao}
                </Text>
              </View>
            </View>
          )}
        />

        <Modal
          visible={avaliacaoModalVisivel}
          transparent
          animationType="fade"
          onRequestClose={fecharFormularioAvaliacao}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {avaliacaoEditando ? "Editar nota" : "Nova nota"}
              </Text>
              <TextInput
                value={nomeAvaliacao}
                onChangeText={setNomeAvaliacao}
                placeholder="Avaliação (ex.: Prova 1)"
                placeholderTextColor={colors.textMuted}
                style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}
              />
              <TextInput
                value={notaAvaliacao}
                onChangeText={setNotaAvaliacao}
                keyboardType="decimal-pad"
                placeholder="Nota (opcional, 0–10)"
                placeholderTextColor={colors.textMuted}
                style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}
              />
              <TextInput
                value={pesoAvaliacao}
                onChangeText={setPesoAvaliacao}
                keyboardType="decimal-pad"
                placeholder="Peso"
                placeholderTextColor={colors.textMuted}
                style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}
              />
              {erroAvaliacao ? (
                <Text style={[styles.evaluationError, { color: colors.danger }]}>{erroAvaliacao}</Text>
              ) : null}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={fecharFormularioAvaliacao} style={styles.modalCancelButton}>
                  <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={salvarAvaliacao}
                  style={[styles.modalFinishButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={19} color="#fff" />
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
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
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flexShrink: 1,
  },
  summaryCard: {
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
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
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
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  evaluationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  addEvaluationButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 4,
  },
  addEvaluationButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  emptyEvaluationsText: { fontSize: 13, paddingVertical: 8 },
  evaluationRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 11,
    marginTop: 4,
  },
  evaluationName: { fontSize: 14, fontWeight: "600", marginBottom: 3 },
  evaluationIconButton: { padding: 8 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: { borderRadius: 18, padding: 20, maxWidth: 500, width: "100%", alignSelf: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 18 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },
  evaluationError: { fontSize: 13, marginBottom: 10 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 4 },
  modalCancelButton: { paddingHorizontal: 10, paddingVertical: 12 },
  modalFinishButton: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, gap: 6 },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  faltaCard: {
    flexDirection: "row",
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
  },
  faltaQuantidade: {
    fontSize: 13,
  },
  faltaExplicacao: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyText: {
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
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { dataValida, aplicarMascaraData } from "../utils/date";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIPOS_AVALIACAO = [
  { valor: "trabalho", label: "Trabalho", icon: "document-text-outline" },
  { valor: "seminario", label: "Seminário", icon: "easel-outline" },
  { valor: "prova", label: "Prova", icon: "school-outline" },
];

export default function DetailsScreen({ route, navigation, subjects, setSubjects }) {
  const { subject } = route.params;
  const { colors } = useTheme();

  const [aba, setAba] = useState("faltas"); // "faltas" | "avaliacoes"

  const [quantidadeFalta, setQuantidadeFalta] = useState("");
  const [explicacao, setExplicacao] = useState("");

  const [tituloAvaliacao, setTituloAvaliacao] = useState("");
  const [tipoAvaliacao, setTipoAvaliacao] = useState("trabalho");
  const [dataAvaliacao, setDataAvaliacao] = useState("");
  const [pesoAvaliacao, setPesoAvaliacao] = useState("");
  const [notaAvaliacao, setNotaAvaliacao] = useState("");
  const [erroAvaliacao, setErroAvaliacao] = useState("");
  const [formularioAvaliacaoVisivel, setFormularioAvaliacaoVisivel] = useState(false);
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(null);

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

  const avaliacoes = materiaAtual.avaliacoes || [];

  const totalFaltas = materiaAtual.faltas.reduce(
    (acc, falta) => acc + falta.quantidade,
    0
  );

  const faltasRestantes = materiaAtual.maxFaltas - totalFaltas;

  const tipoInfo = (valor) =>
    TIPOS_AVALIACAO.find((t) => t.valor === valor) || TIPOS_AVALIACAO[0];

  const corDoTipo = () => colors.avaliacao;

  const avaliacoesComNota = avaliacoes.filter((avaliacao) => {
    if (avaliacao.nota === null || avaliacao.nota === undefined || avaliacao.nota === "") return false;
    const nota = Number(String(avaliacao.nota).replace(",", "."));
    return Number.isFinite(nota) && nota >= 0 && nota <= 10 && Number(avaliacao.peso) > 0;
  });
  const somaPesosComNota = avaliacoesComNota.reduce((total, avaliacao) => total + Number(avaliacao.peso), 0);
  const mediaPonderada = somaPesosComNota > 0
    ? avaliacoesComNota.reduce(
        (total, avaliacao) => total + Number(String(avaliacao.nota).replace(",", ".")) * Number(avaliacao.peso),
        0,
      ) / somaPesosComNota
    : null;

  const abrirFormularioAvaliacao = (avaliacao = null) => {
    setAvaliacaoEditando(avaliacao);
    setTituloAvaliacao(avaliacao?.titulo || avaliacao?.nome || "");
    setTipoAvaliacao(avaliacao?.tipo || "trabalho");
    setDataAvaliacao(avaliacao?.data || "");
    setPesoAvaliacao(avaliacao?.peso == null ? "" : String(avaliacao.peso));
    setNotaAvaliacao(avaliacao?.nota == null ? "" : String(avaliacao.nota));
    setErroAvaliacao("");
    setFormularioAvaliacaoVisivel(true);
  };

  const fecharFormularioAvaliacao = () => {
    setFormularioAvaliacaoVisivel(false);
    setAvaliacaoEditando(null);
    setErroAvaliacao("");
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

  const adicionarAvaliacao = () => {
    if (tituloAvaliacao.trim() === "") {
      setErroAvaliacao("Dê um nome para a avaliação.");
      return;
    }
    if (!dataValida(dataAvaliacao)) {
      setErroAvaliacao("Informe uma data válida (DD/MM/AAAA).");
      return;
    }
    const pesoNumero = parseFloat(pesoAvaliacao.replace(",", "."));
    if (!pesoAvaliacao || isNaN(pesoNumero) || pesoNumero <= 0) {
      setErroAvaliacao("Informe um peso válido.");
      return;
    }

    const notaTexto = notaAvaliacao.trim().replace(",", ".");
    const notaNumero = notaTexto === "" ? null : Number(notaTexto);
    if (notaNumero !== null && (!Number.isFinite(notaNumero) || notaNumero < 0 || notaNumero > 10)) {
      setErroAvaliacao("A nota deve estar entre 0 e 10.");
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const novaAvaliacao = {
      id: avaliacaoEditando?.id || Date.now().toString(),
      titulo: tituloAvaliacao.trim(),
      tipo: tipoAvaliacao,
      data: dataAvaliacao,
      peso: pesoNumero,
      nota: notaNumero,
    };

    setSubjects((prevSubjects) =>
      prevSubjects.map((item) =>
        item.id === subject.id
          ? {
              ...item,
              avaliacoes: avaliacaoEditando
                ? (item.avaliacoes || []).map((avaliacao) =>
                    avaliacao.id === novaAvaliacao.id ? novaAvaliacao : avaliacao,
                  )
                : [...(item.avaliacoes || []), novaAvaliacao],
            }
          : item
      )
    );

    setTituloAvaliacao("");
    setTipoAvaliacao("trabalho");
    setDataAvaliacao("");
    setPesoAvaliacao("");
    setNotaAvaliacao("");
    setErroAvaliacao("");
    fecharFormularioAvaliacao();
  };

  const removerAvaliacao = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSubjects((prevSubjects) =>
      prevSubjects.map((item) =>
        item.id === subject.id
          ? { ...item, avaliacoes: (item.avaliacoes || []).filter((a) => a.id !== id) }
          : item
      )
    );
  };

  const confirmarRemocaoAvaliacao = (id, titulo) => {
    Alert.alert(
      "Remover avaliação",
      `Deseja remover "${titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removerAvaliacao(id) },
      ]
    );
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

  const avaliacoesOrdenadas = [...avaliacoes].sort((a, b) => {
    const [da, ma, aa] = (a.data || "31/12/9999").split("/");
    const [db, mb, ab] = (b.data || "31/12/9999").split("/");
    return new Date(aa, ma - 1, da) - new Date(ab, mb - 1, db);
  });

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

        <View style={[styles.tabSwitcher, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              aba === "faltas" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAba("faltas")}
          >
            <Ionicons
              name="close-circle-outline"
              size={16}
              color={aba === "faltas" ? "#fff" : colors.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                { color: aba === "faltas" ? "#fff" : colors.textMuted },
              ]}
            >
              Faltas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              aba === "avaliacoes" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAba("avaliacoes")}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color={aba === "avaliacoes" ? "#fff" : colors.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                { color: aba === "avaliacoes" ? "#fff" : colors.textMuted },
              ]}
            >
              Avaliações
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {aba === "faltas" ? (
            <>
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

              {materiaAtual.faltas.length > 0 && (
                <Text style={[styles.historyTitle, { color: colors.text }]}>
                  Histórico
                </Text>
              )}

              {materiaAtual.faltas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Nenhuma falta registrada ainda.
                  </Text>
                </View>
              ) : (
                materiaAtual.faltas.map((item) => (
                  <View key={item.id} style={[styles.faltaCard, { backgroundColor: colors.card }]}>
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
                ))
              )}
            </>
          ) : (
            <>
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Média ponderada</Text>
                <Text style={[styles.headerTitle, { color: colors.text, marginTop: 6 }]}>
                  {mediaPonderada === null ? "—" : mediaPonderada.toFixed(2).replace(".", ",")}
                </Text>
              </View>

              {formularioAvaliacaoVisivel ? (
              <View style={[styles.formCard, { backgroundColor: colors.card }]}>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={tituloAvaliacao}
                    onChangeText={(t) => {
                      setTituloAvaliacao(t);
                      if (erroAvaliacao) setErroAvaliacao("");
                    }}
                    placeholder="Avaliação"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>

                <View style={styles.tipoRow}>
                  {TIPOS_AVALIACAO.map((tipo) => {
                    const selecionado = tipoAvaliacao === tipo.valor;
                    const cor = corDoTipo(tipo.valor);
                    return (
                      <TouchableOpacity
                        key={tipo.valor}
                        onPress={() => setTipoAvaliacao(tipo.valor)}
                        style={[
                          styles.tipoOption,
                          {
                            backgroundColor: selecionado ? cor + "20" : colors.inputBackground,
                            borderColor: selecionado ? cor : colors.cardBorder,
                          },
                        ]}
                      >
                        <Ionicons
                          name={tipo.icon}
                          size={18}
                          color={selecionado ? cor : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.tipoOptionText,
                            { color: selecionado ? cor : colors.textMuted },
                          ]}
                        >
                          {tipo.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={dataAvaliacao}
                    onChangeText={(t) => {
                      setDataAvaliacao(aplicarMascaraData(t, dataAvaliacao));
                      if (erroAvaliacao) setErroAvaliacao("");
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={10}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder },
                  ]}
                >
                  <Ionicons
                    name="scale-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={pesoAvaliacao}
                    onChangeText={(t) => {
                      setPesoAvaliacao(t.replace(/[^0-9,.]/g, ""));
                      if (erroAvaliacao) setErroAvaliacao("");
                    }}
                    placeholder="Peso"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>

                <TextInput
                  value={notaAvaliacao}
                  onChangeText={(texto) => {
                    setNotaAvaliacao(texto.replace(/[^0-9,.]/g, ""));
                    if (erroAvaliacao) setErroAvaliacao("");
                  }}
                  placeholder="Nota (opcional, 0–10)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.gradeInput, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}
                />

                {erroAvaliacao ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="warning-outline" size={16} color={colors.danger} />
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {erroAvaliacao}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.formActions}>
                  <TouchableOpacity onPress={fecharFormularioAvaliacao} style={styles.cancelFormButton}>
                    <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={adicionarAvaliacao}
                    activeOpacity={0.8}
                    style={[styles.saveButton, styles.formSaveButton, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
              ) : (
                <TouchableOpacity
                  onPress={() => abrirFormularioAvaliacao()}
                  activeOpacity={0.8}
                  style={[styles.saveButton, styles.addEvaluationButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Adicionar avaliação</Text>
                </TouchableOpacity>
              )}

              {avaliacoesOrdenadas.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Nenhuma avaliação.
                  </Text>
                </View>
              ) : (
                avaliacoesOrdenadas.map((item) => {
                  const info = tipoInfo(item.tipo);
                  const cor = corDoTipo(item.tipo);
                  return (
                    <View key={item.id} style={[styles.faltaCard, { backgroundColor: colors.card }]}>
                      <View style={[styles.faltaIconWrapper, { backgroundColor: cor + "20" }]}>
                        <Ionicons name={info.icon} size={18} color={cor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.faltaTopRow}>
                          <Text style={[styles.faltaData, { color: colors.text }]}>
                            {item.titulo}
                          </Text>
                          <Text style={[styles.faltaQuantidade, { color: cor }]}>
                            {info.label}
                          </Text>
                        </View>
                        <Text style={[styles.faltaExplicacao, { color: colors.textSecondary }]}>
                          {item.data ? `${item.data} · ` : ""}Peso {item.peso} · Nota {item.nota == null || item.nota === "" ? "—" : String(item.nota).replace(".", ",")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => abrirFormularioAvaliacao(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.avaliacaoRemoveButton}
                        accessibilityLabel={`Editar ${item.titulo || item.nome}`}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmarRemocaoAvaliacao(item.id, item.titulo || item.nome)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.avaliacaoRemoveButton}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
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
    marginBottom: 16,
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
  tabSwitcher: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    paddingVertical: 10,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
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
  tipoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tipoOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    gap: 4,
  },
  tipoOptionText: {
    fontSize: 11,
    fontWeight: "600",
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
    paddingVertical: 14,
    gap: 8,
  },
  gradeInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    fontSize: 16,
  },
  addEvaluationButton: {
    marginBottom: 18,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  cancelFormButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  formSaveButton: {
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  faltaCard: {
    flexDirection: "row",
    alignItems: "center",
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
    flexShrink: 1,
  },
  faltaQuantidade: {
    fontSize: 13,
  },
  faltaExplicacao: {
    fontSize: 13,
  },
  avaliacaoRemoveButton: {
    padding: 6,
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

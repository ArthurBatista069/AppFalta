import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { paraISO, hojeISO } from "../utils/date";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

const TIPO_CONFIG = {
  trabalho: { label: "Trabalho", icon: "document-text-outline" },
  seminario: { label: "Seminário", icon: "easel-outline" },
  prova: { label: "Prova", icon: "school-outline" },
};

export default function CalendarScreen({ route }) {
  const { subjects } = route.params;
  const { colors, modoEscuro } = useTheme();
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO());

  const corDoTipo = () => colors.avaliacao;

  const eventosPorDia = useMemo(() => {
    const mapa = {};

    subjects.forEach((materia) => {
      (materia.avaliacoes || []).forEach((av) => {
        const iso = paraISO(av.data);
        if (!iso) return;
        if (!mapa[iso]) mapa[iso] = [];
        mapa[iso].push({
          id: `av-${materia.id}-${av.id}`,
          tipoEvento: "avaliacao",
          categoria: av.tipo,
          titulo: av.titulo,
          peso: av.peso,
          materia: materia.nome,
          cor: corDoTipo(av.tipo),
        });
      });

      (materia.faltas || []).forEach((f) => {
        const iso = paraISO(f.data);
        if (!iso) return;
        if (!mapa[iso]) mapa[iso] = [];
        mapa[iso].push({
          id: `fa-${materia.id}-${f.id}`,
          tipoEvento: "falta",
          quantidade: f.quantidade,
          explicacao: f.explicacao,
          materia: materia.nome,
          cor: colors.danger,
        });
      });
    });

    return mapa;
  }, [subjects, colors]);

  const corPrioritaria = (eventos) => {
    if (eventos.some((e) => e.tipoEvento === "falta")) return colors.danger;
    return colors.avaliacao;
  };

  const markedDates = useMemo(() => {
    const marcado = {};

    Object.keys(eventosPorDia).forEach((data) => {
      const cor = corPrioritaria(eventosPorDia[data]);
      const selecionado = data === diaSelecionado;
      marcado[data] = {
        customStyles: {
          container: {
            backgroundColor: cor,
            borderRadius: 8,
            borderWidth: selecionado ? 2 : 0,
            borderColor: colors.text,
          },
          text: {
            color: "#ffffff",
            fontWeight: "700",
          },
        },
      };
    });

    if (!marcado[diaSelecionado]) {
      marcado[diaSelecionado] = {
        customStyles: {
          container: {
            backgroundColor: colors.primary,
            borderRadius: 8,
          },
          text: {
            color: "#ffffff",
            fontWeight: "700",
          },
        },
      };
    }

    return marcado;
  }, [eventosPorDia, diaSelecionado, colors]);

  const eventosDoDia = (eventosPorDia[diaSelecionado] || [])
    .slice()
    .sort((a, b) => {
      if (a.tipoEvento === b.tipoEvento) return 0;
      return a.tipoEvento === "avaliacao" ? -1 : 1;
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Calendário
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Avaliações e faltas de todas as matérias
        </Text>
      </View>

      <View
        style={[
          styles.calendarWrapper,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Calendar
          current={diaSelecionado}
          onDayPress={(dia) => setDiaSelecionado(dia.dateString)}
          markingType="custom"
          markedDates={markedDates}
          enableSwipeMonths
          theme={{
            backgroundColor: colors.card,
            calendarBackground: colors.card,
            dayTextColor: colors.text,
            monthTextColor: colors.text,
            textSectionTitleColor: colors.textMuted,
            textDisabledColor: colors.textMuted + "80",
            arrowColor: colors.primary,
            todayTextColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: "#ffffff",
            indicatorColor: colors.primary,
          }}
          key={modoEscuro ? "dark" : "light"}
        />
      </View>

      <ScrollView
        style={styles.listaContainer}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.listaTitulo, { color: colors.text }]}>
          {formatarDataExibicao(diaSelecionado)}
        </Text>

        {eventosDoDia.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-clear-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nada registrado nesse dia.
            </Text>
          </View>
        ) : (
          eventosDoDia.map((ev) => (
            <View
              key={ev.id}
              style={[styles.eventoCard, { backgroundColor: colors.card }]}
            >
              <View
                style={[styles.eventoIcone, { backgroundColor: ev.cor + "20" }]}
              >
                <Ionicons
                  name={
                    ev.tipoEvento === "falta"
                      ? "close"
                      : TIPO_CONFIG[ev.categoria]?.icon ||
                        "document-text-outline"
                  }
                  size={18}
                  color={ev.cor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eventoTitulo, { color: colors.text }]}>
                  {ev.tipoEvento === "falta"
                    ? `Falta - ${ev.materia}`
                    : ev.titulo}
                </Text>
                <Text
                  style={[styles.eventoSubtitulo, { color: colors.textMuted }]}
                >
                  {ev.tipoEvento === "falta"
                    ? `${ev.quantidade} ${ev.quantidade === 1 ? "falta" : "faltas"} · ${ev.explicacao}`
                    : `${ev.materia} · ${TIPO_CONFIG[ev.categoria]?.label || ev.categoria} · Peso ${ev.peso}`}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function formatarDataExibicao(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  const diasSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  return `${diasSemana[data.getDay()]}, ${dia}/${mes}/${ano}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: "700" },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  calendarWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  listaContainer: { flex: 1 },
  listaTitulo: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  eventoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  eventoIcone: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  eventoTitulo: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventoSubtitulo: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
  },
});

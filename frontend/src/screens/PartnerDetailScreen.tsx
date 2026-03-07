import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { partners as api, CycleStatus, ForecastDay } from "../services/api";
import { COLORS } from "../theme";

const DAY_NAMES: Record<string, string> = {
  Monday: "ПН",
  Tuesday: "ВТ",
  Wednesday: "СР",
  Thursday: "ЧТ",
  Friday: "ПТ",
  Saturday: "СБ",
  Sunday: "ВС",
};

const ENERGY_LABELS: Record<string, string> = {
  low: "LOW",
  rising: "RISING",
  peak: "PEAK",
  declining: "DECLINING",
};

export default function PartnerDetailScreen() {
  const route = useRoute<any>();
  const { partnerId } = route.params;
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, f] = await Promise.all([
        api.getStatus(partnerId),
        api.getForecast(partnerId, 14),
      ]);
      setStatus(s);
      setForecast(f.forecast);
    } catch (e: any) {
      Alert.alert("ОШИБКА", e.message);
    }
  }, [partnerId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!status) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>ЗАГРУЗКА ДАННЫХ...</Text>
      </View>
    );
  }

  const phaseColor = COLORS.phases[status.phase] || COLORS.textMuted;
  const progress = (status.day_in_cycle / status.cycle_length) * 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.cyan}
        />
      }
    >
      {/* Status HUD */}
      <View style={styles.hudCard}>
        <View style={[styles.hudAccent, { backgroundColor: phaseColor }]} />
        <View style={styles.hudContent}>
          <Text style={styles.targetName}>
            {status.partner_name.toUpperCase()}
          </Text>

          <View style={styles.phaseRow}>
            <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
            <Text style={[styles.phaseName, { color: phaseColor }]}>
              {status.phase_name.toUpperCase()}
            </Text>
          </View>

          {/* Circular-like progress */}
          <View style={styles.progressSection}>
            <View style={styles.bigDayContainer}>
              <Text style={styles.bigDayNumber}>{status.day_in_cycle}</Text>
              <Text style={styles.bigDayLabel}>/ {status.cycle_length}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progress}%`, backgroundColor: phaseColor },
                ]}
              />
            </View>
          </View>

          <Text style={styles.moodText}>{status.mood}</Text>

          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>ФАЗА ЕЩЁ</Text>
              <Text style={styles.miniStatValue}>
                {status.days_left_in_phase}д
              </Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>СЛЕД. ЦИКЛ</Text>
              <Text style={styles.miniStatValue}>
                {status.days_until_next_period}д
              </Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>ДАТА</Text>
              <Text style={styles.miniStatValue}>
                {status.next_period_date.slice(5)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tips — INTEL */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>РАЗВЕДДАННЫЕ</Text>
        <View style={styles.sectionLine} />
        {status.tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipBullet}>{">"}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Avoid — THREATS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.red }]}>
          УГРОЗЫ
        </Text>
        <View style={[styles.sectionLine, { backgroundColor: COLORS.redDim }]} />
        {status.avoid.map((item, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={[styles.tipBullet, { color: COLORS.red }]}>!</Text>
            <Text style={[styles.tipText, { color: COLORS.textSecondary }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      {/* Forecast — ПРОГНОЗ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ПРОГНОЗ 14 ДНЕЙ</Text>
        <View style={styles.sectionLine} />
        {forecast.map((day, i) => {
          const dayColor = COLORS.phases[day.phase] || COLORS.textMuted;
          const dayName = DAY_NAMES[day.day_of_week] || day.day_of_week.slice(0, 2).toUpperCase();
          const isToday = i === 0;

          return (
            <View
              key={i}
              style={[
                styles.forecastRow,
                isToday && styles.forecastRowToday,
              ]}
            >
              <Text style={[styles.forecastDay, isToday && { color: COLORS.cyan }]}>
                {dayName}
              </Text>
              <Text style={styles.forecastDate}>{day.date.slice(5)}</Text>
              <View style={[styles.forecastDot, { backgroundColor: dayColor }]} />
              <Text style={[styles.forecastPhase, { color: dayColor }]}>
                {day.phase_name}
              </Text>
              <Text style={styles.forecastEnergy}>
                {ENERGY_LABELS[day.energy]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },
  loading: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 40,
    fontFamily: "monospace",
    letterSpacing: 3,
  },

  // HUD Card
  hudCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hudAccent: {
    height: 3,
  },
  hudContent: {
    padding: 20,
  },
  targetName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    fontFamily: "monospace",
    letterSpacing: 3,
    marginBottom: 8,
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  phaseName: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  bigDayContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  bigDayNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    fontFamily: "monospace",
  },
  bigDayLabel: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontFamily: "monospace",
    marginLeft: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  moodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "monospace",
    lineHeight: 22,
    marginBottom: 16,
  },
  miniStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniStat: {
    flex: 1,
    alignItems: "center",
  },
  miniStatLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  miniStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  // Sections
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.cyan,
    fontFamily: "monospace",
    letterSpacing: 3,
  },
  sectionLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 8,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  tipBullet: {
    fontSize: 14,
    color: COLORS.cyan,
    fontFamily: "monospace",
    marginRight: 10,
    marginTop: 1,
    fontWeight: "bold",
  },
  tipText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    flex: 1,
    lineHeight: 22,
    fontFamily: "monospace",
  },

  // Forecast
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  forecastRowToday: {
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderBottomColor: COLORS.cyan + "33",
  },
  forecastDay: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: "monospace",
    width: 28,
    fontWeight: "bold",
  },
  forecastDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: "monospace",
    width: 50,
  },
  forecastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  forecastPhase: {
    fontSize: 12,
    fontFamily: "monospace",
    flex: 1,
  },
  forecastEnergy: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
});

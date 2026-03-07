import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { partners as api, Partner, CycleStatus } from "../services/api";
import { COLORS } from "../theme";

const ENERGY_LABELS: Record<string, string> = {
  low: "LOW",
  rising: "RISING",
  peak: "PEAK",
  declining: "DECLINING",
};

const ENERGY_COLORS: Record<string, string> = {
  low: COLORS.red,
  rising: COLORS.green,
  peak: COLORS.amber,
  declining: COLORS.violet,
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [partnerList, setPartnerList] = useState<Partner[]>([]);
  const [statuses, setStatuses] = useState<Record<number, CycleStatus>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const list = await api.list();
      setPartnerList(list);

      const statusMap: Record<number, CycleStatus> = {};
      for (const p of list) {
        try {
          statusMap[p.id] = await api.getStatus(p.id);
        } catch {}
      }
      setStatuses(statusMap);
    } catch (e: any) {
      Alert.alert("ОШИБКА", e.message);
    }
  }, []);

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
      <View style={styles.headerRow}>
        <Text style={styles.header}>DASHBOARD</Text>
        <Text style={styles.headerSub}>
          {partnerList.length} {partnerList.length === 1 ? "ЦЕЛЬ" : "ЦЕЛЕЙ"}
        </Text>
      </View>
      <View style={styles.headerLine} />

      {partnerList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>◎</Text>
          <Text style={styles.emptyText}>
            НЕТ АКТИВНЫХ ЦЕЛЕЙ{"\n"}Добавь партнёршу для мониторинга
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddPartner")}
          >
            <Text style={styles.addButtonText}>[ + ДОБАВИТЬ ЦЕЛЬ ]</Text>
          </TouchableOpacity>
        </View>
      ) : (
        partnerList.map((partner) => {
          const status = statuses[partner.id];
          const phaseColor = status
            ? COLORS.phases[status.phase] || COLORS.textMuted
            : COLORS.textMuted;
          const energyColor = status
            ? ENERGY_COLORS[status.energy] || COLORS.textMuted
            : COLORS.textMuted;

          return (
            <TouchableOpacity
              key={partner.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("PartnerDetail", { partnerId: partner.id })
              }
              activeOpacity={0.7}
            >
              {/* Top line accent */}
              <View style={[styles.cardAccent, { backgroundColor: phaseColor }]} />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.partnerName}>
                    {partner.name.toUpperCase()}
                  </Text>
                  {status && (
                    <View style={[styles.statusBadge, { borderColor: phaseColor }]}>
                      <Text style={[styles.statusBadgeText, { color: phaseColor }]}>
                        {status.phase_name.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {status ? (
                  <>
                    {/* Progress bar */}
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${(status.day_in_cycle / status.cycle_length) * 100}%`,
                            backgroundColor: phaseColor,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.statsRow}>
                      <View style={styles.stat}>
                        <Text style={styles.statLabel}>ДЕНЬ</Text>
                        <Text style={styles.statValue}>
                          {status.day_in_cycle}/{status.cycle_length}
                        </Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={styles.statLabel}>ЭНЕРГИЯ</Text>
                        <Text style={[styles.statValue, { color: energyColor }]}>
                          {ENERGY_LABELS[status.energy]}
                        </Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={styles.statLabel}>СЛЕД. ЦИКЛ</Text>
                        <Text style={styles.statValue}>
                          {status.days_until_next_period}д
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.moodText}>{status.mood}</Text>
                  </>
                ) : (
                  <Text style={styles.noData}>
                    ⚠ НЕТ ДАННЫХ — ДОБАВЬ ДАТУ НАЧАЛА ЦИКЛА
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {partnerList.length > 0 && (
        <TouchableOpacity
          style={styles.addMoreButton}
          onPress={() => navigation.navigate("AddPartner")}
        >
          <Text style={styles.addMoreText}>[ + ДОБАВИТЬ ЦЕЛЬ ]</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.cyan,
    fontFamily: "monospace",
    letterSpacing: 4,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  headerLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardAccent: {
    height: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: "monospace",
    letterSpacing: 2,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  moodText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "monospace",
    lineHeight: 20,
  },
  noData: {
    color: COLORS.amber,
    fontFamily: "monospace",
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 48,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "monospace",
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: COLORS.cyan,
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addButtonText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  addMoreButton: {
    padding: 16,
    alignItems: "center",
  },
  addMoreText: {
    color: COLORS.cyanDim,
    fontSize: 13,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
});

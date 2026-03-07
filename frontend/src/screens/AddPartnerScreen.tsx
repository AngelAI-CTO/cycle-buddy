import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { partners as api } from "../services/api";
import { COLORS } from "../theme";

export default function AddPartnerScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("ОШИБКА", "Введи имя цели");
      return;
    }
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("ОШИБКА", "Формат даты: ГГГГ-ММ-ДД");
      return;
    }

    setLoading(true);
    try {
      const partner = await api.create(
        name.trim(),
        parseInt(cycleLength) || 28,
        parseInt(periodLength) || 5
      );
      await api.addCycle(partner.id, startDate);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("ОШИБКА", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>НОВАЯ ЦЕЛЬ</Text>
      <View style={styles.divider} />

      <Text style={styles.label}>ИМЯ</Text>
      <TextInput
        style={styles.input}
        placeholder="Например: Аня"
        placeholderTextColor={COLORS.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>ДАТА НАЧАЛА ПОСЛЕДНИХ МЕСЯЧНЫХ</Text>
      <TextInput
        style={styles.input}
        placeholder="2026-03-01"
        placeholderTextColor={COLORS.textMuted}
        value={startDate}
        onChangeText={setStartDate}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>ДЛИНА ЦИКЛА (ДНЕЙ)</Text>
      <View style={styles.row}>
        {["25", "26", "27", "28", "29", "30", "31", "32"].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.chip, cycleLength === v && styles.chipActive]}
            onPress={() => setCycleLength(v)}
          >
            <Text
              style={[
                styles.chipText,
                cycleLength === v && styles.chipTextActive,
              ]}
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>ДЛИНА МЕСЯЧНЫХ (ДНЕЙ)</Text>
      <View style={styles.row}>
        {["3", "4", "5", "6", "7"].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.chip, periodLength === v && styles.chipActive]}
            onPress={() => setPeriodLength(v)}
          >
            <Text
              style={[
                styles.chipText,
                periodLength === v && styles.chipTextActive,
              ]}
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "ОБРАБОТКА..." : "[ СОХРАНИТЬ ]"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.cyan,
    fontFamily: "monospace",
    letterSpacing: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 12,
    marginBottom: 24,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 8,
    marginTop: 20,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    borderRadius: 4,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontFamily: "monospace",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontFamily: "monospace",
  },
  chipTextActive: {
    color: COLORS.bg,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: COLORS.cyan,
    borderRadius: 4,
    padding: 16,
    alignItems: "center",
    marginTop: 36,
    marginBottom: 40,
  },
  saveButtonText: {
    color: COLORS.bg,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
});
